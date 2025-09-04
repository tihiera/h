import os
import json
from typing import Dict, Any, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from tools import worth_tools

load_dotenv(".env")
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class WorthEstimator:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        self.tools = worth_tools()

    def _find_fn_call(self, resp) -> Optional[Dict[str, Any]]:
        for cand in getattr(resp, "candidates", []):
            parts = getattr(getattr(cand, "content", None), "parts", []) or []
            for p in parts:
                fc = getattr(p, "function_call", None)
                if fc:
                    try:
                        return {"name": fc.name, "args": dict(fc.args)}
                    except Exception:
                        return {"name": fc.name, "args": fc.args}  # type: ignore
        return None

    def estimate_worth(self, user_context: str) -> Dict[str, Any]:
        """
        Estimate the worth of a user given their profile context (bio, skills, achievements).
        """
        prompt = f"""
You are an expert talent evaluator and startup investor.

Given the following user profile context, estimate their potential market worth in EUR.

Return ONLY via the function call `estimate_user_worth`:
- worth (number, euros, integer)
- confidence (0-100)
- factors (array of 2-5 short reasons for this estimate)

User context:
{user_context}
"""
        try:
            resp = self.model.generate_content(
                prompt,
                tools=self.tools,
                tool_config={'function_calling_config': {'mode': 'ANY'}},
            )
            fn = self._find_fn_call(resp)
            if fn and fn["name"] == "estimate_user_worth":
                return dict(fn["args"])

            # fallback if no function call
            return {"worth": 10000, "confidence": 50, "factors": ["Default fallback estimation"]}

        except Exception as e:
            print(f"LLM Error: {e}")
            return {"worth": 10000, "confidence": 40, "factors": ["Estimation failed, fallback used"]}


if __name__ == "__main__":
    we = WorthEstimator()
    out = we.estimate_worth("Software engineer from Berlin, ex-Google, building AI automation tools with 10k+ GitHub stars.")
    print(json.dumps(out, indent=2))
