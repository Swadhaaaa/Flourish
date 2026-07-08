# Flourish Codebase Structure & Navigation

This document explains the organization and components of the Flourish repository.

```
Flourish---TIAA-Hackathon/
├── .github/                  # GitHub configuration and CI/CD pipelines
│   └── workflows/            # Automated check-ins (Linting, Formatting)
├── assets/                   # Visual resources and screenshots
│   ├── screenshots/
│   ├── demo/
│   └── logos/
├── backend/                  # FastAPI & AI Engine Application
│   ├── data/                 # Raw and processed dataset files
│   ├── models/               # Pickled machine learning models and encoders
│   ├── routers/              # Endpoint routing (auth, scheduler, tone shield)
│   ├── scheduler_app/        # Core scheduling system
│   │   ├── ai_engine/        # Groq client integrations
│   │   ├── database/         # SQLite and Firestore managers
│   │   └── scheduler/        # Core time allocation engine
│   ├── main.py               # Main application entry point & Socket.io wrapper
│   └── requirements.txt      # Python dependencies
├── docs/                     # Technical architecture and guidebooks
├── frontend/                 # React & Vite Single-Page Application (SPA)
│   ├── src/
│   │   ├── components/       # Common visual UI widgets
│   │   ├── context/          # State providers (Auth, Mode selection, Theme)
│   │   ├── layouts/          # Top-level view wrappers
│   │   ├── pages/            # View components (Home & Work modes)
│   │   └── services/         # API HTTP communication wrapper
│   └── package.json          # Node dependencies
├── sql/                      # Relational database schemas
└── LICENSE                   # MIT License
```

## Directory Reference

### 1. `backend/`
- **`main.py`**: Boots the FastAPI server and handles ASGI routing alongside the Socket.io asynchronous events server (real-time chat coordination).
- **`ai_service.py`**: Interacts with the AI model providers for sentiment analysis and reflection logic.
- **`scraper_service.py`**: Implements custom web scraping using BeautifulSoup to gather local event opportunities for employee engagement.

### 2. `frontend/`
- **`src/context/`**: Manages user session state, dark/light theme options, and switches between Home (personal) and Work (professional) workflows.
- **`src/pages/`**: Home Mode features (Diet Planner, Period Tracker, Scheduler) and Work Mode features (Auto Scheduler, Tone Shield, Safe Cab, Helpline).
