import json
import os
import random
from scheduler_app.ai_engine.groq_client import GroqSchedulerAI

class CommunityMatcher:
    def __init__(self):
        self.profiles = []
        self.load_profiles()
        self.ai = GroqSchedulerAI()

    def load_profiles(self):
        try:
            path = os.path.join(os.path.dirname(__file__), 'data', 'sisterhood_profiles.json')
            with open(path, 'r') as f:
                self.profiles = json.load(f)
        except Exception as e:
            print(f"Error loading profiles: {e}")
            self.profiles = []

    def match_user(self, user_data: dict):
        if not self.profiles:
            return []

        # Prepare context for the LLM
        user_context = json.dumps(user_data)
        profiles_context = json.dumps([{
            "id": p["id"],
            "name": p["name"],
            "role": p["role"],
            "industry": p["industry"],
            "burnout_level": p["burnout_level"],
            "interests": p["interests"],
            "bio": p["bio"]
        } for p in self.profiles])

        system_prompt = "You are an expert professional matchmaker and community builder for women. Output valid JSON only."
        user_prompt = f"""
        Given the following user profile:
        {user_context}

        And a database of potential mentors/peers in the Sisterhood:
        {profiles_context}

        Task: Select the top 3 absolute BEST matches for this user.
        Consider their industry, burnout level (e.g., matching a high burnout user with a supportive mentor, or matching peers), and interests.

        For each match, you MUST provide:
        1. "id": The ID of the matched profile.
        2. "reason": A very short, punchy reason (e.g., "Mentor Match", "Industry Peer", "Burnout Support").
        3. "ai_icebreaker": A personalized, highly empathetic and empowering 1-2 sentence message the user can send to initiate contact, mentioning specific commonalities.

        Output ONLY valid JSON in this exact format:
        {{
            "matches": [
                {{
                    "id": "matched_user_id",
                    "reason": "Reason for match",
                    "ai_icebreaker": "The custom icebreaker message..."
                }}
            ]
        }}
        """

        try:
            ai_response = self.ai.generate_json_response(system_prompt, user_prompt)
            if ai_response and "matches" in ai_response:
                results = []
                for match_info in ai_response["matches"]:
                    # Find the full profile data
                    profile = next((p for p in self.profiles if p["id"] == match_info["id"]), None)
                    if profile:
                        results.append({
                            "profile": profile,
                            "reason": match_info.get("reason", "Great Match"),
                            "ai_icebreaker": match_info.get("ai_icebreaker", "Hi, I'd love to connect!")
                        })
                # Ensure we have some results, else fallback to heuristic
                if len(results) > 0:
                    return results
        except Exception as e:
            print(f"Community AI Matching Error: {e}")

        # Fallback heuristic if LLM fails
        print("Falling back to heuristic matching...")
        user_industry = user_data.get('industry', 'Technology')
        user_burnout = user_data.get('burnout_level', 'Medium')
        
        matches = []
        for profile in self.profiles:
            score = 0
            if profile.get('industry') == user_industry: score += 5
            p_burnout = profile.get('burnout_level')
            if user_burnout in ['High', 'Critical'] and p_burnout in ['Low', 'Medium']: score += 10
            elif user_burnout == 'Low' and p_burnout == 'High': score += 8
            elif user_burnout == p_burnout: score += 5
            score += random.random() * 2
            matches.append({"profile": profile, "score": score})
            
        matches.sort(key=lambda x: x['score'], reverse=True)
        top_matches = matches[:3]
        
        results = []
        for m in top_matches:
            p = m["profile"]
            reason = "High Compatibility" if m['score'] > 10 else "Industry Peer"
            ai_icebreaker = f"Hi {p['name']}, I noticed we're both in {p['industry']}. Would love to connect and share experiences."
            results.append({
                "profile": p,
                "reason": reason,
                "ai_icebreaker": ai_icebreaker
            })
            
        return results
