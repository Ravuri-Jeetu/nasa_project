import requests
import time

print("Testing server connection...")

# Test different URLs
urls = [
    "http://localhost:8000/health",
    "http://127.0.0.1:8000/health", 
    "http://0.0.0.0:8000/health"
]

for url in urls:
    try:
        print(f"Testing {url}...")
        response = requests.get(url, timeout=5)
        print(f"✅ SUCCESS: {url} - Status: {response.status_code}")
        print(f"Response: {response.json()}")
        break
    except Exception as e:
        print(f"❌ FAILED: {url} - Error: {e}")

print("\nIf none worked, the server might not be running properly.")
