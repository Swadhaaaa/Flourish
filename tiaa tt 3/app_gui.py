import streamlit as st
import pandas as pd
from scheduler_app.database.db_manager import DBManager
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI
from scheduler_app.scheduler.logic import SchedulerEngine

# Page Config
st.set_page_config(page_title="AI Scheduler", page_icon="📅", layout="wide")

# Initialize Logic
if 'engine' not in st.session_state:
    db = DBManager()
    ai = GroqSchedulerAI()
    st.session_state.engine = SchedulerEngine(db, ai)
    st.session_state.db = db

# Styles - Enterprise / Professional
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    /* Hide Streamlit Header/Footer */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Main Content Area adjustments */
    .block-container {
        padding-top: 2rem;
        max_width: 55rem;
    }
    
    /* Title Styling - Clean & Professional */
    .main-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    /* Chat Message Styling */
    .stChatMessage {
        background-color: transparent;
        border: none;
    }
    .stChatMessage .stMarkdown {
        padding: 5px; /* Minimal padding */
    }
    
    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: #111827;
        color: white;
    }
    [data-testid="stSidebar"] p, [data-testid="stSidebar"] span, [data-testid="stSidebar"] label {
        color: #f3f4f6 !important;
    }
    /* Ensure radio buttons are visible */
    [data-testid="stRadio"] > div {
        color: #f3f4f6 !important;
    }

</style>
""", unsafe_allow_html=True)

# Sidebar Navigation & Management
with st.sidebar:
    st.markdown("### Flourish")
    
    # Navigation Switcher
    view_mode = st.radio(
        "Menu", 
        ["Chat", "Weekly Schedule", "Tasks", "Team"],
        label_visibility="collapsed"
    )
    
    st.divider()

    # Chat Session Management (Only visible in Chat mode)
    if view_mode == "Chat":
        if st.button("➕ New Chat", type="primary", use_container_width=True):
            new_id = st.session_state.db.create_session()
            st.session_state.current_session_id = new_id
            st.session_state.messages = []
            st.rerun()

        st.markdown("#### History")
        sessions = st.session_state.db.get_all_sessions()
        for s in sessions:
            label = s['title'][:22] + "..." if len(s['title']) > 22 else s['title']
            if st.button(f"{label}", key=f"sess_{s['id']}", use_container_width=True):
                st.session_state.current_session_id = s['id']
                st.rerun()

        # Bottom Actions
        st.divider()
        is_private = st.session_state.db.get_user_preference("private_mode") == "true"
        incognito = st.toggle("Incognito Mode", value=is_private)
        new_pref = "true" if incognito else "false"
        if (new_pref == "true") != is_private:
             st.session_state.db.set_user_preference("private_mode", new_pref)
             st.rerun()

        def delete_current_chat():
            if "current_session_id" in st.session_state:
                st.session_state.db.delete_session(st.session_state.current_session_id)
                del st.session_state.current_session_id
                st.session_state.messages = []
                
        if "current_session_id" in st.session_state:
             st.button("Delete Chat", use_container_width=True, on_click=delete_current_chat)


# --- MAIN CONTENT AREA ---

# Professional Icons (Initials)
AI_AVATAR = "https://ui-avatars.com/api/?name=Flourish+AI&background=0D8ABC&color=fff&size=128"
USER_AVATAR = "https://ui-avatars.com/api/?name=User&background=6b7280&color=fff&size=128"

if view_mode == "Chat":
    # Initialize Session
    if "current_session_id" not in st.session_state:
        existing_sessions = st.session_state.db.get_all_sessions()
        if existing_sessions:
            st.session_state.current_session_id = existing_sessions[0]['id']
        else:
            new_id = st.session_state.db.create_session()
            st.session_state.current_session_id = new_id
        st.session_state.messages = []

    # Content
    current_logs = st.session_state.db.get_session_history(st.session_state.current_session_id)
    st.session_state.messages = [{"role": l["role"], "content": l["content"]} for l in current_logs]

    if not st.session_state.messages:
        # Welcome Screen - Professional
        col1, col2, col3 = st.columns([1,2,1])
        with col2:
            st.markdown("""
            <div style='text-align: center; margin-top: 15vh; margin-bottom: 5vh;'>
                <h1>Welcome to Flourish</h1>
                <p>Your intelligent assistant for workforce scheduling and wellness.</p>
            </div>
            """, unsafe_allow_html=True)
            



    for message in st.session_state.messages:
        role = message["role"]
        avatar = AI_AVATAR if role == "assistant" else USER_AVATAR
        with st.chat_message(role, avatar=avatar):
            st.markdown(message["content"])

    if prompt := st.chat_input("Type your message..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar=USER_AVATAR):
            st.markdown(prompt)

        with st.spinner("Processing..."):
            response = st.session_state.engine.handle_user_message(prompt, st.session_state.current_session_id)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
        with st.chat_message("assistant", avatar=AI_AVATAR):
            st.markdown(response)
            
        if len(st.session_state.messages) <= 2 and not incognito:
            st.rerun()

elif view_mode == "Team":
    st.title("Team Management")
    col1, col2 = st.columns([1, 2])
    with col1:
        st.subheader("Add Employee")
        with st.form("add_employee_form"):
            name = st.text_input("Name")
            role = st.text_input("Role")
            email = st.text_input("Email")
            limit = st.number_input("Hours Limit", min_value=1, value=40)
            if st.form_submit_button("Add"):
                if name:
                    st.session_state.db.add_employee(name, role, email, limit)
                    st.success(f"Added {name}")
                    st.rerun()
    with col2:
        st.subheader("Directory")
        employees = st.session_state.db.get_all_employees()
        if employees:
            data = [{"Name": e.name, "Role": e.role, "Email": e.email} for e in employees]
            st.dataframe(data, use_container_width=True)

elif view_mode == "Tasks":
    st.title("Task Board")
    col1, col2 = st.columns([1, 2])
    with col1:
        st.subheader("New Task")
        with st.form("add_task_form"):
            title = st.text_input("Title")
            desc = st.text_area("Details")
            priority = st.selectbox("Priority", ["High", "Medium", "Low"])
            hours = st.number_input("Hours", 0.5, 10.0, 1.0)
            deadline = st.text_input("Deadline")
            if st.form_submit_button("Create Task"):
                st.session_state.db.add_task(title, desc, priority, hours, deadline)
                st.success("Task Created")
                st.rerun()
    with col2:
        st.subheader("Backlog")
        tasks = st.session_state.db.get_all_active_tasks()
        if tasks:
            t_data = pd.DataFrame([{"ID": t.id, "Title": t.title, "Priority": t.priority, "Status": t.status} for t in tasks])
            st.dataframe(t_data, use_container_width=True, hide_index=True)

elif view_mode == "Weekly Schedule":
    st.title("Weekly Schedule")
    c1, c2 = st.columns([3, 1])
    with c2:
        if st.button("Generate Schedule", type="primary"):
            with st.spinner("Optimizing..."):
                st.session_state.engine.generate_and_save_schedule("")
                st.rerun()
        if st.button("Clear Schedule"):
            st.session_state.db.clear_entire_schedule()
            with st.session_state.db.get_connection() as conn:
                conn.execute("UPDATE tasks SET status = 'Pending' WHERE status = 'Scheduled'")
                conn.commit()
            st.rerun()
    with c1:
        query = """
        SELECT s.scheduled_day, s.start_time, s.end_time, e.name as emp_name, t.title as task_title 
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        JOIN tasks t ON s.task_id = t.id
        ORDER BY s.scheduled_day, s.start_time
        """
        with st.session_state.db.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        st.dataframe(df, use_container_width=True, hide_index=True)
