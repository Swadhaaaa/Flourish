# AI-Powered Terminal-Based Smart Work-Life Balance Scheduler

This is a terminal-based application designed to help female associates manage their work-life balance through intelligent scheduling. It uses the Groq API to parse natural language inputs and generate optimized schedules.

## Features
- **Conversational Interface**: Add tasks and constraints using natural language.
- **AI Scheduling**: Automatically assigns tasks to employees while respecting workload limits.
- **Workload Analysis**: Detects stress signals and suggests improvements.
- **Terminal UI**: Rich, colored interface for easy interaction.

## Setup

1. **Prerequisites**: Python 3.8+
2. **Environment**:
   - Ensure `.env` contains your `GROQ_API_KEY`.
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```

## Usage

Run the application (GUI):
```bash
streamlit run app_gui.py
```

Run the application (CLI):
```bash
python run.py
```

### Commands
- `add employee`: Interactive prompt to add a new team member.
- `list employees`: View all current employees.
- `chat`: Enter the conversational mode.
  - *Example*: "Add a task 'Prepare Q4 Slides' for Monday due in 3 hours."
- `generate schedule`: AI parses pending tasks and assigns them.
- `view schedule`: See the generated weekly plan.
- `exit`: Quit the application.

## Architecture
- `scheduler_app/ui/cli.py`: Main interaction loop.
- `scheduler_app/ai_engine/groq_client.py`: Integration with Groq LLM.
- `scheduler_app/scheduler/logic.py`: Core logic combining DB and AI.
- `scheduler_app/database/models.py`: SQLite data models.
