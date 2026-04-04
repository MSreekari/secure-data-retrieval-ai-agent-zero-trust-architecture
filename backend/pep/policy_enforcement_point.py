import json
import os
import logging
from data_layer.sql_database import get_table
from monitoring.logger import log_request, record_unauthorized

def load_policies():
    """
    Dynamically loads the Zero Trust rules from the PDP folder.
    """
    # Move up one level from 'pep' to 'backend', then into 'pdp'
    base_path = os.path.dirname(os.path.dirname(__file__)) 
    json_path = os.path.join(base_path, "pdp", "policy_rules.json")
    
    try:
        with open(json_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"CRITICAL: policy_rules.json not found at {json_path}!")
        return {}

# --- 2. NOW DEFINE THE MAIN HANDLER ---
def handle_request(requested_role, resource, username):
    """
    The Policy Enforcement Point (PEP).
    It fetches the 'Truth' from the JSON and enforces it here.
    """
    # This call now works because load_policies is defined above
    all_policies = load_policies() 
    
    # 1. Normalize the Role (e.g., 'analyst' -> 'Analyst')
    # Use a case-insensitive search to find the correct key in the JSON
    role_key = next((key for key in all_policies.keys() 
                    if key.lower() == requested_role.lower()), None)

    # 2. Check if the Agent Identity exists in the JSON
    if not role_key:
        log_request(username, requested_role, resource, "DENIED: Unknown Agent Identity")
        return f"ACCESS DENIED: Zero Trust Policy Violation. Unknown Agent Identity: {requested_role}"

    # 3. Check Resource Authorization (The JSON Lookup)
    # Get the list of allowed tables for this specific role
    allowed_tables = all_policies[role_key].get("tables", [])
    
    if resource not in allowed_tables:
        # Trigger IDS if the role isn't allowed to see this table
        record_unauthorized(username, resource)
        log_request(username, role_key, resource, f"DENIED: {role_key} cannot access {resource}")
        return f"ACCESS DENIED: {role_key} Agent is not authorized to access the '{resource}' table."

    # 4. Access Granted
    try:
        data = get_table(resource)
        log_request(username, role_key, resource, "SUCCESS: Access Granted")
        return {
            "status": "success",
            "data": data,
            "message": f"Access Verified via Policy Engine for {role_key} Persona."
        }
    except Exception as e:
        logging.error(f"System Error: {e}")
        return "INTERNAL ERROR: Could not process secure request."