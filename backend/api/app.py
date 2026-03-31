from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from prompt.prompt_parser import parse_prompt
from pep.policy_enforcement_point import handle_request
from idp.identity_provider import authenticate

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, replace with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    prompt: str
    agent_name: str
    password: str

@app.post("/agent/request")
def agent_request(request: AgentRequest):
    # Step 1: Authenticate
    role_from_idp = authenticate(request.agent_name, request.password)
    if not role_from_idp:
        raise HTTPException(status_code=403, detail="Authentication failed")
    
    # Step 2: Parse prompt
    role_from_prompt, resource = parse_prompt(request.prompt)
    if not role_from_prompt or not resource:
        raise HTTPException(status_code=400, detail="Invalid prompt format")
    
    # Step 3: Optional role check
    if role_from_prompt != role_from_idp:
        raise HTTPException(status_code=403, detail=f"Role mismatch: IdP={role_from_idp}, Prompt={role_from_prompt}")
    
    # Step 4: Handle request
    result = handle_request(role_from_prompt, resource, request.agent_name)
    return {"result": result} 

