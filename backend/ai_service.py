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
    def analyze_work_reflection(self, text: str):
        """
        Analyzes a journal entry/reflection to infer quantitative metrics and qualitative insights.
        """
        import re
        lower_text = text.lower()
        
        # Base metrics (1-10 scale)
        metrics = {
            "StressLevel": 5,
            "JobSatisfaction": 6,
            "WorkLifeBalanceScore": 6,
            "SleepQuality": "Medium",
            "BurnoutRisk": "Low",
            "EmotionalExhaustion": 4, 
            "Depersonalization": 3,   
            "PersonalAccomplishment": 7,
            "WorkHoursPerWeek": 40,  # Default
            "SleepHours": 7.0        # Default
        }
        
        # --- Heuristic Analysis Dictionaries ---
        negative_keywords = [
            "terrible", "burnout", "awful", "hate", "quit", "crying", "anxious", "anxiety", 
            "panic", "drowning", "overwhelmed", "hopeless", "can't cope", "dread"
        ]
        
        exhaustion_keywords = [
            "tired", "exhausted", "exhausting", "busy", "long hours", "overtime", 
            "deadlines", "pressure", "drained", "fatigue", "no energy", "depleted"
        ]
        
        positive_keywords = [
            "great", "love", "excited", "happy", "win", "accomplished", "proud", 
            "grateful", "connection", "supported", "energized", "flow", "learning"
        ]
        
        sleep_negative_keywords = [
            "insomnia", "awake", "couldn't sleep", "barely sleep", "restless", "woke up"
        ]

        detachment_keywords = [
            "don't care", "numb", "cynical", "whatever", "boring", "useless", 
            "pointless", "robot", "going through motions"
        ]

        # --- Regex Extraction for Hours ---
        # Look for patterns like "10 hours", "9-10 hours", "6 hrs"
        work_hours_match = re.search(r'(\d+)(?:-(\d+))?\s*(?:hours?|hrs?)\s*(?:a day|daily|work)', lower_text)
        if work_hours_match:
            # If range "9-10", take average. If single "10", take value.
            val = float(work_hours_match.group(1))
            if work_hours_match.group(2):
                val = (val + float(work_hours_match.group(2))) / 2
            
            # Convert daily to weekly if detected (assuming 5 days)
            # Simple heuristic: if < 16, assume daily. If > 20, assume weekly.
            if val < 16:
                 metrics["WorkHoursPerWeek"] = val * 5
            else:
                 metrics["WorkHoursPerWeek"] = val

        sleep_hours_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:sleep|night)', lower_text)
        if sleep_hours_match:
             metrics["SleepHours"] = float(sleep_hours_match.group(1))

        # --- Scoring Logic ---
        
        # Check specific keyword counts
        neg_count = sum(1 for w in negative_keywords if w in lower_text)
        exh_count = sum(1 for w in exhaustion_keywords if w in lower_text)
        pos_count = sum(1 for w in positive_keywords if w in lower_text)
        sleep_count = sum(1 for w in sleep_negative_keywords if w in lower_text)
        detach_count = sum(1 for w in detachment_keywords if w in lower_text)

        # Update Metrics based on counts
        if neg_count > 0 or exh_count > 0:
            metrics["StressLevel"] = min(10, 5 + (neg_count * 2) + exh_count)
            metrics["JobSatisfaction"] = max(1, 6 - neg_count - (exh_count * 0.5))
            metrics["EmotionalExhaustion"] = min(10, 4 + exh_count + (neg_count * 1.5))
            metrics["WorkLifeBalanceScore"] = max(1, 6 - exh_count)

        if pos_count > 0:
            metrics["JobSatisfaction"] = min(10, metrics["JobSatisfaction"] + (pos_count * 1.5))
            metrics["PersonalAccomplishment"] = min(10, 7 + pos_count)
            metrics["StressLevel"] = max(1, metrics["StressLevel"] - pos_count)
            metrics["EmotionalExhaustion"] = max(1, metrics["EmotionalExhaustion"] - pos_count)

        if sleep_count > 0:
            metrics["SleepQuality"] = "Low"
        
        if metrics["SleepHours"] < 6:
             metrics["SleepQuality"] = "Low"
             metrics["StressLevel"] = min(10, metrics["StressLevel"] + 1)
             metrics["EmotionalExhaustion"] = min(10, metrics["EmotionalExhaustion"] + 1)
        
        if detach_count > 0:
            metrics["Depersonalization"] = min(10, 3 + (detach_count * 2))
            metrics["JobSatisfaction"] = max(1, metrics["JobSatisfaction"] - detach_count)

        # Calculate Overall Burnout Risk
        # Formula: High Exhaustion + High Depersonalization + Low Accomplishment = Burnout
        risk_score = (metrics["EmotionalExhaustion"] * 0.5) + (metrics["Depersonalization"] * 0.3) + ((10 - metrics["PersonalAccomplishment"]) * 0.2)
        
        if risk_score > 7 or (metrics["EmotionalExhaustion"] > 8 and metrics["SleepHours"] < 6):
            metrics["BurnoutRisk"] = "High"
        elif risk_score > 4:
            metrics["BurnoutRisk"] = "Moderate"

        # Generate Insights
        insights = []
        if metrics["BurnoutRisk"] == "High":
            insights.append("You are showing signs of high emotional exhaustion. Prioritize rest immediately.")
        if metrics["SleepQuality"] == "Low" or metrics["SleepHours"] < 6:
            insights.append(f"Your sleep ({metrics['SleepHours']}h) is below recommended levels. Consider a 'no screens' rule after 9 PM.")
        if metrics["PersonalAccomplishment"] > 8:
            insights.append("You're continuously achieving great things. Take a moment to celebrate!")
        if metrics["WorkHoursPerWeek"] > 50:
             insights.append(f"You are working ~{metrics['WorkHoursPerWeek']} hours/week. This is a major burnout risk factor.")

        if not insights:
            insights.append("Your reflection suggests a balanced state. Keep monitoring your energy.")

        return {
            "metrics": metrics,
            "insights": insights,
            "analysis_summary": f"Detected {metrics['BurnoutRisk']} risk indicators based on emotional tone."
        }
