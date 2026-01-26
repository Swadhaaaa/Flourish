import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from typing import List
from typing import List, Optional
from pydantic import BaseModel

class EmailData(BaseModel):
    id: str
    sender: str
    recipient: str
    subject: str
    body: str

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailService:
    def __init__(self):
        self.creds = None
        self.service = None
        self.last_scanned_email = None # Track the last scanned email

    def get_profile_email(self):
        """Returns the email address of the authenticated user."""
        if not self.service:
            return None
        try:
            profile = self.service.users().getProfile(userId='me').execute()
            return profile.get('emailAddress')
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None
        
    def authenticate(self):
        """Authenticates the user, forcing account selection if no token exists."""
        # Check for existing token
        if os.path.exists('token.json'):
            self.creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                    self.creds.refresh(Request())
                except Exception:
                   self.creds = None

            if not self.creds:
                if not os.path.exists('credentials.json'):
                    raise FileNotFoundError("credentials.json not found. Please place it in the project root.")
                    
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                # prompt='select_account' forces the account chooser
                self.creds = flow.run_local_server(port=0, prompt='select_account')
            
                # Save the credentials for the next run
                with open('token.json', 'w') as token:
                    token.write(self.creds.to_json())

        self.service = build('gmail', 'v1', credentials=self.creds)
        print("Gmail service authenticated.")

    def fetch_recent_emails(self, max_results=10) -> List[EmailData]:
        if not self.service:
            print("Service not initialized. Authenticating...")
            try:
                self.authenticate()
            except Exception as e:
                print(f"Authentication failed: {e}")
                return []

        try:
            # Filter for Primary Inbox only (ignores Promotions, Social, Updates)
            results = self.service.users().messages().list(
                userId='me', 
                maxResults=max_results, 
                q='category:primary is:inbox'
            ).execute()
            messages = results.get('messages', [])
            
            email_data_list = []
            
            for msg in messages:
                txt = self.service.users().messages().get(userId='me', id=msg['id']).execute()
                payload = txt.get('payload', {})
                headers = payload.get('headers', [])
                
                subject = "No Subject"
                sender = "Unknown"
                recipient = "Me"
                
                for h in headers:
                    if h['name'] == 'Subject':
                        subject = h['value']
                    if h['name'] == 'From':
                        sender = h['value']
                    if h['name'] == 'To':
                        recipient = h['value']
                        
                # Get body
                body = ""
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part['mimeType'] == 'text/plain':
                            data = part['body'].get('data')
                            if data:
                                body = base64.urlsafe_b64decode(data).decode('utf-8')
                                break
                elif 'body' in payload:
                    data = payload['body'].get('data')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')

                email_data_list.append(EmailData(
                    id=msg['id'],
                    sender=sender,
                    recipient=recipient,
                    subject=subject,
                    body=body
                ))
            
            # Store the last email for reference
            if email_data_list:
                self.last_scanned_email = email_data_list[0] # Most recent is first

            return email_data_list

        except Exception as e:
            print(f"An error occurred: {e}")
            return []

gmail_service = GmailService()
