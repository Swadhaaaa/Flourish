import sys
import os

# Ensure we can import from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scheduler_app.database.db_manager import DBManager
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI
from scheduler_app.scheduler.logic import SchedulerEngine

def verification_test():
    print("Initializing components...")
    db = DBManager("test_scheduler.db") # Use a separate test DB
    # Create tables is called in init
    
    ai = GroqSchedulerAI()
    engine = SchedulerEngine(db, ai)
    
    print("1. Adding Employee...")
    db.add_employee("Alice", "Developer", "alice@example.com", 40)
    db.add_employee("Bob", "Designer", "bob@example.com", 35)
    
    print("2. Adding Task via AI NLP...")
    nl_input = "Add a high priority task 'Website Redesign' due next Friday, estimated 10 hours."
    response = engine.add_task_from_natural_language(nl_input)
    print(f"   AI Response: {response}")
    
    print("3. Generating Schedule...")
    schedule_result = engine.generate_and_save_schedule("Ensure Alice doesn't work on Friday afternoon.")
    
    if isinstance(schedule_result, list) and len(schedule_result) > 0:
        print(f"   Success! Generated {len(schedule_result)} schedule items.")
        print(f"   Sample: {schedule_result[0]}")
    else:
        print(f"   Warning: Result was {schedule_result}")

    print("\nVerification Complete.")

if __name__ == "__main__":
    verification_test()
