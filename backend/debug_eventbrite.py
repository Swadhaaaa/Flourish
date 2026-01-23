import requests
import os

token = "ULK3Q27VPF2LUKIKPHLY"
headers = {"Authorization": f"Bearer {token}"}

print(f"Testing Token: {token[:4]}...")

# 1. Test User Info (users/me)
print("\n--- 1. Testing User Info (users/me) ---")
try:
    # Try without trailing slash
    r = requests.get("https://www.eventbriteapi.com/v3/users/me", headers=headers)
    print(f"Status: {r.status_code}")
    print(r.text)
    
    if r.status_code == 200:
        user_id = r.json().get('id')
        print(f"User ID: {user_id}")
        
        # 1.5 Test Owned Events (Shortcut)
        print("\n--- 1.5 Testing Owned Events (users/me/owned_events) ---")
        r_owned = requests.get(f"https://www.eventbriteapi.com/v3/users/{user_id}/owned_events/", headers=headers)
        print(f"Owned Status: {r_owned.status_code}")
        if r_owned.status_code == 200:
            owned = r_owned.json().get('events', [])
            print(f"Owned Events Found: {len(owned)}")
            
        # 2. Get Organizations
        print("\n--- 2. Get User Organizations ---")
        org_url = f"https://www.eventbriteapi.com/v3/users/{user_id}/organizations/"
        r_org = requests.get(org_url, headers=headers)
        print(f"Org Status: {r_org.status_code}")
        print(r_org.text)
        
        if r_org.status_code == 200:
            orgs = r_org.json().get('organizations', [])
            if orgs:
                org_id = orgs[0]['id']
                print(f"Found Org ID: {org_id}")
                
        # 3. Test Public Search (The real goal)
        print("\n--- 3. Testing Public Search (v3/events/search/) ---")
        search_url = "https://www.eventbriteapi.com/v3/events/search/"
        params = {
            "location.address": "New York",
            "location.within": "10mi",
            "expand": "venue"
        }
        r_search = requests.get(search_url, headers=headers, params=params)
        print(f"Search Status: {r_search.status_code}")
        if r_search.status_code == 200:
             events = r_search.json().get('events', [])
             print(f"Found {len(events)} public events nearby!")
        else:
             print(r_search.text)

except Exception as e:
    print(f"Error: {e}")

# 4. Test Orders (Events the user is attending)
print("\n--- 4. Testing User Orders (users/me/orders/) ---")
try:
    r = requests.get("https://www.eventbriteapi.com/v3/users/me/orders/?expand=event", headers=headers)
    print(f"Orders Status: {r.status_code}")
    if r.status_code == 200:
        orders = r.json().get('orders', [])
        print(f"Found {len(orders)} orders")
        if len(orders) > 0:
            print("First Order Event:", orders[0].get('event', {}).get('name', {}).get('text'))
    else:
        print(r.text)
except Exception as e:
    print(f"Error: {e}")

# 3. Test Public Search (organizations/me might be empty if user has no events)
# Eventbrite deprecated public search /v3/events/search without permission.
# We will try getting the organization ID first, then searching.
