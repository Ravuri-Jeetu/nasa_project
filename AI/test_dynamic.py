import requests
import time

print("Testing NASA Dynamic Chatbot...")

# Test the health endpoint
try:
    print("Testing health endpoint...")
    response = requests.get("http://127.0.0.1:8002/health", timeout=5)
    print(f"✅ Health check successful: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"❌ Health check failed: {e}")

# Test the chat endpoint
try:
    print("\nTesting chat endpoint...")
    response = requests.post("http://127.0.0.1:8002/chat", 
                           json={"message": "Hello", "session_id": "test"}, 
                           timeout=10)
    print(f"✅ Chat test successful: {response.status_code}")
    data = response.json()
    print(f"Response: {data['response'][:100]}...")
except Exception as e:
    print(f"❌ Chat test failed: {e}")

print("\nIf both tests passed, the server is working correctly!")
print("Try accessing: http://localhost:8002")
