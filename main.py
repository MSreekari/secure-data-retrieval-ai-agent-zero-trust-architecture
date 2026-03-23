from data_layer.sql_database import initialize_db
from agent.enterprise_ai_agent import AIAgent
from pep.policy_enforcement_point import handle_request
from idp.identity_provider import authenticate

# Step 1: Initialize Database
initialize_db()

# Step 2: Test Data Retrieval (direct fetch for verification)
from data_layer.get_table import get_table
print("Sales:", get_table("sales_cleaned"))
print("Employees:", get_table("employees"))
print("Revenue:", get_table("revenue"))

# Step 3: Create AI Agents
agent1 = AIAgent("Agent1", "Analyst")
agent2 = AIAgent("Agent2", "HR")
agent3 = AIAgent("Agent3", "Finance")
agent4 = AIAgent("Agent4", "Admin")

# Step 4: Simulate Agent Requests
agents = [agent1, agent2, agent3, agent4]
resources = ["sales_cleaned", "employees", "revenue"]

print("\n--- AI Agent Access Simulation ---\n")

for agent in agents:
    for resource in resources:
        agent.request_resource(resource)

# Optional: Add a few risky requests to test Risk Engine
print("\n--- Risk Engine Test ---\n")
# Example: Analyst trying to access employees table (high risk)
agent1.request_resource("employees")
# Example: HR trying to access sales_cleaned (high risk)
agent2.request_resource("sales_cleaned") 

# Authenticate agent before creating it
role = authenticate("Agent1", "pass1")
if role:
    agent1 = AIAgent("Agent1", role)
else:
    print("Authentication failed for Agent1") 


