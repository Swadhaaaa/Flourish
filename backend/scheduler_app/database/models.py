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

@dataclass
class Task:
    id: int
    title: str
    description: str
    priority: str  # High, Medium, Low
    estimated_hours: float
    deadline: str
    assigned_to: Optional[int] = None
    status: str = "Pending"  # Pending, In Progress, Completed

@dataclass
class Schedule:
    id: int
    employee_id: int
    task_id: int
    scheduled_day: str
    start_time: str
    end_time: str

@dataclass
class ConversationSession:
    id: int
    title: str
    created_at: str

@dataclass
class ConversationLog:
    id: int
    role: str
    content: str
    timestamp: str
    session_id: Optional[int] = None # Added FK
    sentiment: Optional[str] = None 
    intent: Optional[str] = None

@dataclass
class UserPreference:
    key: str
    value: str

@dataclass
class WellnessLog:
    id: int
    date: str
    stress_level: int # 1-10
    mood: str
    notes: str

def create_tables(conn: sqlite3.Connection):
    cursor = conn.cursor()
    
    # ... (Previous tables unchanged) ...
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT NOT NULL,
        weekly_hours_limit INTEGER DEFAULT 40,
        current_workload REAL DEFAULT 0.0
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
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
    """)

    # New Session Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT DEFAULT 'New Chat',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Modified Logs Table (We'll check if column exists or just create generic IF NOT EXISTS for new setups.
    # ideally we should migrate, but for this prototype just adding the column definition for new tables
    # or relying on SQLite's flexibility. Let's just create the table with the new schema. 
    # If table exists, we may need to alter it - but standard tool usage implies 'replace'.
    # I'll use CREATE TABLE IF NOT EXISTS with the NEW schema. 
    # If the user has an existing DB, this WON'T add the column. 
    # I should add an ALTER TABLE command safely.)
    
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
    
    # Simple migration for existing tables without session_id
    try:
        cursor.execute("ALTER TABLE conversation_logs ADD COLUMN session_id INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass # Column likely exists or table just created

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT DEFAULT CURRENT_DATE,
        stress_level INTEGER,
        mood TEXT,
        notes TEXT
    )
    """)
    
    conn.commit()
