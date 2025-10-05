@echo off
REM Hostingial Backend Deployment Script for NASA Research Analytics Platform
REM This script prepares the FastAPI backend for Hostingial hosting

echo 🚀 Starting Hostingial backend deployment process...

REM Navigate to backend directory
cd cursor-back

REM Create requirements.txt if it doesn't exist
if not exist requirements.txt (
    echo 📝 Creating requirements.txt...
    (
    echo fastapi==0.104.1
    echo uvicorn==0.24.0
    echo transformers==4.35.2
    echo torch==2.1.1
    echo pydantic==2.5.0
    echo accelerate==0.24.1
    echo pandas==2.1.3
    echo scikit-learn==1.3.2
    echo numpy==1.24.3
    echo sentence-transformers==2.2.2
    echo faiss-cpu==1.7.4
    echo requests==2.31.0
    echo networkx==3.2.1
    echo python-multipart==0.0.6
    ) > requirements.txt
)

REM Create startup script for Hostingial
echo 📝 Creating startup script...
(
echo import uvicorn
echo import os
echo.
echo if __name__ == "__main__":
echo     port = int^(os.environ.get^("PORT", 8000^)^)
echo     uvicorn.run^("main:app", host="0.0.0.0", port=port, reload=False^)
) > startup.py

REM Create deployment package
echo 📦 Creating backend deployment package...
powershell Compress-Archive -Path * -DestinationPath ..\hostingial-backend.zip -Force

echo ✅ Backend deployment package created: hostingial-backend.zip
echo 📁 Upload this package to your Hostingial backend directory
echo 🐍 Make sure Python 3.9+ is available on your Hostingial plan
echo 🔧 Configure your Hostingial to run: python startup.py

echo 🎉 Hostingial backend deployment preparation complete!
pause
