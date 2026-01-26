"""
LangChain-powered AI Scheduler Assistant.
Uses ChatGroq LLM with structured output parsing.
"""
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import os

# Load API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# --- Pydantic Models for Structured Output ---
class FixedSchedule(BaseModel):
    """Fixed schedule details for meetings/events."""
    day: Optional[str] = Field(None, description="Day of the week")
    start_time: Optional[str] = Field(None, description="Start time in HH:MM format")
    end_time: Optional[str] = Field(None, description="End time in HH:MM format")


class ActionDetails(BaseModel):
    """Details for task actions."""
    title: Optional[str] = Field(None, description="Task title")
    priority: Optional[str] = Field("Medium", description="Priority: High/Medium/Low")
    estimated_hours: Optional[float] = Field(1.0, description="Estimated hours to complete")
    deadline: Optional[str] = Field(None, description="Deadline in YYYY-MM-DD or HH:MM format")
    fixed_schedule: Optional[FixedSchedule] = Field(None, description="Fixed schedule for meetings")


class ConversationResponse(BaseModel):
    """Structured response from the AI assistant."""
    intent: str = Field(description="User intent: task_creation, optimize_schedule, wellness_check, chat, command")
    sentiment: str = Field("neutral", description="User sentiment: positive/neutral/stressed/tired")
    stress_score: int = Field(1, description="Stress score from 1-10")
    response_text: str = Field(description="The reply to show the user")
    internal_action: Optional[str] = Field(None, description="Action to perform: add_task, optimize_schedule, log_wellness, chat, command")
    action_details: Optional[ActionDetails] = Field(default_factory=ActionDetails)


class ScheduleAssignment(BaseModel):
    """Single schedule assignment."""
    employee_id: int
    task_id: int
    day: str
    start_time: str
    end_time: str
    reason: str = Field(description="Reason for this assignment")


class ScheduleOutput(BaseModel):
    """Schedule generation output."""
    schedule: List[ScheduleAssignment]


class GroqSchedulerAI:
    """LangChain-powered AI Scheduler using Groq's Llama model."""
    
    def __init__(self):
        self.llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3
        )
        self.json_llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            model_kwargs={"response_format": {"type": "json_object"}}
        )
        self.parser = JsonOutputParser(pydantic_object=ConversationResponse)
        self.schedule_parser = JsonOutputParser(pydantic_object=ScheduleOutput)
    
    def _build_system_prompt(self, user_prefs: Dict[str, Any]) -> str:
        """Build the system prompt with user preferences."""
        return f"""You are 'Antigravity', an advanced AI Scheduler and Empathetic Wellness Assistant for a female professional.
Your goal is to balance productivity with mental well-being.

CURRENT MODE: {user_prefs.get('coaching_mode', 'Normal')}
USER PREFS: {json.dumps(user_prefs)}

ANALYZE the input and history. OUTPUT a JSON object.

POSSIBLE INTENTS:
1. **task_creation**: User wants to add work OR a meeting. 
   - RETURN: "internal_action": "add_task"
   - IF specific time mentioned (e.g. "Meeting Tuesday 2pm"): Include "fixed_schedule": {{"day": "Tuesday", "start_time": "14:00", "end_time": "15:00"}}
2. **optimize_schedule**: User asks to "plan my day", "generate schedule", "optimize tasks", "make a schedule", "auto schedule", "schedule". RETURN: "internal_action": "optimize_schedule"
3. **wellness_check**: User mentions stress, burnout, tiredness. RETURN: "internal_action": "log_wellness", "sentiment": "negative/stressed"
5. **chat**: General conversation, advice, venting. RETURN: "internal_action": "chat"
6. **command**: Explicit commands like "/private on". RETURN: "internal_action": "command"

{self.parser.get_format_instructions()}

EXAMPLES:
User: "I am so overwhelmed today."
JSON: {{
    "intent": "wellness_check",
    "sentiment": "stressed",
    "stress_score": 8,
    "response_text": "I hear you, and it's okay to feel this way. Let's take a deep breath. 🌿 Should we lighten your schedule for today?",
    "internal_action": "log_wellness",
    "action_details": {{}}
}}

User: "Add task: Prepare meeting slides by 5pm"
JSON: {{
    "intent": "task_creation",
    "sentiment": "neutral",
    "stress_score": 3,
    "response_text": "Got it. I've added 'Prepare meeting slides' to your list.",
    "internal_action": "add_task",
    "action_details": {{ "title": "Prepare meeting slides", "deadline": "17:00", "priority": "Medium", "estimated_hours": 1 }}
}}

User: "Meeting on Tuesday from 2pm to 3pm"
JSON: {{
    "intent": "task_creation",
    "sentiment": "neutral",
    "stress_score": 2,
    "response_text": "I've scheduled your meeting for Tuesday at 2 PM. 📅",
    "internal_action": "add_task",
    "action_details": {{ 
        "title": "Meeting", 
        "estimated_hours": 1, 
        "fixed_schedule": {{ "day": "Tuesday", "start_time": "14:00", "end_time": "15:00" }}
    }}
}}

User: "Generate schedule"
JSON: {{
    "intent": "optimize_schedule",
    "sentiment": "neutral",
    "stress_score": 1,
    "response_text": "Optimizing your schedule now...",
    "internal_action": "optimize_schedule",
    "action_details": {{}}
}}
"""

    def _convert_history_to_messages(self, context_history: List[Dict]) -> List:
        """Convert context history to LangChain message format."""
        messages = []
        for msg in context_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        return messages

    def process_conversation(self, user_input: str, context_history: List[Dict], user_prefs: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main entry point for handling user interaction.
        Uses LangChain with structured output parsing.
        """
        if user_prefs is None:
            user_prefs = {}
        
        system_prompt = self._build_system_prompt(user_prefs)
        
        # Build prompt template
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template("{system}"),
            MessagesPlaceholder(variable_name="history"),
            HumanMessagePromptTemplate.from_template("{input}")
        ])
        
        # Create chain with JSON output
        chain = prompt | self.json_llm | self.parser
        
        # Convert history
        history_messages = self._convert_history_to_messages(context_history)
        
        try:
            result = chain.invoke({
                "system": system_prompt,
                "history": history_messages,
                "input": user_input
            })
            
            # Ensure action_details is a dict
            if "action_details" not in result or result["action_details"] is None:
                result["action_details"] = {}
            
            return result
            
        except Exception as e:
            print(f"LangChain processing error: {e}")
            return {
                "intent": "chat",
                "sentiment": "neutral",
                "stress_score": 1,
                "response_text": "I'm having trouble processing that thought. Could you say it again?",
                "internal_action": "chat",
                "action_details": {}
            }

    def generate_schedule_suggestion(self, tasks: List[Dict], employees: List[Dict], constraints: str) -> Dict[str, Any]:
        """
        Generates a schedule assignment based on tasks, employees, and constraints.
        Uses LangChain for structured output.
        """
        system_prompt = """You are an expert workforce scheduler prioritizing work-life balance for female associates.

INPUTS:
- tasks: List of tasks. Some might have a "current_schedule" field (e.g. {"day": "Monday", ...}). Use this context if the user wants to "move Monday tasks".
- employees: List of team members.
- constraints: User's specific requirements (e.g. "Move all Monday work to Wednesday").

CRITICAL RULES:
1. You MUST generate a schedule entry for **EVERY** task in the input list. Do not omit any task.
2. If a task has a "current_schedule" and the constraints require changing it, assign it a NEW slot. 
3. If a task's current schedule is fine, you can keep it close to the original or optimize it.
4. Respect employee weekly hours limits.

Return a JSON object with:
{"schedule": [
    {"employee_id": 1, "task_id": 101, "day": "Monday", "start_time": "09:00", "end_time": "11:00", "reason": "Matched skill and availability"}
]}

Output valid JSON only."""

        user_content = json.dumps({
            "tasks": tasks,
            "employees": employees,
            "constraints": constraints
        })
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        
        chain = prompt | self.json_llm | self.schedule_parser
        
        try:
            result = chain.invoke({"input": user_content})
            return result
        except Exception as e:
            print(f"Schedule generation error: {e}")
            return {"type": "error", "message": f"Failed to generate schedule: {str(e)}"}

    def generate_title(self, user_text: str) -> str:
        """
        Generates a short 3-5 word title for the conversation.
        Uses LangChain for cleaner implementation.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Generate a concise, 3-5 word title for a conversation that starts with this user message. Do NOT use quotes. Example: 'Project Planning' or 'Stress Management Tips'."),
            ("human", "{input}")
        ])
        
        # Use regular LLM (not JSON mode) for title generation
        title_llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=20
        )
        
        chain = prompt | title_llm
        
        try:
            result = chain.invoke({"input": user_text})
            title = result.content.strip().replace('"', '')
            return title
        except Exception as e:
            print(f"Title generation error: {e}")
            return "New Conversation"
