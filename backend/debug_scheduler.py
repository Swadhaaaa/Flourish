from scheduler_app.database.db_manager import DBManager
from scheduler_app.scheduler.logic import SchedulerEngine
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI
import json

# Setup
db = DBManager("scheduler.db")
ai = GroqSchedulerAI()
engine = SchedulerEngine(db, ai)

# 1. Check Employees
emps = db.get_all_employees()
print(f"Employees: {[e.name for e in emps]}")

# 2. Check Tasks
tasks = db.get_all_active_tasks()
print(f"Tasks: {[t.title for t in tasks]}")

# 3. Create a dummy task if none
if not tasks:
    print("Creating dummy task...")
    db.add_task("Test Task", "Test Description", "High", 2.0, "2023-12-31")
    tasks = db.get_all_active_tasks()

# 4. Run Schedule Generation
print("\n--- Running Generation ---")
result = engine.generate_and_save_schedule("Optimize everything")
print(f"\nResult: {result}")

# 5. Check Schedules table directly
print("\n--- Checking DB Schedules ---")
with db.get_connection() as conn:
    rows = conn.execute("SELECT * FROM schedules").fetchall()
    print(f"Total Schedule Rows: {len(rows)}")
    for row in rows:
        print(dict(row))
