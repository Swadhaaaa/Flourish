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
        # If toxic, we want to offer a rewrite.
        if result.is_toxic:
             result.rewritten = "Rephrased: " + request.content.replace("stupid", "unclear").replace("hate", "disagree with") + " [AI Softened]"
        
        # 3. Check for Invisible Labor (Simple keyword check for now)
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
