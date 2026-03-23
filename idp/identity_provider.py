# idp/identity_provider.py

# Simulated database of agents
AGENT_DB = {
    "Agent1": {"role": "Analyst", "password": "pass1"},
    "Agent2": {"role": "HR", "password": "pass2"},
    "Agent3": {"role": "Finance", "password": "pass3"},
    "Agent4": {"role": "Admin", "password": "pass4"},
}

def authenticate(agent_name, password):
    """
    Authenticate agent by name and password.
    Returns role if successful, else None.
    """
    agent = AGENT_DB.get(agent_name)
    if agent and agent["password"] == password:
        return agent["role"]
    else:
        return None 


