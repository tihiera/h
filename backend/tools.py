from typing import Dict, Any, List

def worth_tools() -> List[Dict[str, Any]]:
    return [{
        "function_declarations": [{
            "name": "estimate_user_worth",
            "description": "Estimate the financial worth of a user based on their profile context (skills, bio, social proof).",
            "parameters": {
                "type": "object",
                "properties": {
                    "worth": {
                        "type": "number",
                        "description": "Estimated worth of the user in euros."
                    },
                    "confidence": {
                        "type": "number",
                        "description": "Confidence level (0–100) in this estimation."
                    },
                    "factors": {
                        "type": "array",
                        "description": "Key reasoning factors behind the worth estimation.",
                        "items": {"type": "string"}
                    }
                },
                "required": ["worth", "confidence"]
            }
        }]
    }]
