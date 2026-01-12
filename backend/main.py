from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from ai_service import AIService
from model_engine import generate_synthetic_data # We will use this to generate demo data if needed
# from model_engine import predict_burnout # Uncomment when model_engine exposes this

app = FastAPI(title="Flourish AI Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
ai_service = AIService()

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

@app.post("/api/ai/tone-shield")
async def tone_shield(request: EmailRequest):
    """
    Analyzes email for aggression/toxicity and rewrites it to be neutral.
    Also flags invisible labor.
    """
    try:
        result = ai_service.analyze_email(request.content, request.sender)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
