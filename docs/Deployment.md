# Deployment Guide

This document covers production builds, deployments, and cloud platform setups.

## Frontend (Vercel)

The frontend is a static React application powered by Vite, deployed on Vercel.

### Configuration
`vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Steps to Deploy
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` directory as the project root.
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Set Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_BACKEND_URL` (Points to Render Backend)

---

## Backend (Render)

The backend is a FastAPI Python application running as a Web Service on Render.

### Configuration
- **Runtime**: Python 3.10+
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Steps to Deploy
1. Create a new Web Service on Render.
2. Set the root directory to `backend`.
3. Add Environment Variables:
   - `GROQ_API_KEY`
   - `ENCRYPTION_KEY`
   - `GOOGLE_REDIRECT_URI`
   - `FRONTEND_URL`
4. Attach `serviceAccountKey.json` or write service accounts as an environment variable (`GOOGLE_CREDENTIALS_JSON`) to populate authentication certificates at runtime.
