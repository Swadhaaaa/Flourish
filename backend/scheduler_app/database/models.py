import sqlite3
from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class Employee:
    id: int
    name: str
    role: str
    email: str
    weekly_hours_limit: int = 40
    current_workload: float = 0.0
    user_id: Optional[str] = None

@dataclass
class Task:
    id: int
    title: str
    description: str
    priority: str
    estimated_hours: float
    deadline: str
    assigned_to: Optional[int] = None
    status: str = "Pending"
    user_id: Optional[str] = None

@dataclass
class Schedule:
    id: int
    employee_id: int
    task_id: int
    scheduled_day: str
    start_time: str
    end_time: str
    user_id: Optional[str] = None

# ... (Sessions and Logs already handled or will be handled in DBManager) ...

def create_tables(conn: sqlite3.Connection):
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT NOT NULL,
        weekly_hours_limit INTEGER DEFAULT 40,
        current_workload REAL DEFAULT 0.0,
        user_id TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'Medium',
        estimated_hours REAL NOT NULL,
        deadline TEXT,
        assigned_to INTEGER,
        status TEXT DEFAULT 'Pending',
        user_id TEXT,
        FOREIGN KEY (assigned_to) REFERENCES employees (id)
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        scheduled_day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        user_id TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT DEFAULT 'New Chat',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        session_id INTEGER,
        sentiment TEXT,
        intent TEXT,
        FOREIGN KEY (session_id) REFERENCES conversation_sessions (id)
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT,
        value TEXT,
        user_id TEXT,
        PRIMARY KEY (key, user_id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT DEFAULT CURRENT_DATE,
        stress_level INTEGER,
        mood TEXT,
        notes TEXT,
        user_id TEXT
    )
    """)
    
    conn.commit()
