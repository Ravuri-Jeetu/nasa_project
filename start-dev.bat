@echo off
echo ========================================
echo Space Biology Research Platform
echo Starting Development Servers...
echo ========================================
echo.

:: Define paths
set BACKEND_DIR=cursor-back
set FRONTEND_DIR=cursor-front

:: Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pnpm is not installed. Please run setup.bat first or install manually:
    echo npm install -g pnpm
    pause
    exit /b 1
)

:: Check if Python virtual environment exists
if not exist "%BACKEND_DIR%\venv\" (
    echo ERROR: Python virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

:: Check if frontend dependencies are installed
if not exist "%FRONTEND_DIR%\node_modules\" (
    echo ERROR: Frontend dependencies not found. Please run setup.bat first.
    pause
    exit /b 1
)

:: Start Backend
echo [1/2] Starting FastAPI Backend...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
start "Space Biology Backend" cmd /k "cd %BACKEND_DIR% && call venv\Scripts\activate && echo Backend starting... && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Next.js Frontend...
echo Frontend will be available at: http://localhost:3000 (or next available port)
echo.
start "Space Biology Frontend" cmd /k "cd %FRONTEND_DIR% && echo Frontend starting... && pnpm run dev"

echo ========================================
echo Both servers are starting in separate windows.
echo ========================================
echo.
echo Access the application:
echo - Frontend: http://localhost:3000 (or check the frontend window for the actual port)
echo - Backend API: http://localhost:8000
echo - API Documentation: http://localhost:8000/docs
echo.
echo Features available:
echo - Dynamic Manager Dashboard with real-time analytics
echo - Scientist Dashboard with AI-powered paper summarization
echo - Interactive Knowledge Graph with intrapaper relationships
echo - 607+ space biology publications from PMC
echo.
echo Press any key to close this window...
pause >nul
