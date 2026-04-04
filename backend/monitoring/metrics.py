# monitoring/metrics.py
import datetime

# Initialize with some baseline data so the graph is visible on load
risk_history = [{"time": "Start", "score": 0}] 

def get_risk_analysis(attempts_dict, agent_name, resource):
    key = (agent_name, resource)
    count = attempts_dict.get(key, 0)
    
    # Calculate score
    score = min(count * 33, 100)
    
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    # Check if the last score was the same to prevent a straight line
    if not risk_history or risk_history[-1]['score'] != score:
        risk_history.append({"time": timestamp, "score": score})
    
    return score, risk_history[-10:]

def get_current_metrics():
    """Fallback helper to fetch current state"""
    return risk_history[-10:] if risk_history else []