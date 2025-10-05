@echo off
echo 🚀 Starting Vercel deployment preparation...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this from the cursor-front directory.
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install pnpm first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Create production build
echo 🏗️ Building the application...
pnpm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Create environment file for Vercel
    echo 🔧 Creating environment configuration...
    echo # Vercel Production Environment Variables > .env.local
    echo NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api >> .env.local
    echo NODE_ENV=production >> .env.local
    echo NEXT_TELEMETRY_DISABLED=1 >> .env.local
    
    REM Create Vercel configuration
    echo { > vercel.json
    echo   "framework": "nextjs", >> vercel.json
    echo   "buildCommand": "pnpm run build", >> vercel.json
    echo   "outputDirectory": ".next", >> vercel.json
    echo   "installCommand": "pnpm install", >> vercel.json
    echo   "functions": { >> vercel.json
    echo     "app/api/**/*.ts": { >> vercel.json
    echo       "runtime": "nodejs18.x" >> vercel.json
    echo     } >> vercel.json
    echo   } >> vercel.json
    echo } >> vercel.json
    
    REM Create deployment instructions
    echo # Vercel Deployment Instructions > VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ## Quick Deployment Steps >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ### 1. Push to GitHub >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ```bash >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo git add . >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo git commit -m "Prepare for Vercel deployment" >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo git push origin main >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ``` >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ### 2. Deploy to Vercel >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo 1. Go to https://vercel.com >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo 2. Sign up with GitHub >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo 3. Click "New Project" >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo 4. Import your repository >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo 5. Configure settings: >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo    - Framework: Next.js (auto-detected) >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo    - Root Directory: cursor-front >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo    - Build Command: pnpm run build >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo    - Output Directory: .next >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ### 3. Set Environment Variables >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo In Vercel dashboard, add: >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo - NEXT_PUBLIC_API_BASE_URL: https://your-backend-domain.com/api >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo - NODE_ENV: production >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ### 4. Deploy >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo Click "Deploy" and wait for completion. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo. >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo ## Your app will be available at: >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    echo https://your-project-name.vercel.app >> VERCEL_DEPLOYMENT_INSTRUCTIONS.md
    
    echo 📋 Deployment package ready!
    echo.
    echo 📋 Next steps:
    echo 1. Push your code to GitHub
    echo 2. Go to https://vercel.com
    echo 3. Import your repository
    echo 4. Deploy!
    echo.
    echo 📖 Follow VERCEL_DEPLOYMENT_INSTRUCTIONS.md for detailed steps
    
) else (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

pause
