CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    weekly_hours_limit INTEGER DEFAULT 40,
    current_workload REAL DEFAULT 0.0,
    user_id TEXT NOT NULL
);
