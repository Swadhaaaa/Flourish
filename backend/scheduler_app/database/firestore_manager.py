import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Any, Optional
import os
from dataclasses import dataclass
from datetime import datetime

# Initialize Firebase Admin
# Expects serviceAccountKey.json in the backend directory
if not firebase_admin._apps:
    cred_path = "serviceAccountKey.json"
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("WARNING: serviceAccountKey.json not found. Firestore will fail.")

@dataclass
class Employee:
    id: str # Changed to str
    name: str
    role: str
    email: str
    weekly_hours_limit: int = 40
    current_workload: float = 0.0
    user_id: Optional[str] = None

@dataclass
class Task:
    id: str # Changed to str
    title: str
    description: str
    priority: str
    estimated_hours: float
    deadline: str
    assigned_to: Optional[str] = None # Changed to str
    status: str = "Pending"
    user_id: Optional[str] = None

class FirestoreManager:
    def __init__(self):
        try:
            self.db = firestore.client()
        except Exception as e:
            print(f"Firestore Init Error: {e}")
            self.db = None

    def _user_ref(self, user_id: str):
        return self.db.collection('users').document(str(user_id))

    def get_connection(self):
        # Mock context manager for compatibility
        class DummyContext:
            def __enter__(self): return None
            def __exit__(self, exc_type, exc_val, exc_tb): pass
        return DummyContext()

    def add_employee(self, name: str, role: str, email: str, weekly_hours_limit: int = 40, user_id: str = "1") -> str:
        emp_ref = self._user_ref(user_id).collection('employees').document()
        emp_ref.set({
            "name": name,
            "role": role,
            "email": email,
            "weekly_hours_limit": weekly_hours_limit,
            "current_workload": 0.0,
            "user_id": user_id
        })
        return emp_ref.id

    def get_all_employees(self, user_id: str = "1") -> List[Employee]:
        docs = self._user_ref(user_id).collection('employees').stream()
        emps = []
        for doc in docs:
            d = doc.to_dict()
            emps.append(Employee(
                id=doc.id,
                name=d.get('name', ''),
                role=d.get('role', ''),
                email=d.get('email', ''),
                weekly_hours_limit=d.get('weekly_hours_limit', 40),
                current_workload=d.get('current_workload', 0.0),
                user_id=user_id
            ))
        return emps

    def add_task(self, title: str, description: str, priority: str, estimated_hours: float, deadline: str, user_id: str = "1") -> str:
        task_ref = self._user_ref(user_id).collection('tasks').document()
        task_ref.set({
            "title": title,
            "description": description,
            "priority": priority,
            "estimated_hours": estimated_hours,
            "deadline": deadline,
            "status": "Pending",
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return task_ref.id

    def get_pending_tasks(self, user_id: str = "1") -> List[Task]:
        docs = self._user_ref(user_id).collection('tasks').where('status', '==', 'Pending').stream()
        return self._docs_to_tasks(docs, user_id)

    def get_all_active_tasks(self, user_id: str = "1") -> List[Task]:
        # Firestore "IN" query
        docs = self._user_ref(user_id).collection('tasks').where('status', 'in', ['Pending', 'Scheduled']).stream()
        return self._docs_to_tasks(docs, user_id)

    def _docs_to_tasks(self, docs, user_id):
        tasks = []
        for doc in docs:
            d = doc.to_dict()
            tasks.append(Task(
                id=doc.id,
                title=d.get('title', ''),
                description=d.get('description', ''),
                priority=d.get('priority', 'Medium'),
                estimated_hours=d.get('estimated_hours', 1.0),
                deadline=d.get('deadline', ''),
                assigned_to=d.get('assigned_to'),
                status=d.get('status', 'Pending'),
                user_id=user_id
            ))
        return tasks

    def update_task_status(self, task_id: int, status: str): 
        # Interface takes int, but we need to find it relative to user?
        # WARNING: We need user_id to find the task in nested collection OR group query.
        # But method signature doesn't pass user_id?
        # The logic.py passes task_id.
        # We assume for now we use Collection Group query or we need to pass user_id.
        # Ideally, we should update logic to pass user_id.
        # For hackathon, I'll use Collection Group query for ID? No, that's slow/expensive.
        # I'll update the signature later. For now, let's assume we can't easily find a task without user_id if strict isolation.
        # But wait, logic.py DOES have user_id in some places.
        # Actually logic calls `update_task_status(item["task_id"], "Scheduled")`.
        # I MUST update logic.py to pass user_id to these methods too.
        pass 

    def update_task_status_with_user(self, task_id: str, status: str, user_id: str):
        self._user_ref(user_id).collection('tasks').document(str(task_id)).update({"status": status})

    def create_schedule(self, employee_id: str, task_id: str, day: str, start: str, end: str, 
                       task_title: str = "", emp_name: str = "", priority: str = "", user_id: str = "1") -> str:
        ref = self._user_ref(user_id).collection('schedules').document()
        ref.set({
            "employee_id": str(employee_id),
            "task_id": str(task_id),
            "scheduled_day": day,
            "start_time": start,
            "end_time": end,
            "task_title": task_title,
            "emp_name": emp_name,
            "priority": priority,
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return ref.id

    def clear_schedule_for_task(self, task_id: str, user_id: str = "1"): 
        # Need user_id to find
        docs = self._user_ref(user_id).collection('schedules').where('task_id', '==', str(task_id)).stream()
        for doc in docs:
            doc.reference.delete()

    def clear_entire_schedule(self, user_id: str = "1"):
        docs = self._user_ref(user_id).collection('schedules').stream()
        for doc in docs:
            doc.reference.delete()
            
    def get_task_schedule(self, task_id: str, user_id: str = "1") -> Optional[dict]:
        docs = self._user_ref(user_id).collection('schedules').where('task_id', '==', str(task_id)).limit(1).stream()
        for doc in docs:
            d = doc.to_dict()
            d['id'] = doc.id
            return d
        return None

    # Chatbot
    def create_session(self, title: str = "New Chat", user_id: str = "1") -> str:
        ref = self._user_ref(user_id).collection('sessions').document()
        ref.set({
            "title": title,
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return ref.id

    def get_all_sessions(self, user_id: str = "1") -> List[Dict[str, Any]]:
        docs = self._user_ref(user_id).collection('sessions').order_by('created_at', direction=firestore.Query.DESCENDING).stream()
        res = []
        for doc in docs:
            d = doc.to_dict()
            d['id'] = doc.id
            res.append(d)
        return res

    def get_session(self, session_id: str, user_id: str = "1") -> Optional[Dict[str, Any]]:
        if not session_id: return None
        doc = self._user_ref(user_id).collection('sessions').document(str(session_id)).get()
        if doc.exists:
            d = doc.to_dict()
            d['id'] = doc.id
            return d
        return None

    def update_session_title(self, session_id: str, title: str, user_id: str = "1"):
        self._user_ref(user_id).collection('sessions').document(str(session_id)).update({"title": title})

    def delete_session(self, session_id: str, user_id: str = "1"):
        # Delete logs
        logs = self._user_ref(user_id).collection('sessions').document(str(session_id)).collection('logs').stream()
        for log in logs:
            log.reference.delete()
        
        self._user_ref(user_id).collection('sessions').document(str(session_id)).delete()

    def log_message(self, role: str, content: str, session_id: str, sentiment: str = None, intent: str = None, user_id: str = "1"):
        self._user_ref(user_id).collection('sessions').document(str(session_id)).collection('logs').add({
            "role": role,
            "content": content,
            "sentiment": sentiment,
            "intent": intent,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

    def get_recent_conversation(self, limit: int = 10, session_id: str = "1", user_id: str = "1") -> List[Dict[str, Any]]:
        docs = self._user_ref(user_id).collection('sessions').document(str(session_id)).collection('logs')\
            .order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).stream()
        res = []
        for doc in docs:
            res.append(doc.to_dict())
        return list(reversed(res))

    def get_session_history(self, session_id: str, user_id: str = "1") -> List[Dict[str, Any]]:
        docs = self._user_ref(user_id).collection('sessions').document(str(session_id)).collection('logs')\
            .order_by('timestamp', direction=firestore.Query.ASCENDING).stream()
        res = []
        for doc in docs:
            d = doc.to_dict()
            res.append({"role": d['role'], "content": d['content']})
        return res

    def set_user_preference(self, key: str, value: str, user_id: str = "1"):
        self._user_ref(user_id).collection('preferences').document(key).set({"value": value})

    def get_user_preference(self, key: str, user_id: str = "1") -> Optional[str]:
        doc = self._user_ref(user_id).collection('preferences').document(key).get()
        if doc.exists:
            return doc.to_dict().get('value')
        return None

    def log_wellness(self, stress_level: int, mood: str, notes: str = "", user_id: str = "1"):
        self._user_ref(user_id).collection('wellness_logs').add({
            "stress_level": stress_level,
            "mood": mood,
            "notes": notes,
            "date": firestore.SERVER_TIMESTAMP
        })
