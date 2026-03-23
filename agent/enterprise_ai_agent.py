from pep.policy_enforcement_point import handle_request

class AIAgent:
    def __init__(self, name, role):
        """
        name: agent name
        role: agent role (Analyst, HR, Finance, Admin)
        """
        self.name = name
        self.role = role

    def request_resource(self, resource):
        """
        Request a resource via PEP.
        Prints allowed data or ACCESS DENIED
        """
        result = handle_request(self.role, resource)
        print(f"{self.name} requesting {resource}: {result}")