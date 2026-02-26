from datetime import datetime, timedelta, UTC
from typing import Optional
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import sys
import secrets
import hashlib

# Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    print("WARNING: SECRET_KEY not set. Using insecure default for development only.", file=sys.stderr)
    SECRET_KEY = "dev-secret-key-change-in-production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    print("WARNING: GOOGLE_CLIENT_ID not set. Google authentication will fail.", file=sys.stderr)
    GOOGLE_CLIENT_ID = "your-google-client-id"

def verify_google_token(token: str):
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return id_info
    except ValueError:
        # Invalid token
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token() -> str:
    """Generate a cryptographically secure refresh token"""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """Hash a token for secure storage in database"""
    return hashlib.sha256(token.encode()).hexdigest()

def verify_refresh_token(token: str, hashed_token: str) -> bool:
    """Verify a refresh token against its hashed version"""
    return hash_token(token) == hashed_token

def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
