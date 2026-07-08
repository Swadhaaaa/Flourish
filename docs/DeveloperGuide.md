# Developer Guide

This document describes how to set up the development environment, run tests, and manage the code.

## Prerequisites
- Node.js (v20 or higher)
- Python (3.10 or higher)
- Git

---

## Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in variables:
   ```bash
   cp .env.example .env
   ```
5. Place your Firestore service account credentials in `serviceAccountKey.json`.
6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

---

## Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configurations:
   ```bash
   cp .env.example .env.local
   ```
4. Start the Vite server:
   ```bash
   npm run dev
   ```

---

## Running Tests

### Backend Tests
Execute pytest to run Python unit tests:
```bash
cd backend
pytest
```
