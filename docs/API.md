# API Specification

This document details the HTTP endpoints provided by the Flourish backend.

## Base URL
- Local: `http://localhost:8000`
- Production: `https://tea-hack.onrender.com`

---

## 1. Authentication (`/api/auth`)

### `GET /api/auth/google/url`
Generates the Google OAuth authorization URL for authorization to read/write email data.
- **Parameters**: `user_id` (Query string)
- **Response**:
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
  ```

### `GET /api/auth/google/callback`
Google redirect target callback. Processes authorization code.
- **Parameters**: `code` (Query string), `state` (Query string, stores `user_id`)

### `POST /api/auth/google/firebase-token`
Saves an access token obtained directly from the client.
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "access_token": "string",
    "email": "string"
  }
  ```

---

## 2. Auto Scheduler (`/api/scheduler`)

### `POST /api/scheduler/chat`
Sends messages to the scheduler assistant chat channel.
- **Request Body**:
  ```json
  {
    "message": "string",
    "session_id": "string",
    "user_id": "string"
  }
  ```

### `POST /api/scheduler/generate`
Generates an optimized bento schedule based on user tasks and availability limits.
- **Request Body**:
  ```json
  {
    "constraints": "string",
    "user_id": "string"
  }
  ```

---

## 3. Burnout Watch (`/api/burnout`)

### `POST /api/burnout/predict`
Calculates burnout risk based on parameters.
- **Request Body**:
  ```json
  {
    "gender": "Female" | "Male",
    "company_type": "Service" | "Product",
    "wfh_setup": "Yes" | "No",
    "designation": 0.0,
    "resource_allocation": 0.0,
    "mental_fatigue": 0.0
  }
  ```
- **Response**:
  ```json
  {
    "burnout_score": 0.45,
    "risk_level": "Moderate"
  }
  ```

---

## 4. Tone Shield (`/api/tone`)

### `POST /api/tone/analyze`
Extracts and sanitizes text strings to review conflicts or aggressive undertones.
- **Request Body**:
  ```json
  {
    "text": "Please get this done now, otherwise there will be consequences."
  }
  ```
- **Response**:
  ```json
  {
    "is_aggressive": true,
    "rewritten_text": "Could you please prioritize completing this task when possible? Thank you."
  }
  ```
