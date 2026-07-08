# Security Specifications

This document outlines the security measures, encryptions, and validations in place.

## Data Encryption

### 1. Token Encryption at Rest
Google OAuth tokens and refresh codes must be secured when stored in the cloud.
- **Algorithm**: Fernet (Symmetric Encryption built on AES-128 in CBC mode with HMAC-SHA256).
- **Key Storage**: Managed via the `ENCRYPTION_KEY` environment variable.
- **Implementation**: The `FirestoreManager` translates OAuth payload parameters:
  ```python
  encrypted_token = fernet.encrypt(raw_token.encode('utf-8'))
  ```

### 2. Transport Security
- All API communication over the public internet utilizes **HTTPS** (enforced by Vercel and Render).
- Real-time Socket.io messages are routed via Secure WebSockets (`wss://`).

## Authentication & Authorization

- **Client Authentication**: Handled using Firebase Authentication (Google Identity Provider).
- **Backend Protection**: User IDs (`user_id` / `uid`) are matched on CRUD commands to guarantee isolation. Users cannot view or modify another person's schedules, tasks, or mood logs.

## Content Sanitization

- Input parameters are validated at the boundaries using **Pydantic Models** in FastAPI.
- Scraper inputs are filtered to avoid server-side request forgery (SSRF).
