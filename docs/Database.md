# Database Design

This document details database configurations, storage managers, and credentials.

## Storage Configurations

Flourish implements a hybrid data architecture:
1. **Cloud NoSQL (Cloud Firestore)**: Default active manager for remote deployments. User profiles, mood logs, dynamic reminders, tasks, and chat history are compartmentalized per user.
2. **Local SQL (SQLite)**: Provides local developers a sandbox schema for relational testing, tables setup, and SQL query definitions. Relational tables mapping and connections are handled in `db_manager.py`.

---

## Firestore Schema Structure

The Firestore layout isolates data by User ID (`users/{uid}`):

```
users/
└── {uid}/
    ├── mood_checkins/
    │   └── {checkin_id}
    │       ├── date: "yyyy-MM-dd"
    │       ├── mood: "Great" | "Good" | "Okay" | "Low" | "Stressed"
    │       └── energy: 80
    ├── reminders/
    │   └── {reminder_id}
    │       ├── title: "Refactor Router"
    │       ├── date: "yyyy-MM-dd"
    │       └── completed: true
    ├── employees/
    │   └── {employee_id}
    │       ├── name: "Ayushi"
    │       └── weekly_hours_limit: 40
    └── tasks/
        └── {task_id}
            ├── title: "Refactor contexts"
            ├── priority: "High"
            └── status: "Pending"
```

## Relational Schema (SQLite)

The SQLite local schema (defined in `models.py` and implemented by `db_manager.py`) is structured as follows:
- `employees` (employee attributes and hourly ceilings)
- `tasks` (project actions linked to employees)
- `schedules` (specific time slot allocations)
- `conversation_sessions` (chat thread references)
- `conversation_logs` (message bubbles mapped to chat threads)

Refer to the [SQL Directory](../sql/) for SQL files.
