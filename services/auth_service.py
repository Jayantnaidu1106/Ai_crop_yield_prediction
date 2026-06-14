import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Backend", ".env")
load_dotenv(env_path)

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Initialize Twilio Client
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    twilio_client = None
    print("Warning: Twilio credentials not configured")

def send_verification_code(phone_number: str) -> bool:
    """
    Send verification code to phone number via Twilio Verify
    
    Args:
        phone_number: Phone number in E.164 format (e.g., +919876543210)
    
    Returns:
        True if successful, False otherwise
    """
    if not twilio_client or not TWILIO_VERIFY_SERVICE_SID:
        print("Twilio not configured")
        return False
    
    try:
        verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create(
            to=phone_number,
            channel="sms"
        )
        print(f"Verification sent to {phone_number}: {verification.sid}")
        return True
    except TwilioRestException as e:
        print(f"Twilio error: {e}")
        return False
    except Exception as e:
        print(f"Error sending verification: {e}")
        return False

def verify_twilio_code(phone_number: str, code: str) -> str | None:
    """
    Verify the code sent to phone number
    
    Args:
        phone_number: Phone number in E.164 format
        code: Verification code (typically 6 digits)
    
    Returns:
        JWT token if successful, None otherwise
    """
    if not twilio_client or not TWILIO_VERIFY_SERVICE_SID:
        print("Twilio not configured")
        return None
    
    try:
        verification_check = twilio_client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
            to=phone_number,
            code=code
        )
        
        if verification_check.status == "approved":
            # Generate JWT token
            token = generate_jwt_token(phone_number)
            print(f"Verification approved for {phone_number}")
            return token
        else:
            print(f"Verification failed for {phone_number}: {verification_check.status}")
            return None
    
    except TwilioRestException as e:
        print(f"Twilio verification error: {e}")
        return None
    except Exception as e:
        print(f"Error verifying code: {e}")
        return None

def generate_jwt_token(phone_number: str) -> str:
    """
    Generate JWT token for authenticated user
    
    Args:
        phone_number: Phone number to embed in token
    
    Returns:
        JWT token
    """
    payload = {
        "phone_number": phone_number,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token: str) -> dict | None:
    """
    Verify JWT token and extract payload
    
    Args:
        token: JWT token to verify
    
    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
