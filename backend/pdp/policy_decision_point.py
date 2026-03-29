import json
import os

# Load policy rules
POLICY_FILE = os.path.join(os.path.dirname(__file__), "policy_rules.json")
with open(POLICY_FILE) as f:
    policies = json.load(f)

def is_allowed(role, resource):
    """Return True if role can access resource"""
    allowed = policies.get(role, [])
    return "*" in allowed or resource in allowed