CREATE TABLE IF NOT EXISTS conversation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    session_id INTEGER NOT NULL,
    sentiment TEXT,
    FOREIGN KEY (session_id) REFERENCES conversation_sessions (id) ON DELETE CASCADE
);
