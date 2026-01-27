from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
import os

# from scheduler_app.database.db_manager import DBManager
from scheduler_app.database.firestore_manager import FirestoreManager
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI
from scheduler_app.scheduler.logic import SchedulerEngine

router = APIRouter(prefix="/api/scheduler", tags=["Scheduler"])

# Initialize Singletons (Lazy loading or global)
# We initialize them here to persist state across requests (like DB connection pool logic if any)
# db = DBManager(db_path="scheduler.db")
db = FirestoreManager() # Firestore
ai = GroqSchedulerAI()
engine = SchedulerEngine(db, ai)

# --- Models ---
# ... (Imports same) ...
class ChatRequest(BaseModel):
    message: str
    session_id: Union[str, int] # Changed to allow int or str
    user_id: str = "1" # Added user_id

@router.post("/chat")
async def chat(request: ChatRequest):
    """Handle chat interaction."""
    # Pass request.user_id
    result = engine.handle_user_message(request.message, request.session_id, user_id=request.user_id)
    return result

class SessionCreate(BaseModel):
    title: str = "New Chat"
    user_id: str = "1" # Made default but expected

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "Medium"
    estimated_hours: float = 1.0
    deadline: Optional[str] = ""
    user_id: str = "1"

class EmployeeCreate(BaseModel):
    name: str
    role: str
    email: str
    weekly_hours_limit: int = 40
    user_id: str = "1"

class ScheduleGenerateRequest(BaseModel):
    constraints: str = ""
    user_id: str = "1"

@router.get("/sessions")
async def get_sessions(user_id: str = "1"):
    """Get all chat sessions via user_id."""
    return db.get_all_sessions(user_id)

@router.post("/sessions")
async def create_session(session: SessionCreate):
    """Create a new chat session."""
    id = db.create_session(session.title, session.user_id)
    return {"id": id, "title": session.title}

@router.get("/sessions/{session_id}/history")
async def get_session_history(session_id: str, user_id: str = "1"):
    """Get history for a specific session."""
    return db.get_session_history(session_id, user_id)

@router.post("/sessions/clear")
async def clear_session(data: Dict[str, Any] = Body(...)):
    """Delete a session."""
    session_id = data.get("session_id")
    user_id = data.get("user_id", "1")
    if session_id:
        db.delete_session(str(session_id), user_id)
        return {"status": "deleted"}
    raise HTTPException(status_code=400, detail="session_id required")

# Tasks
@router.get("/tasks")
async def get_tasks(active_only: bool = True, user_id: str = "1"):
    """Get tasks (default: active only)."""
    if active_only:
        return db.get_all_active_tasks(user_id)
    return db.get_pending_tasks(user_id)

@router.post("/tasks")
async def add_task(task: TaskCreate):
    """Manually add a task."""
    id = db.add_task(task.title, task.description, task.priority, task.estimated_hours, task.deadline, task.user_id)
    return {"id": id, "message": "Task created"}

# Employees
@router.get("/employees")
async def get_employees(user_id: str = "1"):
    """Get all employees."""
    return db.get_all_employees(user_id)

@router.post("/employees")
async def add_employee(emp: EmployeeCreate):
    """Add a new employee."""
    id = db.add_employee(emp.name, emp.role, emp.email, emp.weekly_hours_limit, emp.user_id)
    return {"id": id, "message": "Employee added"}

# Schedule
@router.post("/schedule/generate")
async def generate_schedule(req: ScheduleGenerateRequest):
    """Trigger AI schedule optimization."""
    # We need to update engine.generate_and_save_schedule to accept user_id
    # Temporarily assuming I'll update logic.py next
    result = engine.generate_and_save_schedule(req.constraints, user_id=req.user_id)
    if isinstance(result, dict) and "error" in result:
         raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/schedule")
async def get_schedule(user_id: str = "1"):
    """Get the current schedule."""
    # Fetch schedules from Firestore
    # We ideally want task titles and employee names. 
    # For Hackathon speed: Fetch all schedules, then fetch tasks/employees in one go or just IDs?
    # Better: Update logic.py to save names in schedule. 
    # Logic update is next. Here we assume schedule objects have names if possible, or frontend handles IDs.
    
    # Actually, let's just return the schedule objects. 
    # If the frontend needs names, it might look them up from the 'tasks' list it also loads?
    # Scheduler.tsx loads tasks too? No.
    # We will try to fetch metadata.
    
    schedules = []
    docs = db._user_ref(user_id).collection('schedules').stream()
    
    # Optimize: Fetch all tasks/employees once?
    # Simpler: Just resolve IDs if feasible, or expect denormalized data.
    # I will assume I DENORMALIZE in logic.py.
    
    for doc in docs:
        s = doc.to_dict()
        s['id'] = doc.id
        schedules.append(s)
    
    # Sort by day/time (manual sort since Firestore query limitations on multiple fields maybe)
    # Day mapping: Monday=0 etc? Or just alphabetical?
    # Logic uses "Monday" etc. 
    # We'll just return list.
    return schedules

# Updates
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    deadline: Optional[str] = None
    user_id: str = "1"

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskUpdate):
    """Update task details."""
    updates = task.model_dump(exclude_unset=True)
    
    # Remove user_id from updates dict as it's not a field to update in the doc generally (or handled separately)
    # The TaskUpdate model has user_id defaults to "1", we use it to find the collection but maybe shouldn't update the field itself unless intentional.
    # Usually user_id doesn't change.
    uid = updates.pop("user_id", "1")
    
    # Ensure we don't accidentally update nulls if exclude_unset didn't catch (it should though)
    
    # Perform update using direct Firestore access for now
    # Ideally move this to FirestoreManager.update_task(task_id, updates, user_id)
    db._user_ref(uid).collection('tasks').document(task_id).update(updates)
    
    return {"message": "Task updated"}

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user_id: str = "1"):
    """Delete a task."""
    db.delete_task(task_id, user_id)
    return {"message": "Task deleted"}

class ScheduleUpdate(BaseModel):
    start_time: str
    end_time: str
    scheduled_day: Optional[str] = None
    user_id: str = "1"

@router.put("/schedule/{schedule_id}")
async def update_schedule(schedule_id: str, sched: ScheduleUpdate):
    updates = {
        "start_time": sched.start_time,
        "end_time": sched.end_time
    }
    if sched.scheduled_day: updates["scheduled_day"] = sched.scheduled_day
    
    db._user_ref(sched.user_id).collection('schedules').document(schedule_id).update(updates)
    return {"message": "Schedule updated"}
