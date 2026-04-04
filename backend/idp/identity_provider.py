# idp/identity_provider.py
from data_layer.sql_database import get_user_by_username

# This maps which "Agent Persona" belongs to which "Security Role"
# In a professional system, this would be your "Role-Based Access Control" (RBAC) table.
AGENT_ROLE_MAPPING = {
    "Agent1": "Analyst",
    "Agent2": "HR",
    "Agent3": "Finance",
    "Agent4": "Admin"
}

def authenticate_user(username, password):
    """
    Step 1: Human Authentication.
    Queries the SQLite database to verify the user exists and checks their password.
    """
    user_record = get_user_by_username(username)
    
    if user_record and user_record["password"] == password:
        # Return the Human's Cleared Role (e.g., 'Analyst')
        return user_record["role"]
    
    return None

def authorize_agent_action(user_cleared_role, requested_agent_name):
    """
    Step 2: Agent Authorization (Least Privilege Check).
    Ensures the human's role matches the agent persona they are trying to use.
    """
    # Find what role this Agent is allowed to operate in
    required_role = AGENT_ROLE_MAPPING.get(requested_agent_name)
    
    if not required_role:
        return False, "Unknown Agent Identity"

    # THE CORE ZERO TRUST CHECK:
    # Does the Human's DB-verified role match the Agent's required role?
    if user_cleared_role == required_role:
        return True, required_role
    else:
        # This triggers the IDS (Intrusion Detection System)
        return False, f"Privilege Escalation Blocked: {user_cleared_role} cannot assume {required_role} persona."
