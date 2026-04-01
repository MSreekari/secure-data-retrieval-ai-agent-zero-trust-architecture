import re

def parse_prompt(prompt: str):
    """
    Improved Parse logic using Regex.
    Supports:
    - "Access sales_cleaned as Analyst"
    - "Analyst access to sales_cleaned"
    - "[Analyst] access sales_cleaned"
    """
    # 1. Clean the input
    prompt = prompt.strip().lower()
    
    # 2. Pattern A: "Access [resource] as [role]"
    # Pattern B: "[role] access to [resource]"
    patterns = [
        r"access\s+(?P<resource>\w+)\s+as\s+(?P<role>\w+)",
        r"(?P<role>\w+)\s+access\s+to\s+(?P<resource>\w+)",
        r"\[(?P<role>\w+)\]\s+access\s+(?P<resource>\w+)"
    ]
    
    role, resource_part = None, None
    
    for pattern in patterns:
        match = re.search(pattern, prompt, re.IGNORECASE)
        if match:
            role = match.group("role").capitalize()
            resource_part = match.group("resource").lower()
            break

    if not role or not resource_part:
        return None, None

    # 3. Robust Resource Mapping
    resource_map = {
        "sales_cleaned": "sales_cleaned",
        "sales": "sales_cleaned",
        "employees": "employees",
        "staff": "employees",
        "revenue": "revenue"
    }
    
    resource = resource_map.get(resource_part)
    
    return role, resource