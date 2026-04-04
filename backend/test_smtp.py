import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def test_email():
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")
    recipient_email = sender_email # Send to self for testing

    print(f"Testing with Sender: {sender_email}")
    
    if not sender_email or not sender_password:
        print("Error: SMTP credentials not found in .env")
        return

    msg = MIMEMultipart()
    msg['From'] = f"Flourish Test <{sender_email}>"
    msg['To'] = recipient_email
    msg['Subject'] = "SMTP Test Connection"
    msg.attach(MIMEText("This is a test email to verify SMTP credentials.", 'plain'))

    try:
        print("Connecting to SMTP server...")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            print("Logging in...")
            server.login(sender_email, sender_password)
            print("Sending message...")
            server.send_message(msg)
        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

if __name__ == "__main__":
    test_email()
