# Vercel Frontend Deployment Script

echo "🚀 Starting Vercel deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the cursor-front directory."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create production build
echo "🏗️ Building the application..."
pnpm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create environment file for Vercel
    echo "🔧 Creating environment configuration..."
    cat > .env.local << 'EOF'
# Vercel Production Environment Variables
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF
    
    # Create Vercel configuration
    cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
EOF
    
    # Create deployment instructions
    cat > VERCEL_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Vercel Deployment Instructions

## Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure settings:
   - Framework: Next.js (auto-detected)
   - Root Directory: cursor-front
   - Build Command: pnpm run build
   - Output Directory: .next

### 3. Set Environment Variables
In Vercel dashboard, add:
- NEXT_PUBLIC_API_BASE_URL: https://your-backend-domain.com/api
- NODE_ENV: production

### 4. Deploy
Click "Deploy" and wait for completion.

## Your app will be available at:
https://your-project-name.vercel.app

## Next Steps
1. Test your deployed app
2. Configure custom domain (optional)
3. Set up monitoring
4. Connect to your backend

## Troubleshooting
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Test API connections
- Check browser console for errors
EOF
    
    echo "📋 Deployment package ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Go to https://vercel.com"
    echo "3. Import your repository"
    echo "4. Deploy!"
    echo ""
    echo "📖 Follow VERCEL_DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
    
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
