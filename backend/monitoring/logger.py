from datetime import datetime

log_file = "access_logs.txt"

def log_request(agent_name, role, resource, result, risk_score=None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"{timestamp} | Agent: {agent_name} | Role: {role} | Resource: {resource} | Result: {result}"
    if risk_score is not None:
        entry += f" | Risk Score: {risk_score}"
    entry += "\n"

    with open(log_file, "a") as f:
        f.write(entry) 

