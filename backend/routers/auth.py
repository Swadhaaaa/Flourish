from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from scheduler_app.services.gmail_service import gmail_service
import os
import json

from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class FirebaseTokenRequest(BaseModel):
    user_id: str
    access_token: str
    email: Optional[str] = None

@router.get("/google/url")
async def get_google_auth_url(user_id: str, request: Request):
    """Generates the Google OAuth URL for the user to authorize Gmail."""
    try:
        # Dynamic redirect based on where the app is being called from
        base_url = str(request.base_url).rstrip('/')
        
        # Hardcoded Production URI (Highest reliability for Render)
        if "localhost" not in base_url and "127.0.0.1" not in base_url:
            redirect_uri = "https://tea-hack.onrender.com/api/auth/google/callback"
        else:
            redirect_uri = f"{base_url}/api/auth/google/callback"
        
        # Override with ENV variable if explicitly set
        env_redirect = os.getenv("GOOGLE_REDIRECT_URI")
        if env_redirect and len(env_redirect) > 0:
            redirect_uri = env_redirect.strip()
        
        redirect_uri = redirect_uri.strip()
        print(f"FORCING PRODUCTION REDIRECT: {redirect_uri}")
        
        url = gmail_service.get_authorization_url(user_id, redirect_uri)
        return {"url": url}
    except Exception as e:
        error_msg = str(e)
        print(f"Auth URL Error: {error_msg}")
        if "credentials.json not found" in error_msg:
            return JSONResponse(
                status_code=500, 
                content={"error": "Server Configuration Missing: Please set GOOGLE_CREDENTIALS_JSON in Render settings."}
            )
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/google/callback")
async def google_auth_callback(request: Request):
    """The callback URL that Google redirects to after authorization."""
    code = request.query_params.get("code")
    user_id = request.query_params.get("state") # We stored this in state earlier
    
    frontend_url = os.getenv("FRONTEND_URL", "https://flourishh.vercel.app")
    
    # Must use the same redirect_uri that was used for the code generation
    base_url = str(request.base_url).rstrip('/')
    if "localhost" not in base_url and "127.0.0.1" not in base_url:
        redirect_uri = "https://tea-hack.onrender.com/api/auth/google/callback"
    else:
        redirect_uri = f"{base_url}/api/auth/google/callback"
    
    env_redirect = os.getenv("GOOGLE_REDIRECT_URI")
    if env_redirect and len(env_redirect) > 0:
        redirect_uri = env_redirect.strip()
    
    redirect_uri = redirect_uri.strip()
    
    if not code or not user_id:
        print("Callback missing code or state")
        return RedirectResponse(url=f"{frontend_url}/work/tone-shield?status=error")
        
    try:
        gmail_service.exchange_code(user_id, code, redirect_uri)
        # Redirect back to the Tone Shield page with a success status
        return RedirectResponse(url=f"{frontend_url}/work/tone-shield?status=connected")
    except Exception as e:
        print(f"Callback Exchange Error: {e}")
        return RedirectResponse(url=f"{frontend_url}/work/tone-shield?status=error")

@router.post("/auth/google/firebase-token")
async def save_firebase_token(req: FirebaseTokenRequest):
    """Saves a token received directly from the frontend (Firebase Popup)."""
    try:
        success = gmail_service.set_firebase_token(req.user_id, req.access_token)
        if success:
            return {"status": "success", "message": "Token saved successfully"}
        else:
            return {"status": "error", "message": "Failed to save token"}
    except Exception as e:
        print(f"Firebase token save error: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/debug")
async def auth_debug(request: Request):
    """Debug endpoint to verify production OAuth settings."""
    base_url = str(request.base_url).rstrip('/')
    
    # Check if HTTPS is being forced correctly
    is_prod = "localhost" not in base_url and "127.0.0.1" not in base_url
    forced_base = base_url.replace('http://', 'https://') if is_prod else base_url
    
    # Check env vars
    env_redirect = os.getenv("GOOGLE_REDIRECT_URI")
    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    
    # Extract client_id from JSON to verify it's the right one
    client_config = gmail_service._get_indestructible_config()
    active_client_id = client_config.get("web", {}).get("client_id", "ID NOT FOUND") if client_config else "INVALID JSON"

    # The final URI we are sending to Google
    final_uri = "https://tea-hack.onrender.com/api/auth/google/callback"
    
    # Generate a REAL test link
    test_link = "Not possible (no creds found)"
    try:
        test_link = gmail_service.get_authorization_url("debug_test_user", final_uri)
    except Exception as e:
        test_link = f"Error generating link: {str(e)}"
    
    # Forensic check for hidden characters (masking middle for security)
    creds_len = len(creds_json) if creds_json else 0
    creds_preview = f"{creds_json[:5]}...{creds_json[-5:]}" if creds_len > 10 else "SHORT"
    
    return {
        "debug_version": "6.0 (FIREBASE_RESCUE)",
        "is_production_mode": is_prod,
        "final_redirect_uri_being_sent": final_uri,
        "credentials_json_found": "Yes" if creds_json else "No",
        "active_client_id": active_client_id,
        "FIREBASE_FLOW_READY": "Yes",
        "CHECKLIST_1_POPUP": "Ensure browser popups are allowed",
        "CHECKLIST_2_FIREBASE_URI": "URI 1 in Google Console must be registered (Firebase Callback)"
    }
