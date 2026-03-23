import random
from datetime import datetime

def calculate_risk(agent_name, role, resource):
    """
    Calculate a risk score (0-100) for a resource request.
    Higher score = higher risk.
    """
    score = 0

    if role == "Analyst" and resource == "employees":
        score += 70
    if role == "HR" and resource == "sales_cleaned":
        score += 70
    if role == "Finance" and resource == "employees":
        score += 70
    
    score += random.randint(0, 20)
    
    hour = datetime.now().hour
    if hour < 6 or hour > 22:
        score += 10

    return min(score, 100)

def is_safe(risk_score, threshold=50):
    """
    Return True if risk score is under threshold.
    Requests with higher risk are denied.
    """
    return risk_score < threshold 

