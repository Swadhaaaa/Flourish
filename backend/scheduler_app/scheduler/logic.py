from typing import List, Dict, Any
from ..database.db_manager import DBManager
from ..ai_engine.groq_client import GroqSchedulerAI
from ..database.models import Employee, Task
import json

class SchedulerEngine:
    def __init__(self, db: DBManager, ai: GroqSchedulerAI):
        self.db = db
        self.ai = ai

    def generate_and_save_schedule(self, current_constraints: str = "", user_id: str = "1") -> List[Dict[str, Any]]:
        # 1. Fetch Data
        employees = self.db.get_all_employees(user_id=user_id)
        # Fetch ALL active tasks (Pending and Scheduled) so we can re-optimize
        tasks = self.db.get_all_active_tasks(user_id=user_id)
        
        # AUTO-CREATE default employee for individual users if none exist for THIS user
        if not employees:
            default_emp_id = self.db.add_employee(
                name="Me",
                role="Individual User",
                email="user@flourish.app",
                weekly_hours_limit=40,
                user_id=user_id
            )
            employees = self.db.get_all_employees(user_id=user_id)
            
        if not tasks:
            return {"error": "No tasks found. Add a task first by saying something like 'Add task: Review presentation'."}

        # FORCE SINGLE PLAYER MODE (User Request: "assign to me only")
        # We only pass the first employee to the AI, forcing it to assign everything to them.
        employees = employees[:1]

        # 2. Serialize for AI
        employees_data = [
            {"id": str(e.id), "name": e.name, "role": e.role, "weekly_limit": e.weekly_hours_limit}
            for e in employees
        ]
        
        # Create lookup map for denormalization
        tasks_map = {str(t.id): t for t in tasks}
        
        tasks_data = []
        for t in tasks:
            t_data = {"id": str(t.id), "title": t.title, "priority": t.priority, "estimated_hours": t.estimated_hours, "deadline": t.deadline}
            # Add current schedule context
            current_sched = self.db.get_task_schedule(t.id, user_id=user_id)
            if current_sched:
                t_data["current_schedule"] = {
                    "day": current_sched["scheduled_day"],
                    "start": current_sched["start_time"],
                    "end": current_sched["end_time"]
                }
            tasks_data.append(t_data)

        # 3. AI Generation
        print(f"DEBUG: Input to AI Tasks: {json.dumps(tasks_data)}")
        result = self.ai.generate_schedule_suggestion(tasks_data, employees_data, current_constraints)
        print(f"DEBUG: AI Result: {result}")
        
        if "error" in result:
            return result

        schedule_list = result.get("schedule", [])
        print(f"DEBUG: Schedule List from AI: {schedule_list}")
        
        # Get the default employee ID (for individual users)
        default_emp = employees[0] if employees else None
        default_emp_id = str(default_emp.id) if default_emp else "1"
        default_emp_name = default_emp.name if default_emp else "Me"
        
        # 4. Save to DB (and simulate "booking")
        saved_schedules = []
        for item in schedule_list:
            # Validate basic fields - task_id is required
            print(f"DEBUG: Processing item: {item}")
            if "task_id" in item:
                task_id = str(item["task_id"])
                # Clear existing schedule first to avoid duplication
                self.db.clear_schedule_for_task(task_id, user_id=user_id)
                
                # Get task details
                task_obj = tasks_map.get(task_id)
                t_title = task_obj.title if task_obj else "Task"
                t_priority = task_obj.priority if task_obj else "Medium"
                
                # Always use the default employee (for individual user mode)
                self.db.create_schedule(
                    default_emp_id,  # Force use of default employee
                    task_id, 
                    item.get("day", "Monday"), 
                    item.get("start_time", "09:00"), 
                    item.get("end_time", "17:00"),
                    task_title=t_title,
                    emp_name=default_emp_name,
                    priority=t_priority,
                    user_id=user_id
                )
                print(f"DEBUG: Saved schedule for task {task_id}")
                
                # Update task status to In Progress (or Scheduled)
                # Need to use update_task_status_with_user or update_task_status if updated
                if hasattr(self.db, 'update_task_status_with_user'):
                    self.db.update_task_status_with_user(task_id, "Scheduled", user_id)
                else:
                    self.db.update_task_status(task_id, "Scheduled") # Fallback
                    
                saved_schedules.append(item)
                
        return saved_schedules

    def handle_user_message(self, user_text: str, session_id: int, user_id: str = "1") -> Dict[str, Any]:
        """
        Handles a message from the chatbot UI.
        Returns: { "text": response_text, "action": action_type, "details": optional_details }
        """
        # 1. Command Handling
        if user_text.strip().lower() == "/private on":
            self.db.set_user_preference("private_mode", "true", user_id=user_id)
            return {"text": "🔒 Private mode ENABLED. Your chats will not be saved.", "action": "command"}
        if user_text.strip().lower() == "/private off":
            self.db.set_user_preference("private_mode", "false", user_id=user_id)
            return {"text": "🔓 Private mode DISABLED. Memory active.", "action": "command"}
        
        # Check Privacy
        is_private = self.db.get_user_preference("private_mode", user_id=user_id) == "true"
        
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
            "coaching_mode": self.db.get_user_preference("coaching_mode", user_id=user_id),
            "user_name": "User"
        }
        
        result = self.ai.process_conversation(user_text, history, prefs)
        
        response_text = result.get("response_text") or result.get("response") or "I'm listening."
        action_type = result.get("internal_action") or result.get("action_performed")
        sentiment = result.get("sentiment")
        intent = result.get("intent")
        
        # 4. Log Interaction (Session based, no user_id needed for logs if session is owned)
        if not is_private:
            self.db.log_message("user", user_text, session_id, sentiment=sentiment, intent=intent)
            self.db.log_message("assistant", response_text, session_id)
            
            if intent == "wellness_check" or sentiment == "stressed":
                self.db.log_wellness(
                    stress_level=result.get("stress_score", 5),
                    mood=sentiment,
                    notes=user_text,
                    user_id=user_id
                )
        
        # 5. Execute Action
        if action_type == "add_task":
            details = result.get("action_details", {})
            task_id = self.db.add_task(
                title=details.get("title", "New Task") if isinstance(details, dict) else getattr(details, "title", "New Task"),
                description=details.get("description", "") if isinstance(details, dict) else getattr(details, "description", ""),
                priority=details.get("priority", "Medium") if isinstance(details, dict) else getattr(details, "priority", "Medium"),
                estimated_hours=details.get("estimated_hours", 1.0) if isinstance(details, dict) else getattr(details, "estimated_hours", 1.0),
                deadline=details.get("deadline", "") if isinstance(details, dict) else getattr(details, "deadline", ""),
                user_id=user_id
            )
            
            fixed = details.get("fixed_schedule") if isinstance(details, dict) else getattr(details, "fixed_schedule", None)
            if fixed:
                day = fixed.get("day", "Monday") if isinstance(fixed, dict) else getattr(fixed, "day", "Monday")
                start = fixed.get("start_time", "09:00") if isinstance(fixed, dict) else getattr(fixed, "start_time", "09:00")
                end = fixed.get("end_time") if isinstance(fixed, dict) else getattr(fixed, "end_time", None)
                if not end:
                    try:
                        h = int(start.split(':')[0])
                        dur = int(details.get("estimated_hours", 1))
                        end = f"{h+dur:02d}:00"
                    except:
                        end = "10:00"
                
                # Fetch default employee for user
                employees = self.db.get_all_employees(user_id)
                emp_id = str(employees[0].id) if employees else "1"
                emp_name = employees[0].name if employees else "Me"
                
                self.db.create_schedule(
                    emp_id, 
                    str(task_id), 
                    day, 
                    start, 
                    end, 
                    task_title=details.get("title", "New Task"), 
                    emp_name=emp_name, 
                    priority=details.get("priority", "Medium"),
                    user_id=user_id
                )
                
                if hasattr(self.db, 'update_task_status_with_user'):
                    self.db.update_task_status_with_user(str(task_id), "Scheduled", user_id)
                else:
                    self.db.update_task_status(str(task_id), "Scheduled")
            
        elif action_type == "optimize_schedule":
            # Constraint could be extracted from user text if needed, but for now we run default
            res = self.generate_and_save_schedule(current_constraints=user_text, user_id=user_id)
            if isinstance(res, dict) and "error" in res:
                 response_text = f"I couldn't plan the schedule yet. {res['error']}"
            else:
                 response_text = "I've optimized your schedule! You can view it in the Calendar tab. 📅"

        elif action_type == "manage_schedule":
            pass

        elif action_type == "delete_task":
            details = result.get("action_details", {})
            title = details.get("title")
            if title:
                # 1. Try strict match
                task = self.db.find_task_by_title(title, user_id=user_id)
                
                # 2. Fuzzy/Case-insensitive search if strict failed
                if not task:
                    all_tasks = self.db.get_all_active_tasks(user_id=user_id)
                    # Find candidates where title appears in task title (case insensitive)
                    candidates = [t for t in all_tasks if title.lower() in t.title.lower()]
                    
                    if len(candidates) == 1:
                        task = candidates[0]
                    elif len(candidates) > 1:
                        names = ", ".join([f"'{t.title}'" for t in candidates])
                        response_text = f"I found multiple tasks matching '{title}': {names}. Which one did you mean?"
                        return { "text": response_text, "response": response_text, "action": action_type, "action_performed": action_type }
                
                if task:
                    self.db.delete_task(task.id, user_id=user_id)
                    response_text = f"I've removed the task '{task.title}' from your list."
                else:
                    response_text = f"I couldn't find a task named '{title}'. Please check the name."
            else:
                response_text = "Please specify the name of the task you want to delete."
            
        return {
            "text": response_text, 
            "response": response_text,
            "action": action_type,
            "action_performed": action_type
        }
