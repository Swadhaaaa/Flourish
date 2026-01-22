import json
import os
import random

class CommunityMatcher:
    def __init__(self):
        self.profiles = []
        self.load_profiles()

    def load_profiles(self):
        try:
            path = os.path.join(os.path.dirname(__file__), 'data', 'sisterhood_profiles.json')
            with open(path, 'r') as f:
                self.profiles = json.load(f)
        except Exception as e:
            print(f"Error loading profiles: {e}")
            self.profiles = []

    def match_user(self, user_data: dict):
        # user_data might contain: {'industry': 'Tech', 'burnout_level': 'High', 'interests': []}
        
        user_industry = user_data.get('industry', 'Technology')
        user_burnout = user_data.get('burnout_level', 'Medium')
        
        matches = []
        
        for profile in self.profiles:
            score = 0
            # 1. Industry Match (+5)
            if profile.get('industry') == user_industry:
                score += 5
            
            # 2. Burnout Complementarity (+10)
            # If user is High/Critical, match with Low/Medium (Mentors/Support)
            # If user is Low, match with High (To Mentor) or Low (Peers)
            p_burnout = profile.get('burnout_level')
            if user_burnout in ['High', 'Critical'] and p_burnout in ['Low', 'Medium']:
                score += 10 # Good support match
            elif user_burnout == 'Low' and p_burnout == 'High':
                score += 8 # Mentorship opportunity
            elif user_burnout == p_burnout:
                score += 5 # Peer empathy
                
            # 3. Random noise for variety
            score += random.random() * 2
            
            matches.append({
                **profile,
                "match_score": score
            })
            
        # Sort by score descending
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top 3
        top_matches = matches[:3]
        
        # Enhance with "Generated" Icebreaker (Mock GenAI)
        results = []
        for m in top_matches:
            icebreaker = f"Hi {m['name']}, I noticed we're both in {m['industry']}. "
            if m['match_score'] > 12:
                icebreaker += "I'd love to hear how you manage work-life balance!"
            else:
                icebreaker += "Would love to connect and share experiences."
            
            results.append({
                "profile": m,
                "reason": "High Compatibility" if m['match_score'] > 10 else "Industry Peer",
                "ai_icebreaker": icebreaker
            })
            
        return results
