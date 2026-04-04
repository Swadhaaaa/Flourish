from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from scheduler_app.services.gmail_service import gmail_service
import os

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/google/url")
async def get_google_auth_url(user_id: str, request: Request):
    """Generates the Google OAuth URL for the user to authorize Gmail."""
    try:
        # Dynamic redirect based on where the app is being called from
        base_url = str(request.base_url).rstrip('/')
        
        # Use ENV variable if explicitly set (best for production)
        env_redirect = os.getenv("GOOGLE_REDIRECT_URI")
        if env_redirect:
            redirect_uri = env_redirect
        else:
            # Force https for any production-like environment (non-localhost)
            if "localhost" not in base_url and "127.0.0.1" not in base_url:
                base_url = base_url.replace("http://", "https://")
            redirect_uri = f"{base_url}/api/auth/google/callback"
        
        print(f"Generating Auth URL for redirect: {redirect_uri}")
        
        url = gmail_service.get_authorization_url(user_id, redirect_uri)
        return {"url": url}
    except Exception as e:
        print(f"Auth URL Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/google/callback")
async def google_auth_callback(request: Request):
    """The callback URL that Google redirects to after authorization."""
    code = request.query_params.get("code")
    user_id = request.query_params.get("state") # We stored this in state earlier
    
    frontend_url = os.getenv("FRONTEND_URL", "https://flourishh.vercel.app")
    
    # Must use the same redirect_uri that was used for the code generation
    base_url = str(request.base_url).rstrip('/')
    env_redirect = os.getenv("GOOGLE_REDIRECT_URI")
    if env_redirect:
        redirect_uri = env_redirect
    else:
        if "localhost" not in base_url and "127.0.0.1" not in base_url:
            base_url = base_url.replace("http://", "https://")
        redirect_uri = f"{base_url}/api/auth/google/callback"
    
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
