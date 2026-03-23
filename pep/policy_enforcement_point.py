from pdp.policy_decision_point import is_allowed
from data_layer.get_table import get_table

def handle_request(role, resource):
    """Simulate agent/user requesting a resource"""
    if not is_allowed(role, resource):
        return "ACCESS DENIED"
    data = get_table(resource)
    return data 

