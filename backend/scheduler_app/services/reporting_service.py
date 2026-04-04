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
# Initial Seed Reports for Demo
reports_db = [
    Report(
        email_id="seed_1",
        timestamp=datetime.now(),
        risk_level=RiskLevel.SEVERE,
        details=ToneAnalysisResult(risk_level=RiskLevel.SEVERE, confidence=0.92, analysis_text="Extremely aggressive and unprofessional tone found.", flagged_phrases=["you're useless"], tone_category="Aggressive"),
        subject="Regarding your performance",
        sender="Angry Manager <manager@company.com>",
        recipient="You",
        body="This is completely unacceptable. You're useless if you can't finish this by 5 PM."
    ),
    Report(
        email_id="seed_2",
        timestamp=datetime.now(),
        risk_level=RiskLevel.MODERATE,
        details=ToneAnalysisResult(risk_level=RiskLevel.MODERATE, confidence=0.75, analysis_text="Dismissive and passive-aggressive tone detected.", flagged_phrases=["As per my last email"], tone_category="Passive Aggressive"),
        subject="Status Update",
        sender="Co-worker <colleague@company.com>",
        recipient="You",
        body="As per my last email, the deadline was yesterday. Is there a reason you're ignoring me?"
    ),
    Report(
        email_id="seed_3",
        timestamp=datetime.now(),
        risk_level=RiskLevel.SAFE,
        details=ToneAnalysisResult(risk_level=RiskLevel.SAFE, confidence=0.88, analysis_text="Professional and clear communication.", flagged_phrases=[], tone_category="Supportive"),
        subject="Project Kickoff",
        sender="Supportive Peer <peer@company.com>",
        recipient="You",
        body="Hi! Looking forward to working together on the new project. Let me know if you need any help!"
    )
]

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
