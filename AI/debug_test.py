import requests
import json

# Test the /ask endpoint directly
url = "http://localhost:8000/ask"
data = {
    "query": "test question",
    "top_k": 5,
    "use_openai": False
}

try:
    print("Testing /ask endpoint...")
    response = requests.post(url, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test the health endpoint
try:
    print("\nTesting /health endpoint...")
    response = requests.get("http://localhost:8000/health", timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
