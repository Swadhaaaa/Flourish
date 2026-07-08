-- Flourish Master SQLite Schema Definition

PRAGMA foreign_keys = ON;

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    weekly_hours_limit INTEGER DEFAULT 40,
    current_workload REAL DEFAULT 0.0,
    user_id TEXT NOT NULL
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
    estimated_hours REAL NOT NULL,
    deadline TEXT,
    assigned_to INTEGER,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Scheduled', 'Completed')),
    user_id TEXT NOT NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees (id) ON DELETE SET NULL
);

-- 3. Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    scheduled_day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- 4. Conversation Sessions Table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT 'New Chat',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT NOT NULL
);

-- 5. Conversation Logs Table
CREATE TABLE IF NOT EXISTS conversation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    session_id INTEGER NOT NULL,
    sentiment TEXT,
    FOREIGN KEY (session_id) REFERENCES conversation_sessions (id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_session ON conversation_logs(session_id);
