attempts = {}  # key: (agent_name, resource), value: count

def record_unauthorized(agent_name, resource):
    key = (agent_name, resource)
    attempts[key] = attempts.get(key, 0) + 1
    if attempts[key] >= 3:  # threshold
        print(f"Privilege Escalation Alert: {agent_name} tried {resource} {attempts[key]} times!") 

