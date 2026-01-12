import requests
import json

url = "http://localhost:8000/api/ai/analyze-reflection"

payloads = [
    {"text": "I had a terrible week, felt completely burned out and wanted to quit. I was crying in the bathroom."},
    {"text": "It was a great week! I loved my team and felt very productive."},
    {"text": "My manager yelled at me and I only slept 4 hours last night."}
]

for p in payloads:
    print(f"\nScanning: {p['text']}")
    try:
        response = requests.post(url, json=p)
        print("Result:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
