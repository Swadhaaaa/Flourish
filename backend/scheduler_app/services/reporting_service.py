from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from scheduler_app.services.tone_analyzer import ToneAnalysisResult, RiskLevel
from scheduler_app.services.gmail_service import EmailData

class Report(BaseModel):
    email_id: str
    timestamp: datetime
    risk_level: RiskLevel
    details: ToneAnalysisResult
    subject: str
    sender: str
    recipient: str
    body: str

# In-memory storage for reports (Simulating a database)
reports_db = []

def create_report(email: EmailData, analysis: ToneAnalysisResult) -> Report:
    """
    Creates a detailed report for HR/Admin when an email is flagged.
    """
    report = Report(
        email_id=email.id,
        timestamp=datetime.now(),
        risk_level=analysis.risk_level,
        details=analysis,
        subject=email.subject,
        sender=email.sender,
        recipient=email.recipient,
        body=email.body
    )
    reports_db.append(report)
    return report

def get_all_reports():
    return reports_db
