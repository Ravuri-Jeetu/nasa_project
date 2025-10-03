@echo off
REM NASA Research Analytics Platform - Windows Setup Script
REM This script automates the installation and setup process on Windows

echo 🚀 NASA Research Analytics Platform - Windows Setup Script
echo ==========================================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "cursor-back" (
    echo ❌ cursor-back directory not found
    pause
    exit /b 1
)

if not exist "cursor-front" (
    echo ❌ cursor-front directory not found
    pause
    exit /b 1
)

echo ℹ️  Starting setup process...

REM Check Python
echo ℹ️  Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8 or higher.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found

REM Check Node.js
echo ℹ️  Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18 or higher.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check pnpm
echo ℹ️  Checking pnpm installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  pnpm not found. Installing pnpm...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ Failed to install pnpm
        pause
        exit /b 1
    )
    echo ✅ pnpm installed
) else (
    for /f %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo ✅ pnpm %PNPM_VERSION% found
)

REM Setup Backend
echo ℹ️  Setting up backend...
cd cursor-back

REM Create virtual environment
if not exist "venv" (
    echo ℹ️  Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
)

REM Activate virtual environment and install dependencies
echo ℹ️  Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✅ Python dependencies installed

REM Check for required data files
echo ℹ️  Checking for required data files...
set REQUIRED_FILES=SB_publication_PMC.csv Taskbook_cleaned_for_NLP.csv all_papers_chunked.jsonl
for %%f in (%REQUIRED_FILES%) do (
    if exist "%%f" (
        echo ✅ Found %%f
    ) else (
        echo ⚠️  Missing %%f - some features may not work
    )
)

cd ..

REM Setup Frontend
echo ℹ️  Setting up frontend...
cd cursor-front

REM Install Node.js dependencies
echo ℹ️  Installing Node.js dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✅ Node.js dependencies installed

cd ..

REM Create environment files
echo ℹ️  Creating environment files...

REM Frontend .env.local
if not exist "cursor-front\.env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > cursor-front\.env.local
    echo NEXT_PUBLIC_ENVIRONMENT=development >> cursor-front\.env.local
    echo ✅ Created cursor-front\.env.local
)

REM Backend .env
if not exist "cursor-back\.env" (
    echo API_HOST=127.0.0.1 > cursor-back\.env
    echo API_PORT=8000 >> cursor-back\.env
    echo DEBUG=True >> cursor-back\.env
    echo LOG_LEVEL=INFO >> cursor-back\.env
    echo ✅ Created cursor-back\.env
)

REM Create startup scripts
echo ℹ️  Creating startup scripts...

REM Backend startup script
echo @echo off > start-backend.bat
echo echo 🚀 Starting NASA Research Analytics Backend... >> start-backend.bat
echo cd cursor-back >> start-backend.bat
echo call venv\Scripts\activate.bat >> start-backend.bat
echo python main.py >> start-backend.bat
echo pause >> start-backend.bat

REM Frontend startup script
echo @echo off > start-frontend.bat
echo echo 🎨 Starting NASA Research Analytics Frontend... >> start-frontend.bat
echo cd cursor-front >> start-frontend.bat
echo pnpm run dev >> start-frontend.bat
echo pause >> start-frontend.bat

REM Combined startup script
echo @echo off > start-all.bat
echo echo 🚀 Starting NASA Research Analytics Platform... >> start-all.bat
echo echo. >> start-all.bat
echo echo Starting backend server... >> start-all.bat
echo start "Backend Server" cmd /k "cd cursor-back ^&^& call venv\Scripts\activate.bat ^&^& python main.py" >> start-all.bat
echo echo Waiting for backend to start... >> start-all.bat
echo timeout /t 5 /nobreak ^>nul >> start-all.bat
echo echo Starting frontend server... >> start-all.bat
echo start "Frontend Server" cmd /k "cd cursor-front ^&^& pnpm run dev" >> start-all.bat
echo echo. >> start-all.bat
echo echo ✅ Both servers started! >> start-all.bat
echo echo Backend: http://localhost:8000 >> start-all.bat
echo echo Frontend: http://localhost:3000 >> start-all.bat
echo echo API Docs: http://localhost:8000/docs >> start-all.bat
echo echo. >> start-all.bat
echo echo Press any key to exit... >> start-all.bat
echo pause ^>nul >> start-all.bat

echo ✅ Startup scripts created

REM Final verification
echo ℹ️  Running final verification...

REM Test Python imports
cd cursor-back
call venv\Scripts\activate.bat
python -c "import fastapi, uvicorn, transformers, pandas, numpy; print('✅ Backend dependencies verified')"
if %errorlevel% neq 0 (
    echo ❌ Backend dependency verification failed
    pause
    exit /b 1
)
cd ..

REM Test Node.js setup
cd cursor-front
pnpm list --depth=0 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency verification failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies verified
cd ..

REM Success message
echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 📋 Next Steps:
echo 1. Start the application: start-all.bat
echo 2. Or start individually:
echo    - Backend: start-backend.bat
echo    - Frontend: start-frontend.bat
echo.
echo 🌐 Access Points:
echo    - Main App: http://localhost:3000
echo    - API Docs: http://localhost:8000/docs
echo    - Landing: http://localhost:3000/landing
echo.
echo 📚 Documentation:
echo    - README.md - Complete setup guide
echo    - REQUIREMENTS.md - Detailed requirements
echo.
echo 🔧 Troubleshooting:
echo    - Check logs for any errors
echo    - Verify all data files are present
echo    - Ensure ports 3000 and 8000 are available
echo.
echo ✅ Setup completed successfully!
echo.
pause