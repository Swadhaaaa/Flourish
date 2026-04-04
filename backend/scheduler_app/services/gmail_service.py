import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from typing import List
from typing import List, Optional
from pydantic import BaseModel
import json
from scheduler_app.database.firestore_manager import FirestoreManager

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
        # Cache services per user
        self.services = {} 
        self.creds_map = {}
        self.last_scanned_email = None # Just tracks mostly recent global, or make it dict if needed. 
        self.db = FirestoreManager()

    def get_profile_email(self, user_id: str = "1"):
        """Returns the email address of the authenticated user."""
        service = self.services.get(user_id)
        if not service:
            # Try to load without prompt if possible
            try:
                self.authenticate(user_id, prompt_login=False)
                service = self.services.get(user_id)
            except:
                pass
        
        if not service:
            return None
            
        try:
            profile = service.users().getProfile(userId='me').execute()
            return profile.get('emailAddress')
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None
        
    def authenticate(self, user_id: str = "1", prompt_login: bool = True):
        """Authenticates the user, forcing account selection if no token exists in Firestore."""
        creds = None
        
        # 1. Check Firestore for existing secure token
        token_str = self.db.get_user_token(user_id)
        if token_str:
            print(f"Using securely encrypted token from Firestore for user_id: {user_id}")
            try:
                creds = Credentials.from_authorized_user_info(json.loads(token_str), SCOPES)
            except Exception as e:
                print(f"Failed to parse token from Firestore: {e}")
                creds = None
                
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception:
                   creds = None

            if not creds:
                if not prompt_login:
                    raise Exception("Login required")
                    
                if not os.path.exists('credentials.json'):
                    raise FileNotFoundError("credentials.json not found. Please place it in the project root.")
                    
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                
                # prompt='select_account' forces the account chooser
                # Note: This opens a window on the SERVER. For local hackathon app this is fine.
                creds = flow.run_local_server(port=0, prompt='select_account')
            
                # Save the credentials securely to Firestore for the next run
                self.db.save_user_token(user_id, creds.to_json())
                print(f"Saved new securely encrypted token to Firestore for user_id: {user_id}")

        self.creds_map[user_id] = creds
        self.services[user_id] = build('gmail', 'v1', credentials=creds)
        print(f"Gmail service authenticated for user {user_id}.")

    def fetch_recent_emails(self, max_results=10, user_id: str = "1") -> List[EmailData]:
        if user_id not in self.services:
            print(f"Service not initialized for {user_id}. Authenticating...")
            try:
                # Do not prompt login here because this runs on the server API route
                self.authenticate(user_id, prompt_login=False)
            except Exception as e:
                print(f"Authentication failed: {e}")
                return []

        service = self.services.get(user_id)
        if not service:
            print(f"No valid service could be created for {user_id}")
            return []
        
        try:
            # Filter for Primary Inbox only (ignores Promotions, Social, Updates)
            results = service.users().messages().list(
                userId='me', 
                maxResults=max_results, 
                q='category:primary is:inbox'
            ).execute()
            messages = results.get('messages', [])
            
            email_data_list = []
            
            for msg in messages:
                txt = service.users().messages().get(userId='me', id=msg['id']).execute()
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
