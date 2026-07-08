# Flourish Database Schemas & Migrations

This directory contains the database design for Flourish, supporting both structured relational (SQLite) and Cloud Document NoSQL (Firestore) implementations.

## Directory Layout

```
sql/
├── README.md             # Database documentation
├── schema.sql            # Master SQLite schema definition file
├── seed_data.sql         # Seed data script for development and testing
├── tables/               # Discrete table schema definitions
│   ├── employees.sql
│   ├── tasks.sql
│   ├── schedules.sql
│   ├── conversation_sessions.sql
│   └── conversation_logs.sql
└── alter_tables/         # Incremental schema migration scripts (placeholder)
```

## Supported Engines

1. **SQLite (Local Development)**: Set up automatically when initializing `db_manager.py`. It reads schemas from the embedded `models.py` definitions.
2. **Cloud Firestore (Production)**: The NoSQL equivalent utilizes nested sub-collections configured dynamically by `firestore_manager.py` (e.g. `users/{user_id}/tasks`).

## Schema Execution (SQLite)

To initialize local SQLite schema manually:
```bash
sqlite3 scheduler.db < schema.sql
sqlite3 scheduler.db < seed_data.sql
```
