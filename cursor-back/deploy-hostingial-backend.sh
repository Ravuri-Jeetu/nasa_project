#!/bin/bash

# Hostingial Backend Deployment Script for NASA Research Analytics Platform
# This script prepares the FastAPI backend for Hostingial hosting

echo "🚀 Starting Hostingial backend deployment process..."

# Navigate to backend directory
cd cursor-back

# Create requirements.txt if it doesn't exist
if [ ! -f requirements.txt ]; then
    echo "📝 Creating requirements.txt..."
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.2
torch==2.1.1
pydantic==2.5.0
accelerate==0.24.1
pandas==2.1.3
scikit-learn==1.3.2
numpy==1.24.3
sentence-transformers==2.2.2
faiss-cpu==1.7.4
requests==2.31.0
networkx==3.2.1
python-multipart==0.0.6
EOF
fi

# Create startup script for Hostingial
echo "📝 Creating startup script..."
cat > startup.py << EOF
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
EOF

# Create deployment package
echo "📦 Creating backend deployment package..."
zip -r ../hostingial-backend.zip . -x "*.DS_Store" "*.git*" "__pycache__/*" "*.pyc"

echo "✅ Backend deployment package created: hostingial-backend.zip"
echo "📁 Upload this package to your Hostingial backend directory"
echo "🐍 Make sure Python 3.9+ is available on your Hostingial plan"
echo "🔧 Configure your Hostingial to run: python startup.py"

echo "🎉 Hostingial backend deployment preparation complete!"
