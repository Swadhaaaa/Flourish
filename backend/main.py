from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from ai_service import AIService
from events_service import EventsService
from scraper_service import scrape_events

load_dotenv()
from model_engine import generate_synthetic_data # We will use this to generate demo data if needed
# from model_engine import predict_burnout # Uncomment when model_engine exposes this

import uvicorn
import socketio

app = FastAPI(title="Flourish AI Backend", version="1.0.0")

# --- Socket.io Setup ---
# Explicitly define origins for both FastAPI and Socket.io
ALLOWED_ORIGINS = [
    "https://flourishh.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

# Set Socket.io to handle its own CORS (we will exclude it from FastAPI middleware)
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=ALLOWED_ORIGINS)
# We will wrap the app at the bottom of the file to ensure all routes are registered.

@sio.event
async def connect(sid, environ):
    print(f"User connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"User disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get('chatId')
    if room:
        await sio.enter_room(sid, room)
        print(f"User {sid} joined room: {room}")

@sio.event
async def send_message(sid, data):
    room = data.get('chatId')
    if room:
        # Broadcast the message to everyone in the room except the sender
        await sio.emit('receive_message', data, room=room, skip_sid=sid)
        print(f"Message from {sid} broadcast to room {room}")

@sio.event
async def typing(sid, data):
    room = data.get('chatId')
    if room:
        await sio.emit('user_typing', data, room=room, skip_sid=sid)

@sio.event
async def stop_typing(sid, data):
    room = data.get('chatId')
    if room:
        await sio.emit('user_stop_typing', data, room=room, skip_sid=sid)

from routers.scheduler import router as scheduler_router
app.include_router(scheduler_router)

# Custom CORS Middleware that skips Socket.io to prevent duplicate headers
@app.middleware("http")
async def custom_cors_middleware(request, call_next):
    # If it's a Socket.io request, SKIP this middleware and let sio handle it
    if request.url.path.startswith("/socket.io"):
        return await call_next(request)
    
    # Handle preflight OPTIONS requests for API
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            from fastapi.responses import Response
            return Response(
                content="OK",
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Private-Network": "true",
                }
            )
        return await call_next(request)

    # Standard path: Add CORS headers to the response
    response = await call_next(request)
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Standard CORSMiddleware removed to prevent global duplication

# Private network header handled inside custom_cors_middleware

# Initialize Services
ai_service = AIService()
events_service = EventsService()

# --- Models ---
class EmailRequest(BaseModel):
    content: str
    sender: str
    context: Optional[str] = None

class BoundaryRequest(BaseModel):
    tone: str = "polite" # polite, firm, urgent
    context: str

class WorkloadData(BaseModel):
    tasks_count: int
    meetings_hours: float
    energy_level: str

# --- Routes ---

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Flourish AI Brain is active"}

from routers.tone_shield import router as tone_shield_router
app.include_router(tone_shield_router)

@app.post("/api/ai/boundary-defense")
async def boundary_defense(request: BoundaryRequest):
    """
    Generates a boundary-setting response.
    """
    response = ai_service.generate_boundary(request.context, request.tone)
    return {"reply": response}

@app.post("/api/ai/reflect")
async def reflection_coach(data: WorkloadData):
    """
    Generates dynamic reflection questions based on workload.
    """
    questions = ai_service.generate_reflection_prompts(data.tasks_count, data.meetings_hours)
    return {"prompts": questions}

@app.get("/api/ai/boundary-check")
async def boundary_check():
    """
    Simulates the 'Scheduler' checking for after-hours intrusions.
    Hardcoded 'simulation' data for the demo showing 19:30 PM and 4 new messages.
    """
    # DEMO: We simulate that it is 7:30 PM and user has 4 unread messages
    # In real app: We would fetch this from Gmail/Outlook API
    simulated_hour = 19 
    simulated_messages = 4
    
    result = ai_service.check_boundary_intrusion(simulated_messages, simulated_hour)
    return result

@app.get("/api/ai/workload-insight")
async def workload_insight():
    """
    Simulates checking the user's Todo list and Calendar for tomorrow.
    Hardcoded simulation: 3 high priority tasks, 5 hours of meetings.
    """
    simulated_priority_tasks = 4
    simulated_meeting_hours = 5.0
    
    result = ai_service.get_workload_insight(simulated_priority_tasks, simulated_meeting_hours)
    return result

class ScheduleRequest(BaseModel):
    text: str

@app.post("/api/ai/auto-schedule")
async def auto_schedule(request: ScheduleRequest):
    """
    Takes unstructured text and returns a structured, energy-optimized schedule.
    """
    return ai_service.generate_auto_schedule(request.text)

# --- Burnout Prediction ---
from burnout_service import BurnoutPredictor

burnout_predictor = BurnoutPredictor()

@app.post("/api/ai/burnout-prediction")
async def predict_burnout(data: dict = Body(...)):
    """
    Predicts burnout risk based on user profile data.
    """
    try:
        return burnout_predictor.predict(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ReflectionRequest(BaseModel):
    text: str

@app.post("/api/ai/analyze-reflection")
async def analyze_reflection(request: ReflectionRequest):
    """
    Analyzes unstructured text to auto-fill assessment metrics.
    """
    return ai_service.analyze_work_reflection(request.text)

# --- Invisible Labor & Community ---
from invisible_service import InvisibleLaborAnalyzer
from community_service import CommunityMatcher

invisible_analyzer = InvisibleLaborAnalyzer()
community_matcher = CommunityMatcher()

class LaborRequest(BaseModel):
    task_description: str

@app.post("/api/ai/invisible-labor")
async def analyze_labor(request: LaborRequest):
    """
    Analyzes a task to determine if it is 'invisible labor' or 'promotable'.
    """
    return invisible_analyzer.analyze(request.task_description)

@app.post("/api/community/match")
async def match_community(data: dict = Body(...)):
    """
    Matches a user with a 'Sisterhood' mentor/peer based on profile.
    """
    return community_matcher.match_user(data)

class NotificationRequest(BaseModel):
    recipient_email: str
    sender_name: str
    sender_role: str
    type: str = "connection_request"

@app.post("/api/notifications/connection-request")
async def send_connection_notification(request: NotificationRequest):
    """
    Sends an email notification for a new connection request.
    """
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")

    if not sender_email or not sender_password:
        return {"status": "error", "message": "Email credentials not configured"}

    subject = f"New Sisterhood Connection Request from {request.sender_name}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f43f5e;">Sisterhood Connection Request</h2>
            <p>Hi there,</p>
            <p><strong>{request.sender_name}</strong> ({request.sender_role}) would like to connect with you in the Sisterhood network!</p>
            <p>Head over to the app to accept the request and start a secure, encrypted conversation.</p>
            <div style="margin: 30px 0;">
                <a href="#" style="background-color: #f43f5e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
            </div>
            <p style="font-size: 12px; color: #888;">Empowering women through professional support and mental well-being.</p>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = request.recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return {"status": "success", "message": "Notification sent"}
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/events/nearby")
async def get_nearby_events(lat: float = 40.7128, long: float = -74.0060, category: str = None):
    """
    Fetches nearby events from Eventbrite/Ticketmaster or Mock data.
    """
    return events_service.get_nearby_events(lat, long, category)

class PeriodInsightRequest(BaseModel):
    day: int
    phase: str
    symptoms: List[str]
    mood: str

@app.post("/api/ai/period-insight")
async def period_insight(request: PeriodInsightRequest):
    """
    Generates a personalized daily insight based on cycle data.
    """
    try:
        # We reuse the chat interface for now, or use a specific method if implemented
        insight_data = ai_service.generate_period_insight(request.day, request.phase, request.symptoms, request.mood)
        if isinstance(insight_data, dict):
            return insight_data
        return {"insight": insight_data}
    except Exception as e:
        # Fallback if AI fails
        print(f"AI Generation Failed: {e}")
        return {"insight": f"Day {request.day} ({request.phase}): Listen to your body and prioritize rest if needed."}


import httpx

@app.get("/api/ridesync/geocode")
async def geocode_proxy(q: str):
    """Proxy for Nominatim OpenStreetMap to avoid CORS issues from browser."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"format": "json", "q": q, "limit": 1, "countrycodes": "in"},
            headers={"User-Agent": "SafeCab-Demo/1.0"}
        )
    return resp.json()

@app.get("/api/ridesync/route")
async def osrm_proxy(lon1: float, lat1: float, lon2: float, lat2: float):
    """Proxy for OSRM routing to avoid CORS issues from browser."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}",
            params={"overview": "full", "geometries": "geojson"}
        )
    return resp.json()

class ScoutRequest(BaseModel):
    pickup: str
    dropoff: str
    distance_km: float

@app.post("/api/ridesync/scout")
async def scout_rides_endpoint(request: ScoutRequest):
    results = ai_service.scout_rides(request.pickup, request.dropoff, request.distance_km)
    return {"results": results}

class EmailShareRequest(BaseModel):
    to_email: str
    message: str

@app.post("/api/ridesync/share")
async def ridesync_share(request: EmailShareRequest):
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")

    if not sender_email or not sender_password:
        print(f"[MOCK EMAIL] to={request.to_email} | {request.message}")
        return {"status": "success", "message": "Email simulated (no credentials set)"}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🚨 SafeCab Live Tracking Alert"
        msg["From"] = f"SafeCab Safety <{sender_email}>"
        msg["To"] = request.to_email

        html_body = f"""
        <html><body style="font-family:sans-serif;background:#fff0e5;padding:20px">
          <div style="max-width:480px;margin:auto;background:white;border-radius:24px;padding:32px;border:2px solid #ef4444">
            <h2 style="color:#ef4444;margin-top:0">🛡️ SafeCab Live Alert</h2>
            <p style="color:#555;font-size:15px">{request.message}</p>
            <hr style="border:none;border-top:1px solid #ffe4e1;margin:20px 0"/>
            <p style="color:#aaa;font-size:12px">Sent automatically by SafeCab Safety System.</p>
          </div>
        </body></html>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, request.to_email, msg.as_string())

        return {"status": "success", "message": "Email sent successfully!"}
    except Exception as e:
        print(f"Email error: {e}")
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")


# ─── EVENT SCRAPER ENDPOINT ───────────────────────────────────────────────────
@app.get("/api/events/scrape")
async def scrape_events_endpoint(city: str = "Mumbai", category: str = None):
    """
    Scrapes real, current hobby/activity events from Meetup.com and insider.in
    for any city entered by the user. Falls back to city-specific generated events.
    """
    try:
        cat = None if (not category or category == "All") else category
        events = scrape_events(city, cat)
        return events
    except Exception as e:
        print(f"Scraper endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount Socket.io ASGI app into FastAPI
# This ensures that /socket.io/ requests are handled by Socket.io
# while keeping 'app' as the FastAPI instance for Render/Gunicorn.
app.mount("/socket.io", socketio.ASGIApp(sio, socketio_path=""))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
