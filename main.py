from data_layer.get_table import get_table
from data_layer.sql_database import initialize_db
from pdp.policy_decision_point import is_allowed 
from pep.policy_enforcement_point import handle_request
# Ensure DB is initialized
initialize_db()

# Test data retrieval
print("Sales:", get_table("sales_cleaned"))
print("Employees:", get_table("employees"))
print("Revenue:", get_table("revenue"))

print("Analyst accessing sales_cleaned:", handle_request("Analyst", "sales_cleaned"))
print("Analyst accessing employees:", handle_request("Analyst", "employees"))