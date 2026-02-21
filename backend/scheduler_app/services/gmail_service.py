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
        # Cache services per user
        self.services = {} 
        self.creds_map = {}
        self.last_scanned_email = None # Just tracks mostly recent global, or make it dict if needed. 
        # For simplicity, last_scanned_email can remain single or be unused in multi-user logic effectively.

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
        """Authenticates the user, forcing account selection if no token exists."""
        token_file = f'token_{user_id}.json'
        creds = None
        
        # Check for existing token
        if not os.path.exists(token_file) and prompt_login == False:
            # Fallback to the default token.json if available
            if os.path.exists('token.json'):
                print(f"Token for {user_id} not found, falling back to default token.json")
                token_file = 'token.json'

        if os.path.exists(token_file):
            print(f"Using token file: {token_file} for user_id: {user_id}")
            creds = Credentials.from_authorized_user_file(token_file, SCOPES)
            
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
            
                # Save the credentials for the next run
                with open(token_file, 'w') as token:
                    token.write(creds.to_json())

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
