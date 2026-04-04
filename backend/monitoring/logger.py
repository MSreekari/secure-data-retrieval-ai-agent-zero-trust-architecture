import datetime

# --- INTRUSION DETECTION SYSTEM (IDS) STATE ---
# This dictionary tracks failed attempts globally in the backend memory
attempts = {}

def record_unauthorized(agent_name, resource):
    """
    Tracks failed attempts and returns True if a threshold is reached.
    """
    key = (agent_name, resource)
    attempts[key] = attempts.get(key, 0) + 1
    
    # Log the failure to a console/file for auditing
    print(f"[IDS ALERT] Unauthorized attempt by {agent_name} on {resource}. Count: {attempts[key]}")
    
    # Return True if we hit the threshold (e.g., 3 attempts), else False
    return attempts[key] >= 3

def log_request(agent_name, role, resource, status):
    """
    Standard logging for all gateway traffic.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] User: {agent_name} | Role: {role} | Resource: {resource} | Status: {status}\n"
    
    # Optional: Write to a file
    with open("access_logs.txt", "a") as f:
        f.write(log_entry)
    
    print(log_entry.strip())