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
