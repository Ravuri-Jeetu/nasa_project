@echo off
echo ========================================
echo Space Biology Research Platform Setup
echo ========================================
echo.

echo [1/4] Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
)

echo [2/4] Installing pnpm globally...
npm install -g pnpm
if %errorlevel% neq 0 (
    echo ERROR: Failed to install pnpm
    pause
    exit /b 1
)

echo [3/4] Setting up backend...
cd cursor-back
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo [4/4] Setting up frontend...
cd cursor-front
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the application:
echo 1. Run start-dev.bat
echo 2. Or manually:
echo    - Backend: cd cursor-back && venv\Scripts\activate && python -m uvicorn main:app --reload
echo    - Frontend: cd cursor-front && pnpm run dev
echo.
echo Access the application at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
pause
