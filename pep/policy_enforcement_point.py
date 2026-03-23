from pdp.policy_decision_point import is_allowed
from data_layer.get_table import get_table
from risk.risk_engine import calculate_risk, is_safe
from monitoring.logger import log_request
from monitoring.metrics import record_unauthorized

def handle_request(role, resource, agent_name="Unknown"):
    # Step 1: PDP check
    if not is_allowed(role, resource):
        record_unauthorized(agent_name, resource)
        log_request(agent_name, role, resource, "ACCESS DENIED: Role not allowed")
        return "ACCESS DENIED: Role not allowed"

    # Step 2: Risk Engine
    risk_score = calculate_risk(agent_name, role, resource)
    safe = is_safe(risk_score)
    
    if not safe:
        record_unauthorized(agent_name, resource)
        log_request(agent_name, role, resource, f"ACCESS DENIED: High Risk ({risk_score})", risk_score)
        return f"ACCESS DENIED: High Risk ({risk_score})"

    # Step 3: Access granted
    data = get_table(resource)
    log_request(agent_name, role, resource, "ACCESS GRANTED", risk_score)
    return f"Data: {data} | Risk Score: {risk_score}" 


