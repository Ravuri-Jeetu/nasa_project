@echo off
REM Hostingial Deployment Script for NASA Research Analytics Platform
REM This script builds and packages the frontend for Hostingial shared hosting

echo 🚀 Starting Hostingial deployment process...

REM Navigate to frontend directory
cd cursor-front

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Build the application
echo 🔨 Building Next.js application...
pnpm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Create deployment package
    echo 📦 Creating deployment package...
    cd out
    
    REM Create a zip file for easy upload
    powershell Compress-Archive -Path * -DestinationPath ..\hostingial-frontend.zip -Force
    
    echo ✅ Deployment package created: hostingial-frontend.zip
    echo 📁 Upload the contents of the 'out' directory to your Hostingial public_html folder
    echo 🌐 Your frontend will be available at your domain
    
) else (
    echo ❌ Build failed! Please check the errors above.
    exit /b 1
)

echo 🎉 Hostingial deployment preparation complete!
pause
