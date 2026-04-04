import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

# Your custom imports
from prompt.prompt_parser import parse_prompt
from pep.policy_enforcement_point import handle_request
from idp.identity_provider import authenticate_user

# IMPORT the shared IDS state functions and metrics
from monitoring.logger import log_request, record_unauthorized, attempts 
from monitoring.metrics import get_risk_analysis 
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

# Now pull the values from the environment
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Default to HS256 if not found
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# --- CORS Configuration ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend-name.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Highly recommended for a one-day student demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

# --- MODELS ---
class LoginRequest(BaseModel):
    username: str  
    password: str

class ChatRequest(BaseModel):
    prompt: str

# --- JWT UTILS ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- ROUTES ---

@app.post("/api/login")
def login(request: LoginRequest):
    role = authenticate_user(request.username, request.password) 
    
    if not role:
        raise HTTPException(status_code=401, detail="Invalid User Credentials")
    
    token = create_access_token({"sub": request.username, "role": role})
    
    return {
        "status": "success",
        "access_token": token,
        "agent_name": request.username, 
        "role": role
    }

@app.post("/agent/request")
def handle_agent_chat(request: ChatRequest, user_data: dict = Depends(verify_token)):
    # 1. Identify who is asking (from JWT)
    human_username = user_data.get("sub")
    role_from_token = user_data.get("role")
    
    # 2. Identify what they want (from Prompt)
    role_from_prompt, resource = parse_prompt(request.prompt)
    
    if not role_from_prompt or not resource:
        raise HTTPException(status_code=400, detail="Invalid prompt format. Use 'Access [table] as [Role]'")
    
    # 3. ZERO TRUST CHECK: Role Mismatch
    if role_from_prompt.strip().lower() != role_from_token.strip().lower():
        is_alert = record_unauthorized(human_username, resource)
        log_request(human_username, role_from_token, resource, "DENIED: Role Mismatch")
        
        # Get Risk Data for the UI
        score, history = get_risk_analysis(attempts, human_username, resource)
        
        return {
            "result": f"Access Denied: You are authenticated as {role_from_token}, but trying to act as {role_from_prompt}.",
            "security_alert": is_alert,
            "risk_score": score,
            "risk_history": history,
            "error": True
        }
    
    # 4. POLICY CHECK
    result = handle_request(role_from_prompt, resource, human_username)
    
    # Calculate current risk metrics even for successful requests
    score, history = get_risk_analysis(attempts, human_username, resource)

    # Normalize response based on PEP result
    if isinstance(result, dict) and result.get("status") == "success":
        return {
            "result": f"ACCESS GRANTED. Data: {result['data']}", 
            "risk_score": score,
            "risk_history": history,
            "security_alert": False, 
            "error": False
        }
    
    return {
        "result": result, 
        "risk_score": score,
        "risk_history": history,
        "security_alert": False, 
        "error": True
    }