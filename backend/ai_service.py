import os
import random

# Mocking LangChain for now to ensure it runs without API Keys immediately.
# In a real scenario with keys, we would import:
# from langchain.chat_models import ChatOpenAI
# from langchain.prompts import PromptTemplate

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("Gemini_API_KEY")
        # self.llm = ChatOpenAI(temperature=0.7) if self.api_key else None

    def analyze_email(self, content: str, sender: str):
        """
        Detects tone and invisible labor.
        """
        # Mock Logic for Demo (so it "works" instantly)
        aggression_score = 0
        rewritten = content
        invisible_labor_flag = False
        
        lower_content = content.lower()
        
        # Heuristic detection
        if any(word in lower_content for word in ["asap", "urgent", "why isn't this done", "disappointed"]):
            aggression_score = 85
            rewritten = f"Hi,\n\nI'm following up on the status of this item. Please let me know when you have an update.\n\nBest,\n{sender}"
        
        if any(word in lower_content for word in ["snack", "party", "birthday", "organize", "notes"]):
            invisible_labor_flag = True
        
        return {
            "original": content,
            "rewritten": rewritten,
            "aggression_score": aggression_score,
            "is_toxic": aggression_score > 70,
            "is_invisible_labor": invisible_labor_flag,
            "analysis": "High hostility detected." if aggression_score > 70 else "Neutral tone."
        }

    def generate_boundary(self, context: str, tone: str):
        """
        Generates a polite but firm no.
        """
        # Dynamic templates
        if tone == "firm":
            return f"Thank you for thinking of me. Unfortunately, my current capacity does not allow me to take this on without compromising my existing deliverables ({context}). I must decline at this time."
        else:
            return f"Thanks for the invite! I'm currently heads-down on {context} and won't be able to join. Please send me the notes afterwards!"

    def generate_reflection_prompts(self, tasks: int, hours: float):
        """
        Generates context-aware questions.
        """
        prompts = []
        if tasks > 10 or hours > 5:
            prompts = [
                "You carried a heavy load today. What is one thing you can delegate tomorrow?",
                "Your energy seems depleted. How can you recharge for 10 minutes right now?",
                "Did you feel pressured to say 'yes' to anything today?"
            ]
        else:
            prompts = [
                "You had a balanced day. What went well?",
                "How did you honor your boundaries today?",
                "What gave you energy today?"
            ]
        return prompts

    def check_boundary_intrusion(self, message_count: int, current_hour: int):
        """
        Simulates reading the 'Scheduler' and 'Inbox' to detect intrusions.
        In real life, this would query Google Calendar/Gmail APIs.
        """
        # Logic: If it's late (after 7PM) and messages are piling up -> Red Alert
        status = "green"
        alert_title = "All Clear"
        recommendation = "You are maintaining healthy boundaries."

        if current_hour >= 19 and message_count > 3:
            status = "red"
            alert_title = "Critical Boundary Alert"
            recommendation = f"You received {message_count} messages after 7 PM. The AI recommends activating 'Auto-Response' to protect your rest."
        elif message_count > 5:
            status = "amber"
            alert_title = "High Noise Level"
            recommendation = "Incoming communication is high. Consider blocking 1 hour for deep work."
            
        return {
            "status": status,
            "title": alert_title,
            "message": recommendation,
            "can_automate_reply": status == "red"
        }

    def get_workload_insight(self, tasks_count: int, meeting_hours: float):
        """
        Analyzes calendar/todo list to provide a strategic insight.
        """
        priority_tasks = tasks_count  # Simulating high priority count
        
        if priority_tasks > 3 and meeting_hours > 4:
            return {
                "title": "AI Boundary Insight",
                "summary": f"Heavy Load Detected: {priority_tasks} Priority Tasks + {meeting_hours}h Meetings",
                "recommendation": "Consider rescheduling your afternoon meeting (2 PM) to create a block of focused time for deep work.",
                "action": "View Recommendations"
            }
        elif priority_tasks > 5:
             return {
                "title": "Capacity Alert",
                "message": f"Your task list is exceeding daily capacity ({priority_tasks} items). The AI suggests delegating the 'Project Update' to your team.",
                "action": "Suggest Delegation"
            }
        else:
             return {
                "title": "Focus Opportunity",
                "message": "Your schedule is relatively clear tomorrow. It's a great opportunity to block 2 hours for that strategic proposal you've been delaying.",
                "action": "Block Focus Time"
            }

    def generate_auto_schedule(self, text_input: str):
        """
        Parses unstructured text and organizes it by ENERGY LEVEL.
        Mocking the "Advanced" logic for the demo.
        """
        lower_text = text_input.lower()
        schedule = []
        
        # 1. Detect Deep Work (Peak Energy - Morning)
        if any(w in lower_text for w in ["report", "code", "strategy", "write", "plan", "focus"]):
            schedule.append({
                "time": "09:00 AM",
                "task": "Deep Work Block: Strategic Focus",
                "duration": "2h",
                "energy": "High",
                "type": "focus"
            })
        
        # 2. Detect Standard Work (Mid Energy - Late Morning)
        if any(w in lower_text for w in ["email", "review", "admin", "update"]):
             schedule.append({
                "time": "11:30 AM",
                "task": "Admin & Communications",
                "duration": "45m",
                "energy": "Medium",
                "type": "admin"
            })

        # 3. Always insert Recharge (Lunch)
        schedule.append({
            "time": "12:30 PM",
            "task": "Lunch & Disconnect",
            "duration": "1h",
            "energy": "Recharge",
            "type": "break"
        })

        # 4. Detect Meetings (Low Energy - Afternoon)
        if any(w in lower_text for w in ["meet", "call", "sync", "discuss", "zoom"]):
            schedule.append({
                "time": "02:00 PM",
                "task": "Collaborative Meetings",
                "duration": "1.5h",
                "energy": "Low",
                "type": "meeting"
            })
            
        # 5. Detect Physical/Personal (Recovery - Evening)
        if any(w in lower_text for w in ["gym", "run", "walk", "mom", "dinner", "errand"]):
             schedule.append({
                "time": "05:30 PM",
                "task": "Personal Wellbeing & Movement",
                "duration": "1h",
                "energy": "High",
                "type": "wellbeing"
            })
        
        # Fallback if text is too vague
        if len(schedule) <= 1: 
             schedule.append({
                "time": "10:00 AM",
                "task": "Productivity Block (Auto-Assigned)",
                "duration": "1h",
                "energy": "High",
                "type": "focus"
             })

        return {
             "original_text": text_input,
             "schedule": schedule,
             "analysis": "Optimized for Peak Performance: Heavy lifting scheduled for 9AM."
        }
