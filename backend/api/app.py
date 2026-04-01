import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Your custom imports
from prompt.prompt_parser import parse_prompt
from pep.policy_enforcement_point import handle_request
from idp.identity_provider import authenticate

app = FastAPI()

# Security Constants
SECRET_KEY = "zz0Ez-oYWPE8hN-vhpio86dCFOmxGv4GTZ-o0I9M99c"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- INTRUSION DETECTION SYSTEM (IDS) ---
# Key: (agent_name, resource), Value: count of unauthorized attempts
attempts = {}

def record_unauthorized(agent_name, resource):
    key = (agent_name, resource)
    attempts[key] = attempts.get(key, 0) + 1
    # Return True if we hit the threshold, else False
    return attempts[key] >= 3

# --- CORS Configuration ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class LoginRequest(BaseModel):
    agent_name: str
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

@app.post("/agent/authenticate")
def login(request: LoginRequest):
    role = authenticate(request.agent_name, request.password)
    
    if not role:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": request.agent_name, "role": role})
    
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "agent_name": request.agent_name
    }

@app.post("/agent/request")
def handle_agent_chat(request: ChatRequest, user_data: dict = Depends(verify_token)):
    agent_name = user_data.get("sub")
    role_from_token = user_data.get("role")
    
    role_from_prompt, resource = parse_prompt(request.prompt)
    
    if not role_from_prompt or not resource:
        raise HTTPException(status_code=400, detail="Invalid prompt format")
    
    if role_from_prompt.strip().lower() != role_from_token.strip().lower():
        # Check if this attempt triggers a threshold alert
        is_alert = record_unauthorized(agent_name, resource)
        
        return {
            "result": f"Access Denied: Role Mismatch.",
            "security_alert": is_alert,
            "error": True
        }
    
    result = handle_request(role_from_prompt, resource, agent_name)
    return {"result": result, "security_alert": False, "error": False}