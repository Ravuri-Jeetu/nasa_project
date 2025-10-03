import subprocess
import sys
import time

# Kill any existing Python processes running the chatbot
try:
    subprocess.run(["taskkill", "/F", "/IM", "python.exe"], capture_output=True)
    time.sleep(2)
except:
    pass

# Start the server with correct host
subprocess.run([sys.executable, "nasa_chatbot.py"])
