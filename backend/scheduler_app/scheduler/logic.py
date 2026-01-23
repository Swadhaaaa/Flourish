from typing import List, Dict, Any
from ..database.db_manager import DBManager
from ..ai_engine.groq_client import GroqSchedulerAI
from ..database.models import Employee, Task
import json

class SchedulerEngine:
    def __init__(self, db: DBManager, ai: GroqSchedulerAI):
        self.db = db
        self.ai = ai

    def generate_and_save_schedule(self, current_constraints: str = "") -> List[Dict[str, Any]]:
        # 1. Fetch Data
        employees = self.db.get_all_employees()
        # 1. Fetch Data
        employees = self.db.get_all_employees()
        # Fetch ALL active tasks (Pending and Scheduled) so we can re-optimize
        tasks = self.db.get_all_active_tasks()
        
        if not employees:
            return {"error": "No employees found. Please add employees first."}
        if not tasks:
            return {"error": "No tasks found (Pending or Scheduled). Add a task first."}

        # 2. Serialize for AI
        employees_data = [
            {"id": e.id, "name": e.name, "role": e.role, "weekly_limit": e.weekly_hours_limit}
            for e in employees
        ]
        
        tasks_data = []
        for t in tasks:
            t_data = {"id": t.id, "title": t.title, "priority": t.priority, "estimated_hours": t.estimated_hours, "deadline": t.deadline}
            # Add current schedule context
            current_sched = self.db.get_task_schedule(t.id)
            if current_sched:
                t_data["current_schedule"] = {
                    "day": current_sched["scheduled_day"],
                    "start": current_sched["start_time"],
                    "end": current_sched["end_time"]
                }
            tasks_data.append(t_data)

        # 3. AI Generation
        result = self.ai.generate_schedule_suggestion(tasks_data, employees_data, current_constraints)
        
        if "error" in result:
            return result

        schedule_list = result.get("schedule", [])
        
        # 4. Save to DB (and simulate "booking")
        saved_schedules = []
        for item in schedule_list:
            # Validate basic fields
            if "employee_id" in item and "task_id" in item:
                # Clear existing schedule first to avoid duplication
                self.db.clear_schedule_for_task(item["task_id"])
                
                # In a real app, we'd check conflicts here too before saving
                self.db.create_schedule(
                    item["employee_id"], 
                    item["task_id"], 
                    item.get("day", "Monday"), 
                    item.get("start_time", "09:00"), 
                    item.get("end_time", "17:00")
                )
                
                # Update task status to In Progress (or Scheduled)
                self.db.update_task_status(item["task_id"], "Scheduled")
                saved_schedules.append(item)
                
        return saved_schedules

    def handle_user_message(self, user_text: str, session_id: int, user_id: int = 1) -> Dict[str, Any]:
        """
        Handles a message from the chatbot UI.
        1. Checks for Private/Command mode.
        2. Retrieves history for SPECIFIC session.
        3. Calls AI.
        4. Logs interaction (unless private).
        5. Executes actions.
        6. Returns response text.
        """
        # 1. Command Handling
        if user_text.strip().lower() == "/private on":
            self.db.set_user_preference("private_mode", "true")
            return {"response": "🔒 Private mode ENABLED. Your chats will not be saved.", "action_performed": "command"}
        if user_text.strip().lower() == "/private off":
            self.db.set_user_preference("private_mode", "false")
            return {"response": "🔓 Private mode DISABLED. Memory active.", "action_performed": "command"}
        
        # Check Privacy
        is_private = self.db.get_user_preference("private_mode") == "true"
        
        # 2. Get Context
        history = self.db.get_recent_conversation(limit=5, session_id=session_id) if not is_private else []
        
        # Auto-Rename Session if it's "New Chat" (even if old messages exist)
        if not is_private:
             session = self.db.get_session(session_id)
             if session and session['title'] == 'New Chat':
                 # Use AI to generate a title from the current text
                 # We prefer to use the *first* message if history exists, 
                 # but calculating that is expensive/complex here. 
                 # Generating from the *current* user input is a good proxy 
                 # if it's the start, OR we can just try to summarize.
                 # Let's generate based on THIS message which is triggering the change.
                 new_title = self.ai.generate_title(user_text)
                 self.db.update_session_title(session_id, new_title)

        # 3. AI Processing
        prefs = {
            "coaching_mode": self.db.get_user_preference("coaching_mode"),
            "user_name": "User"
        }
        
        result = self.ai.process_conversation(user_text, history, prefs)
        
        response_text = result.get("response_text", "I'm listening.")
        action_type = result.get("internal_action")
        sentiment = result.get("sentiment")
        intent = result.get("intent")
        
        # 4. Log Interaction
        if not is_private:
            self.db.log_message("user", user_text, session_id, sentiment=sentiment, intent=intent)
            self.db.log_message("assistant", response_text, session_id)
            
            if intent == "wellness_check" or sentiment == "stressed":
                self.db.log_wellness(
                    stress_level=result.get("stress_score", 5),
                    mood=sentiment,
                    notes=user_text
                )
        
        # 5. Execute Action
        if action_type == "add_task":
            details = result.get("action_details", {})
            task_id = self.db.add_task(
                title=details.get("title", "New Task"),
                description=details.get("description", ""),
                priority=details.get("priority", "Medium"),
                estimated_hours=details.get("estimated_hours", 1.0),
                deadline=details.get("deadline", "")
            )
            
            fixed = details.get("fixed_schedule")
            if fixed and isinstance(fixed, dict):
                day = fixed.get("day", "Monday")
                start = fixed.get("start_time", "09:00")
                end = fixed.get("end_time")
                if not end:
                    try:
                        h = int(start.split(':')[0])
                        dur = int(details.get("estimated_hours", 1))
                        end = f"{h+dur:02d}:00"
                    except:
                        end = "10:00"
                self.db.create_schedule(user_id, task_id, day, start, end)
                self.db.update_task_status(task_id, "Scheduled")
            
        elif action_type == "manage_schedule":
            pass
            
        return {
            "response": response_text,
            "action_performed": action_type,
            "action_details": result.get("action_details")
        }
