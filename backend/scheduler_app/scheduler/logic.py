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
        # Fetch ALL active tasks (Pending and Scheduled) so we can re-optimize
        tasks = self.db.get_all_active_tasks()
        
        # AUTO-CREATE default employee for individual users
        if not employees:
            default_emp_id = self.db.add_employee(
                name="Me",
                role="Individual User",
                email="user@flourish.app",
                weekly_hours_limit=40
            )
            employees = self.db.get_all_employees()
            
        if not tasks:
            return {"error": "No tasks found. Add a task first by saying something like 'Add task: Review presentation'."}

        # FORCE SINGLE PLAYER MODE (User Request: "assign to me only")
        # We only pass the first employee to the AI, forcing it to assign everything to them.
        employees = employees[:1]

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
        
        # Get the default employee ID (for individual users)
        default_emp_id = employees[0].id if employees else 1
        
        # 4. Save to DB (and simulate "booking")
        saved_schedules = []
        for item in schedule_list:
            # Validate basic fields - task_id is required
            if "task_id" in item:
                # Clear existing schedule first to avoid duplication
                self.db.clear_schedule_for_task(item["task_id"])
                
                # Always use the default employee (for individual user mode)
                self.db.create_schedule(
                    default_emp_id,  # Force use of default employee
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
        Returns: { "text": response_text, "action": action_type, "details": optional_details }
        """
        # 1. Command Handling
        if user_text.strip().lower() == "/private on":
            self.db.set_user_preference("private_mode", "true")
            return {"text": "🔒 Private mode ENABLED. Your chats will not be saved.", "action": "command"}
        if user_text.strip().lower() == "/private off":
            self.db.set_user_preference("private_mode", "false")
            return {"text": "🔓 Private mode DISABLED. Memory active.", "action": "command"}
        
        # Check Privacy
        is_private = self.db.get_user_preference("private_mode") == "true"
        
        # 2. Get Context
        history = self.db.get_recent_conversation(limit=5, session_id=session_id) if not is_private else []
        
        # Auto-Rename Session if it's "New Chat" (even if old messages exist)
        if not is_private:
             session = self.db.get_session(session_id)
             if session and session['title'] == 'New Chat':
                 new_title = self.ai.generate_title(user_text)
                 self.db.update_session_title(session_id, new_title)

        # 3. AI Processing
        prefs = {
            "coaching_mode": self.db.get_user_preference("coaching_mode"),
            "user_name": "User"
        }
        
        result = self.ai.process_conversation(user_text, history, prefs)
        
        response_text = result.get("response_text") or result.get("response") or "I'm listening."
        action_type = result.get("internal_action") or result.get("action_performed")
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
            
        elif action_type == "optimize_schedule":
            # Constraint could be extracted from user text if needed, but for now we run default
            res = self.generate_and_save_schedule(current_constraints=user_text)
            if isinstance(res, dict) and "error" in res:
                 response_text = f"I couldn't plan the schedule yet. {res['error']}"
            else:
                 response_text = "I've optimized your schedule! You can view it in the Calendar tab. 📅"

        elif action_type == "manage_schedule":
            pass
            
        return {"text": response_text, "action": action_type}
