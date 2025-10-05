#!/bin/bash

# Hostingial Deployment Script for NASA Research Analytics Platform
# This script builds and packages the frontend for Hostingial shared hosting

echo "🚀 Starting Hostingial deployment process..."

# Navigate to frontend directory
cd cursor-front

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building Next.js application..."
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create deployment package
    echo "📦 Creating deployment package..."
    cd out
    
    # Create a zip file for easy upload
    zip -r ../hostingial-frontend.zip . -x "*.DS_Store" "*.git*"
    
    echo "✅ Deployment package created: hostingial-frontend.zip"
    echo "📁 Upload the contents of the 'out' directory to your Hostingial public_html folder"
    echo "🌐 Your frontend will be available at your domain"
    
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "🎉 Hostingial deployment preparation complete!"
