import os
import random

# Mocking LangChain for now to ensure it runs without API Keys immediately.
# In a real scenario with keys, we would import:
# from langchain.chat_models import ChatOpenAI
# from langchain.prompts import PromptTemplate

from scheduler_app.ai_engine.groq_client import GroqSchedulerAI

class AIService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("Gemini_API_KEY")
        # self.llm = ChatOpenAI(temperature=0.7) if self.api_key else None
        self.groq_ai = GroqSchedulerAI()

    def analyze_email(self, content: str, sender: str):
        """
        Detects tone and invisible labor using Groq (Llama-3) if available, else rich heuristics.
        """
        # 1. Try Groq AI first for high-quality analysis
        try:
            system_prompt = "You are an expert corporate communications coach. Analyze the email for tone (aggression, passive-aggressiveness) and invisible labor. Output JSON."
            user_prompt = f"""
            Analyze this email from '{sender}':
            "{content}"
            
            Return JSON:
            {{
                "tone_category": "Direct" | "Passive-Aggressive" | "Urgent" | "Supportive" | "Dismissive",
                "emotional_impact": (0-100 score, high is bad),
                "analysis": "1 sent summary of why it's stressful",
                "rewritten": "A professional, softened version (keep specific dates/requests but remove emotion)",
                "invisible_labor_flag": boolean (is it assigning planning/nurturing tasks?),
                "labor_type": "None" | "Planning" | "Emotional" | "Admin"
            }}
            """
            ai_response = self.groq_ai.generate_json_response(system_prompt, user_prompt)
            if ai_response:
                return {
                    "original": content,
                    "rewritten": ai_response.get("rewritten", content),
                    "aggression_score": ai_response.get("emotional_impact", 0),
                    "tone_category": ai_response.get("tone_category", "Neutral"),
                    "is_toxic": ai_response.get("emotional_impact", 0) > 60,
                    "is_invisible_labor": ai_response.get("invisible_labor_flag", False),
                    "analysis": ai_response.get("analysis", "Analysis complete."),
                    "sender": sender
                }
        except Exception as e:
            print(f"AI Analysis Failed: {e}, falling back to heuristics.")

        # 2. Rich Heuristics (Fallback)
        aggression_score = 10
        tone_category = "Neutral"
        rewritten = content
        invisible_labor_flag = False
        analysis_text = "Standard professional communication."
        
        lower_content = content.lower()
        
        # Tone Detection
        if any(w in lower_content for w in ["per my last email", "obviously", "make sure", "ensure", "fine"]):
            aggression_score = 65
            tone_category = "Passive-Aggressive"
            analysis_text = "Detected subtle condescension using passive phrasing."
            rewritten = f"Hi,\n\nJust wanted to follow up on this to ensure we're aligned. Thanks,\n{sender}"
            
        if any(w in lower_content for w in ["asap", "urgent", "emergency", "now", "immediately"]):
            aggression_score = 85
            tone_category = "Urgent/Demanding"
            analysis_text = "High urgency detected, creating pressure."
            rewritten = f"Hi,\n\nWhen you have a moment, could you please prioritize this item? Thanks,\n{sender}"
            
        if any(w in lower_content for w in ["stupid", "ridiculous", "incompetent", "what is this", "fail"]):
            aggression_score = 95
            tone_category = "Hostile"
            analysis_text = "Overt hostility and unprofessional language detected."
            rewritten = f"[Tone Shield Blocked Hostility]\n\n{sender} is expressing dissatisfaction with the current status and requests a review."
        
        # Invisible Labor Detection
        labor_words = ["party", "birthday", "cake", "card", "organize team", "notes", "schedule", "snack", "gift"]
        if any(w in lower_content for w in labor_words):
            invisible_labor_flag = True
            analysis_text = "Request involves 'Invisible Labor' (non-promotable office housekeeping)."
            
        return {
            "original": content,
            "rewritten": rewritten,
            "aggression_score": aggression_score,
            "tone_category": tone_category,
            "is_toxic": aggression_score > 60,
            "is_invisible_labor": invisible_labor_flag,
            "analysis": analysis_text,
            "sender": sender
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

        # Music Recommendation Logic
        if metrics["StressLevel"] > 7 or metrics["BurnoutRisk"] == "High":
            metrics["music_recommendation"] = {
                "track": "Rain Sounds",
                "category": "Calm",
                "reason": "High stress detected. Rain sounds can lower cortisol levels."
            }
        elif metrics["WorkHoursPerWeek"] > 50 or exh_count > 0:
            metrics["music_recommendation"] = {
                "track": "Deep Focus (40Hz)",
                "category": "Focus",
                "reason": "High workload detected. Gamma waves (40Hz) help maintain concentration."
            }
        elif metrics["SleepQuality"] == "Low":
            metrics["music_recommendation"] = {
                "track": "Theta Waves",
                "category": "Sleep",
                "reason": "Sleep issues detected. Theta waves encourage deep relaxation."
            }
        else:
            metrics["music_recommendation"] = {
                "track": "Forest Ambience",
                "category": "Flow",
                "reason": "Balanced state. Nature sounds promote sustained creative flow."
            }

        return {
            "metrics": metrics,
            "insights": insights,
            "analysis_summary": f"Detected {metrics['BurnoutRisk']} risk indicators based on emotional tone."
        }

    def get_workload_insight(self, priority_tasks: int, meeting_hours: float):
        """
        Returns a workload analysis summary and music recommendation.
        """
        insight = {
            "title": "Manageable Load",
            "summary": "Your schedule looks balanced.",
            "action": "Plan Ahead",
            "recommendation": "Take 15-min breaks every 2 hours.",
            "music_recommendation": {
                "track": "Lo-Fi Beats",
                "category": "Flow"
            }
        }
        
        if meeting_hours > 4:
            insight = {
                "title": "Meeting Heavy",
                "summary": f"{meeting_hours} hours of meetings today.",
                "action": "Protect Focus Time",
                "recommendation": "Block out 1 hour for deep work before your calls.",
                "music_recommendation": {
                    "track": "Rain Sounds",
                    "category": "Calm"
                }
            }
        elif priority_tasks >= 3:
            insight = {
                "title": "High Focus Required",
                "summary": f"{priority_tasks} high-priority tasks pending.",
                "action": "Start Deep Work",
                "recommendation": "Tackle the hardest task first. Use the Pomodoro technique.",
                "music_recommendation": {
                    "track": "Deep Focus (40Hz)",
                    "category": "Focus"
                }
            }
            
        return insight

    def generate_period_insight(self, day: int, phase: str, symptoms: list, mood: str):
        """
        Generates a personalized daily insight using Llama-3 via Groq.
        """
        system_prompt = "You are an empathetic women's health wellness assistant. Output valid JSON only."
        
        user_prompt = f"""
        Generate a empathetic, 2-3 sentence daily insight for a woman tracking her cycle.
        
        CONTEXT:
        - Day of Cycle: {day}
        - Phase: {phase}
        - Symptoms: {', '.join(symptoms) if symptoms else 'None'}
        - Mood: {mood}
        
        GOAL:
        - Explain why she feels this way biologically (briefly).
        - Suggest one actionable work/productivity tip.
        - Suggest one specific nutrition tip (dietary recommendation).
        - Suggest 3 concrete food items to eat.
        - Tone: Warm, validating, empowering.
        - NO medical diagnosis.
        
        Output JSON format: {{ 
            "insight": "Start with a validation...", 
            "short_tip": "One liner work tip",
            "diet_tip": "Specific nutrition advice...",
            "recommended_foods": ["Food 1", "Food 2", "Food 3"]
        }}
        """
        
        try:
            response = self.groq_ai.generate_json_response(system_prompt, user_prompt)
            if response and "insight" in response:
                return response # Return full dict
        except Exception:
            pass

        # === DYNAMIC FALLBACK (Heuristic) ===
        # Ensure message changes based on Phase/Mood even without AI
        
        fallback_map = {
            "Menstrual": {
                "default": f"Day {day}: Your energy is naturally low. Prioritize rest and hydration.",
                "Cramps": f"Day {day}: Gentle heat and magnesium-rich foods can help soothe cramps today.",
                "Tired": f"Day {day}: It's okay to slow down. Your body is doing hard work right now.",
                "Happy": f"Day {day}: Glad you're feeling good! Keep it light and steady."
            },
            "Follicular": {
                "default": f"Day {day}: Energy is rising! Great time to plan new projects.",
                "Happy": f"Day {day}: Your creativity is peaking. Use this spark!",
                "Anxious": f"Day {day}: Channel that rising energy into a workout or brainstorming."
            },
            "Ovulatory": {
                "default": f"Day {day}: Peak energy and confidence. Tackle your biggest challenge!",
                "Bloating": f"Day {day}: Stay hydrated. You're at your peak despite the bloating."
            },
            "Luteal": {
                "default": f"Day {day}: Winding down. Focus on administrative tasks over creative ones.",
                "Irritable": f"Day {day}: Be gentle with yourself. Hormones are fluctuating.",
                "Anxious": f"Day {day}: Grounding exercises are your best friend today."
            }
        }
        
        # Global Symptom Overrides (Apply regardless of phase)
        symptom_map = {
            "Cramps": f"Day {day}: Heat pads and gentle stretching can provide relief for cramps.",
            "Headache": f"Day {day}: Stay hydrated and try to reduce screen time if possible.",
            "Bloating": f"Day {day}: Peppermint tea or ginger can act as a natural digestive aid.",
            "Acne": f"Day {day}: Be kind to your skin. Focus on hydration and clean eating.",
            "Back Pain": f"Day {day}: Gentle yoga stretches for the lower back might help relieve tension.",
            "Insomnia": f"Day {day}: Try a magnesium supplement or a warm bath before bed tonight."
        }
        
        phase_map = fallback_map.get(phase, fallback_map["Menstrual"])
        
        # Priority: Symptom > Mood (Phase Specific) > Phase Default
        insight = phase_map.get("default")
        
        if mood in phase_map:
            insight = phase_map[mood]
            
        if symptoms:
            for s in symptoms:
                if s in symptom_map:
                    insight = symptom_map[s]
                    break
        
        # Fallback Diet Logic
        diet_tip = "Focus on balanced nutrition and hydration."
        foods = ["Fresh Fruit", "Whole Grains", "Water"]
        
        if phase == "Menstrual":
             diet_tip = "Replenish iron and relax muscles."
             foods = ["Dark Chocolate", "Leafy Greens", "Warm Tea"]
        elif phase == "Follicular":
             diet_tip = "Fuel your rising energy with fresh produce."
             foods = ["Berries", "Avocado", "Lean Protein"]
        elif phase == "Ovulatory":
             diet_tip = "Support hormone balance with fiber."
             foods = ["Cruciferous Veggies", "Quinoa", "Salmon"]
        elif phase == "Luteal":
             diet_tip = "Stabilize blood sugar to manage mood."
             foods = ["Sweet Potato", "Dark Chocolate", "Nuts"]

        return {
            "insight": insight,
            "diet_tip": diet_tip,
            "recommended_foods": foods,
            "short_tip": "Listen to your body."
        }

    def scout_rides(self, pickup: str, dropoff: str, distance_km: float):
        """
        Uses Groq API to generate dynamic cab prices and ETAs.
        """
        system_prompt = "You are a dynamic pricing engine for a ride-hailing aggregator. Output valid JSON only."
        user_prompt = f"""
        Generate 3 cab options (Uber, Ola, SafeCab) for a ride from {pickup} to {dropoff}.
        The distance is approximately {distance_km} km.
        Base price should be around {distance_km * 15} INR.
        Vary the exact price, ETA, and safety score for each dynamically.
        SafeCab should always have the highest safety score and competitive pricing.
        
        Output JSON format exactly like this:
        {{
            "providers": [
                {{
                    "id": "safe-cab",
                    "provider": "SafeCab",
                    "price": 450,
                    "eta": "4 min",
                    "safety_score": 98,
                    "type": "Premium Electric"
                }}
            ]
        }}
        Provide 3 items in the providers array.
        """
        try:
            response = self.groq_ai.generate_json_response(system_prompt, user_prompt)
            if response and "providers" in response:
                return response["providers"]
        except Exception as e:
            print(f"Scout Rides Failed: {e}")
        
        # Fallback
        base = int(distance_km * 15)
        return [
            {"id": "safe-cab", "provider": "SafeCab", "price": base, "eta": "4 min", "safety_score": 98, "type": "Premium"},
            {"id": "uber", "provider": "Uber", "price": base - 10, "eta": "7 min", "safety_score": 85, "type": "Go"},
            {"id": "ola", "provider": "Ola", "price": base + 5, "eta": "5 min", "safety_score": 88, "type": "Mini"}
        ]
