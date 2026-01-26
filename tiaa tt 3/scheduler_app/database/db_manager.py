import sqlite3
import os
from contextlib import contextmanager
from typing import List, Optional, Dict, Any
from .models import create_tables, Employee, Task, Schedule

DB_NAME = "scheduler.db"

class DBManager:
    def __init__(self, db_path: str = DB_NAME):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with self.get_connection() as conn:
            create_tables(conn)

    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def add_employee(self, name: str, role: str, email: str, weekly_hours_limit: int = 40) -> int:
        query = """
        INSERT INTO employees (name, role, email, weekly_hours_limit)
        VALUES (?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (name, role, email, weekly_hours_limit))
            conn.commit()
            return cursor.lastrowid

    def get_all_employees(self) -> List[Employee]:
        query = "SELECT * FROM employees"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            return [Employee(**dict(row)) for row in rows]

    def add_task(self, title: str, description: str, priority: str, estimated_hours: float, deadline: str) -> int:
        query = """
        INSERT INTO tasks (title, description, priority, estimated_hours, deadline)
        VALUES (?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (title, description, priority, estimated_hours, deadline))
            conn.commit()
            return cursor.lastrowid

    def get_pending_tasks(self) -> List[Task]:
        query = "SELECT * FROM tasks WHERE status = 'Pending'"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            return [Task(**dict(row)) for row in rows]

    def get_all_active_tasks(self) -> List[Task]:
        query = "SELECT * FROM tasks WHERE status IN ('Pending', 'Scheduled')"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            return [Task(**dict(row)) for row in rows]

    def update_task_status(self, task_id: int, status: str):
        query = "UPDATE tasks SET status = ? WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (status, task_id))
            conn.commit()

    def create_schedule(self, employee_id: int, task_id: int, day: str, start: str, end: str) -> int:
        query = """
        INSERT INTO schedules (employee_id, task_id, scheduled_day, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (employee_id, task_id, day, start, end))
            conn.commit()
            return cursor.lastrowid

    def clear_schedule_for_task(self, task_id: int):
        query = "DELETE FROM schedules WHERE task_id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
    def clear_entire_schedule(self):
        query = "DELETE FROM schedules"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            conn.commit()

    def delete_task(self, task_id: int):
        self.clear_schedule_for_task(task_id) # Ensure no orphan schedule entries
        query = "DELETE FROM tasks WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (task_id,))
            conn.commit()

    def get_task_schedule(self, task_id: int) -> Optional[dict]:
        query = "SELECT * FROM schedules WHERE task_id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (task_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # --- New Chatbot Methods ---

    def create_session(self, title: str = "New Chat") -> int:
        query = "INSERT INTO conversation_sessions (title) VALUES (?)"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (title,))
            conn.commit()
            return cursor.lastrowid
            
    def get_session(self, session_id: int) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM conversation_sessions WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (session_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        query = "SELECT * FROM conversation_sessions ORDER BY id DESC"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
            
    def update_session_title(self, session_id: int, title: str):
        query = "UPDATE conversation_sessions SET title = ? WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (title, session_id))
            conn.commit()
            
    def delete_session(self, session_id: int):
        # Delete logs first
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM conversation_logs WHERE session_id = ?", (session_id,))
            cursor.execute("DELETE FROM conversation_sessions WHERE id = ?", (session_id,))
            conn.commit()

    def log_message(self, role: str, content: str, session_id: int, sentiment: str = None, intent: str = None):
        query = """
        INSERT INTO conversation_logs (role, content, session_id, sentiment, intent)
        VALUES (?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (role, content, session_id, sentiment, intent))
            conn.commit()

    def get_session_history(self, session_id: int) -> List[Dict[str, Any]]:
        query = "SELECT role, content FROM conversation_logs WHERE session_id = ? ORDER BY id ASC"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (session_id,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_recent_conversation(self, limit: int = 10, session_id: int = 1) -> List[Dict[str, Any]]:
        # Modified to respect session_id
        query = "SELECT role, content FROM conversation_logs WHERE session_id = ? ORDER BY id DESC LIMIT ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (session_id, limit))
            rows = cursor.fetchall()
            return [dict(row) for row in reversed(rows)]

    def set_user_preference(self, key: str, value: str):
        query = """
        INSERT INTO user_preferences (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (key, value))
            conn.commit()

    def get_user_preference(self, key: str) -> Optional[str]:
        query = "SELECT value FROM user_preferences WHERE key = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (key,))
            row = cursor.fetchone()
            return row['value'] if row else None

    def log_wellness(self, stress_level: int, mood: str, notes: str = ""):
        query = """
        INSERT INTO wellness_logs (stress_level, mood, notes)
        VALUES (?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (stress_level, mood, notes))
            conn.commit()
