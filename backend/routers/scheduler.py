from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os

from scheduler_app.database.db_manager import DBManager
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI
from scheduler_app.scheduler.logic import SchedulerEngine

router = APIRouter(prefix="/api/scheduler", tags=["Scheduler"])

# Initialize Singletons (Lazy loading or global)
# We initialize them here to persist state across requests (like DB connection pool logic if any)
db = DBManager(db_path="scheduler.db")
ai = GroqSchedulerAI()
engine = SchedulerEngine(db, ai)

# --- Models ---
class ChatRequest(BaseModel):
    message: str
    session_id: int

class SessionCreate(BaseModel):
    title: str = "New Chat"
    user_id: Optional[str] = None # Added user_id

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "Medium"
    estimated_hours: float = 1.0
    deadline: Optional[str] = ""

class EmployeeCreate(BaseModel):
    name: str
    role: str
    email: str
    weekly_hours_limit: int = 40

class ScheduleGenerateRequest(BaseModel):
    constraints: str = ""

# ...

@router.get("/sessions")
async def get_sessions(user_id: Optional[str] = None):
    """Get all chat sessions via user_id."""
    return db.get_all_sessions(user_id)

@router.post("/sessions")
async def create_session(session: SessionCreate):
    """Create a new chat session."""
    id = db.create_session(session.title, session.user_id)
    return {"id": id, "title": session.title}

@router.get("/sessions/{session_id}/history")
async def get_session_history(session_id: int):
    """Get history for a specific session."""
    return db.get_session_history(session_id)

@router.post("/sessions/clear")
async def clear_session(data: Dict[str, int] = Body(...)):
    """Delete a session."""
    session_id = data.get("session_id")
    if session_id:
        db.delete_session(session_id)
        return {"status": "deleted"}
    raise HTTPException(status_code=400, detail="session_id required")

# Tasks
@router.get("/tasks")
async def get_tasks(active_only: bool = True):
    """Get tasks (default: active only)."""
    if active_only:
        return db.get_all_active_tasks()
    return db.get_pending_tasks() # Or implement get_all_tasks in DBManager if needed

@router.post("/tasks")
async def add_task(task: TaskCreate):
    """Manually add a task."""
    id = db.add_task(task.title, task.description, task.priority, task.estimated_hours, task.deadline)
    return {"id": id, "message": "Task created"}

# Employees
@router.get("/employees")
async def get_employees():
    """Get all employees."""
    return db.get_all_employees()

@router.post("/employees")
async def add_employee(emp: EmployeeCreate):
    """Add a new employee."""
    id = db.add_employee(emp.name, emp.role, emp.email, emp.weekly_hours_limit)
    return {"id": id, "message": "Employee added"}

# Schedule
@router.post("/schedule/generate")
async def generate_schedule(req: ScheduleGenerateRequest):
    """Trigger AI schedule optimization."""
    result = engine.generate_and_save_schedule(req.constraints)
    if isinstance(result, dict) and "error" in result:
         raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/schedule")
async def get_schedule():
    """Get the current schedule (simulated query for now)."""
    # We need a method in DBManager to get the full schedule joined with tasks/employees
    # The existing app_gui.py did a raw SQL join. Let's replicate or add a method to DBManager.
    # For now, let's use raw SQL here or add a helper in DBManager. 
    # Adding a helper in router for now using the db connection context.
    
    query = """
    SELECT s.id, s.scheduled_day, s.start_time, s.end_time, e.name as emp_name, t.title as task_title, t.priority 
    FROM schedules s
    JOIN employees e ON s.employee_id = e.id
    JOIN tasks t ON s.task_id = t.id
    ORDER BY s.scheduled_day, s.start_time
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

