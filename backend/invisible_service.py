import json
import os
import random

class InvisibleLaborAnalyzer:
    def __init__(self):
        self.dataset = []
        self.load_dataset()

    def load_dataset(self):
        try:
            # Assuming data is in 'data' folder relative to this file
            path = os.path.join(os.path.dirname(__file__), 'data', 'invisible_labor_dataset.json')
            with open(path, 'r') as f:
                self.dataset = json.load(f)
        except Exception as e:
            print(f"Error loading invisible labor dataset: {e}")
            # Fallback simple dataset
            self.dataset = [
                {"task": "party", "type": "invisible", "advice": "Delegate this.", "script": "I'm swamped."},
                {"task": "strategy", "type": "promotable", "advice": "Do this.", "script": "I'm on it."}
            ]

    def analyze(self, task_description: str):
        task_lower = task_description.lower()
        
        # Simple similarity check (simulating a trained classifier)
        best_match = None
        max_score = 0
        
        for item in self.dataset:
            # Token overlap score
            item_tokens = set(item['task'].lower().split())
            input_tokens = set(task_lower.split())
            overlap = len(item_tokens.intersection(input_tokens))
            
            if overlap > max_score:
                max_score = overlap
                best_match = item
        
        # Default if no good match
        if not best_match or max_score == 0:
            # Heuristic fallback
            if any(word in task_lower for word in ['note', 'party', 'coffee', 'schedule', 'organize', 'help']):
                best_match = {
                    "type": "invisible",
                    "category": "Likely Admin/Support",
                    "impact_score": 3,
                    "advice": "This sounds like support work. Ensure it doesn't eat into your strategic time.",
                    "script": "I'd love to help, but I need to prioritize [Project X] right now. Can we find another resource?"
                }
            else:
                 best_match = {
                    "type": "promotable",
                    "category": "Potential Strategic Work",
                    "impact_score": 7,
                    "advice": "This aligns with core work, but ensure you claim credit for it.",
                    "script": "I'm happy to take this on as it aligns with my goals for [Goal Y]."
                }

        return {
            "classification": best_match['type'].title(), # "Invisible" or "Promotable"
            "category": best_match.get('category', 'General'),
            "impact_score": best_match.get('impact_score', 5),
            "advice": best_match.get('advice', "Review this task carefully."),
            "script": best_match.get('script', "I'll need to check my bandwidth.")
        }
