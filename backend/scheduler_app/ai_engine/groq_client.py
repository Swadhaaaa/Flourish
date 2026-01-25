from groq import Groq
import json
from typing import Dict, Any, List
from ..config import GROQ_API_KEY

class GroqSchedulerAI:
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile" # Latest stable model

    def process_conversation(self, user_input: str, context_history: List[Dict], user_prefs: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main entry point for handling user interaction.
        context_history: List of {"role": "user/assistant", "content": "..."}
        """
        if user_prefs is None: user_prefs = {}
        
        system_prompt = f"""
        You are 'Flourish AI', an advanced AI Scheduler and Empathetic Wellness Assistant for a female professional.
        Your goal is to balance productivity with mental well-being.
        
        CURRENT MODE: {user_prefs.get('coaching_mode', 'Normal')}
        USER PREFS: {json.dumps(user_prefs)}
        
        ANALYZE the input and history. OUTPUT a JSON object.
        
        POSSIBLE INTENTS:
        1. **task_creation**: User wants to add work OR a meeting. 
           - RETURN: "internal_action": "add_task"
           - IF specific time mentioned (e.g. "Meeting Tuesday 2pm"): Include "fixed_schedule": {{"day": "Tuesday", "start_time": "14:00", "end_time": "15:00"}}
        2. **scheduling_query**: "Clear schedule", "Move meetings". RETURN: "internal_action": "manage_schedule"
        3. **wellness_check**: User mentions stress, burnout, tiredness. RETURN: "internal_action": "log_wellness", "sentiment": "negative/stressed"
        4. **chat**: General conversation, advice, venting. RETURN: "internal_action": "chat"
        5. **command**: Explicit commands like "/private on". RETURN: "internal_action": "command"
        
        OUTPUT SCHEMA:
        {{
            "intent": "string",
            "sentiment": "positive/neutral/stressed/tired",
            "stress_score": 1-10 (estimate based on tone),
            "response_text": "The natural language reply you want to show the user. Be empathetic. Use emojis if appropriate.",
            "action_details": {{ 
                "title": "Task title", 
                "priority": "High/Medium", 
                "estimated_hours": 1.0, 
                "deadline": "YYYY-MM-DD",
                "fixed_schedule": {{ "day": "Monday", "start_time": "HH:MM", "end_time": "HH:MM" }}  // OPTIONAL
            }}
        }}
        
        EXAMPLES:
        User: "I am so overwhelmed today."
        JSON: {{
            "intent": "wellness_check",
            "sentiment": "stressed",
            "stress_score": 8,
            "response_text": "I hear you, and it's okay to feel this way. Let's take a deep breath. 🌿 Should we lighten your schedule for today?",
            "action_details": {{}}
        }}

        User: "Add task: Prepare meeting slides by 5pm"
        JSON: {{
            "intent": "task_creation",
            "sentiment": "neutral",
            "stress_score": 3,
            "response_text": "Got it. I've added 'Prepare meeting slides' to your list.",
            "action_details": {{ "title": "Prepare meeting slides", "deadline": "17:00", "priority": "Medium", "estimated_hours": 1 }}
        }}

        User: "Meeting on Tuesday from 2pm to 3pm"
        JSON: {{
            "intent": "task_creation",
            "sentiment": "neutral",
            "stress_score": 2,
            "response_text": "I've scheduled your meeting for Tuesday at 2 PM. 📅",
            "action_details": {{ 
                "title": "Meeting", 
                "estimated_hours": 1, 
                "fixed_schedule": {{ "day": "Tuesday", "start_time": "14:00", "end_time": "15:00" }}
            }}
        }}
        """

        messages = [{"role": "system", "content": system_prompt}] + context_history + [{"role": "user", "content": user_input}]

        completion = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.3, # Slightly higher for creativity in chat
            response_format={"type": "json_object"}
        )

        try:
            return json.loads(completion.choices[0].message.content)
        except json.JSONDecodeError:
            return {
                "intent": "chat",
                "response_text": "I'm having trouble processing that thought. Could you say it again?",
                "action_details": {}
            }

    def generate_schedule_suggestion(self, tasks: List[Dict], employees: List[Dict], constraints: str) -> Dict[str, Any]:
        """
        Generates a schedule assignment based on tasks, employees, and constraints.
        """
        system_prompt = """
        You are an expert workforce scheduler prioritizing work-life balance for female associates.
        
        INPUTS:
        - tasks: List of tasks. Some might have a "current_schedule" field (e.g. {"day": "Monday", ...}). Use this context if the user wants to "move Monday tasks".
        - employees: List of team members.
        - constraints: User's specific requirements (e.g. "Move all Monday work to Wednesday").
        
        CRITICAL RULES:
        1. You MUST generate a schedule entry for **EVERY** task in the input list. Do not omit any task.
        2. If a task has a "current_schedule" and the constraints require changing it (e.g. "Move Monday tasks"), assign it a NEW slot. 
        3. If a task's current schedule is fine, you can keep it close to the original or optimize it, but you MUST output it.
        4. Respect employee weekly hours limits.
        
        Return a JSON object with:
        {"schedule": [
            {"employee_id": 1, "task_id": 101, "day": "Monday", "start_time": "09:00", "end_time": "11:00", "reason": "Matched skill and availability"}
        ]}
        
        Output valid JSON only.
        """
        
        user_content = json.dumps({
            "tasks": tasks,
            "employees": employees,
            "constraints": constraints
        })
        
        completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model=self.model,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        try:
            return json.loads(completion.choices[0].message.content)
        except json.JSONDecodeError:
             return {"type": "error", "message": "Failed to generate schedule"}

    def generate_title(self, user_text: str) -> str:
        """
        Generates a short 3-5 word title for the conversation based on the first user message.
        """
        messages = [
            {"role": "system", "content": "Generate a concise, 3-5 word title for a conversation that starts with this user message. Do NOT use quotes. Example: 'Project Planning' or 'Stress Management Tips'."},
            {"role": "user", "content": user_text}
        ]
        
        completion = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.5,
            max_tokens=20
        )
        
        title = completion.choices[0].message.content.strip().replace('"', '')
        title = completion.choices[0].message.content.strip().replace('"', '')
        return title

    def generate_json_response(self, system_prompt: str, user_prompt: str, temperature: float = 0.5) -> Dict[str, Any]:
        """
        Generates a JSON response based on custom system and user prompts.
        Useful for specific tasks like period insights or analysis.
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        completion = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=temperature,
            response_format={"type": "json_object"}
        )
        
        try:
            return json.loads(completion.choices[0].message.content)
        except json.JSONDecodeError:
             return {}

