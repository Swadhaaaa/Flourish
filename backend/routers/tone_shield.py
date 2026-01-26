from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from scheduler_app.services.tone_analyzer import analyze_tone, ToneAnalysisResult, RiskLevel

router = APIRouter(prefix="/api/ai/tone-shield", tags=["Tone Shield"])

class ToneRequest(BaseModel):
    content: str
    sender: str

@router.post("", response_model=ToneAnalysisResult)
async def analyze_tone_shield(request: ToneRequest):
    """
    Analyze email content for tone and toxicity.
    """
    try:
        # 1. Run ML Analysis
        result = analyze_tone(request.content)
        
        # 2. Add 'Rewrite' Logic (Mock/Heuristic for now, or call LLM if available)
        if result.is_toxic:
             result.rewritten = "Rephrased: " + request.content.replace("stupid", "unclear").replace("hate", "disagree with") + " [AI Softened]"
        
        # 3. Check for Invisible Labor
        labor_keywords = ["schedule", "plan", "organize", "take notes", "book", "order lunch"]
        if any(word in request.content.lower() for word in labor_keywords):
            result.is_invisible_labor = True
            result.flagged_phrases.append("Potential Invisible Labor Request")
            
        return result
        
    except Exception as e:
        print(f"Tone Shield Error: {e}")
        return ToneAnalysisResult(
            risk_level=RiskLevel.SAFE,
            confidence=0.0,
            analysis_text="Error processing request.",
            flagged_phrases=[],
            tone_category="Error"
        )

# --- New Endpoints from TIAA TS ---

from scheduler_app.services.gmail_service import gmail_service
from scheduler_app.services.reporting_service import create_report, get_all_reports, Report

@router.post("/sync-gmail", response_model=list[ToneAnalysisResult])
async def sync_gmail():
    """
    Fetch recent emails from Gmail and analyze them.
    """
    # Increased limit to ensure we capture more emails as requested
    emails = gmail_service.fetch_recent_emails(max_results=10)
    results = []
    
    # Process (Oldest -> Newest)
    for email in reversed(emails):
        # Analyze
        result = analyze_tone(email.body)
        
        # Rewrite if toxic
        if result.is_toxic:
             result.rewritten = "Rephrased: " + email.body.replace("stupid", "unclear") + " [AI Softened]"

        # Create Report
        create_report(email, result)
        
        results.append(result)
        
    return results

@router.get("/reports", response_model=list[Report])
async def get_reports():
    """
    Get all generated reports.
    """
    return get_all_reports()

@router.get("/status")
async def get_status():
    """
    Get the current connection status.
    """
    email = gmail_service.get_profile_email()
    return {
        "connected_email": email,
        "last_scanned_email": gmail_service.last_scanned_email
    }
