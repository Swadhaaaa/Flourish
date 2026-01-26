import pickle
import os
from enum import Enum
from pydantic import BaseModel
from typing import List, Optional

# Define Models Inline to avoid dependency issues
class RiskLevel(str, Enum):
    SAFE = "Safe"
    MILD = "Mild"
    MODERATE = "Moderate"
    SEVERE = "Severe"

class ToneAnalysisResult(BaseModel):
    risk_level: RiskLevel
    confidence: float
    analysis_text: str
    flagged_phrases: List[str] = []
    tone_category: Optional[str] = "Neutral"
    is_toxic: Optional[bool] = False
    rewritten: Optional[str] = None
    is_invisible_labor: Optional[bool] = False

# Global model cache to avoid reloading on every request
_model = None
_vectorizer = None

def load_model():
    global _model, _vectorizer
    try:
        # Load from current directory
        current_dir = os.path.dirname(__file__)
        model_path = os.path.join(current_dir, "model.pkl")
        vec_path = os.path.join(current_dir, "vectorizer.pkl")
        
        if os.path.exists(model_path) and os.path.exists(vec_path):
            with open(model_path, 'rb') as f:
                _model = pickle.load(f)
            with open(vec_path, 'rb') as f:
                _vectorizer = pickle.load(f)
            print("ML Model loaded successfully.")
        else:
            print(f"ML Model not found at {model_path}. Please check file copy.")
    except Exception as e:
        print(f"Error loading model: {e}")

# Load on startup (or when module is imported)
load_model()

def analyze_tone(text: str) -> ToneAnalysisResult:
    """
    Analyzes the tone of the email text using a trained ML model.
    """
    global _model, _vectorizer
    
    # Fallback if model isn't loaded
    if not _model or not _vectorizer:
        return ToneAnalysisResult(
            risk_level=RiskLevel.SAFE,
            confidence=0.0,
            analysis_text="ML Model not active. Falling back to Safe.",
            flagged_phrases=[]
        )
        
    try:
        # Preprocess and Vectorize
        text_vec = _vectorizer.transform([text])
        
        # Predict
        prediction = _model.predict(text_vec)[0]
        probs = _model.predict_proba(text_vec)[0]
        
        confidence = float(max(probs))
        flagged_phrases = []
        is_toxic = False
        tone_cat = "Professional"
        
        if prediction == "Unsafe":
            risk_level = RiskLevel.SEVERE
            flagged_phrases = ["Toxic Content detected by ML"]
            analysis_text = f"Model flagged this content as Unsafe with {confidence:.2%} confidence."
            is_toxic = True
            tone_cat = "Toxic"
        else:
            risk_level = RiskLevel.SAFE
            analysis_text = f"Model analyzed content as Professional with {confidence:.2%} confidence."
            
        return ToneAnalysisResult(
            risk_level=risk_level,
            confidence=confidence,
            analysis_text=analysis_text,
            flagged_phrases=flagged_phrases,
            tone_category=tone_cat,
            is_toxic=is_toxic,
            rewritten=None # To be populated by LLM if needed
        )
            
    except Exception as e:
        print(f"Prediction error: {e}")
        return ToneAnalysisResult(
            risk_level=RiskLevel.SAFE,
            confidence=0.0,
            analysis_text=f"Error during analysis: {e}",
            flagged_phrases=[]
        )
