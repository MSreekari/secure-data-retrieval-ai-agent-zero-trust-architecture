# backend/prompt_parser.py

def parse_prompt(prompt: str):
    """
    Parse user prompt.
    Expected formats:
    - "Access sales_cleaned as Analyst"
    - "Show employees as HR"
    Returns: role, resource
    """
    prompt = prompt.lower()
    parts = prompt.split(" as ")
    if len(parts) != 2:
        return None, None  # invalid prompt
    
    resource_part = parts[0].replace("access ", "").replace("show ", "").strip()
    role_part = parts[1].capitalize().strip()
    
    # Map common names to DB tables
    resource_map = {
        "sales_cleaned": "sales_cleaned",
        "employees": "employees",
        "revenue": "revenue"
    }
    resource = resource_map.get(resource_part)
    
    return role_part, resource 

