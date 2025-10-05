# Vercel Deployment Configuration

## 🚀 Deploying Your Next.js App to Vercel

This guide will help you deploy your Research Analytics Dashboard frontend to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free)
- Your Next.js project ready

## Quick Deployment Steps

### Step 1: Prepare Your Project

1. **Ensure your project is ready:**
   ```bash
   cd cursor-front
   pnpm install
   pnpm run build
   ```

2. **Check if build is successful:**
   - Verify no build errors
   - Test locally: `pnpm run dev`

### Step 2: Push to GitHub

1. **Initialize Git repository (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository:**
   - Go to GitHub.com
   - Click "New repository"
   - Name it: `nasa-research-frontend`
   - Make it public (for free Vercel)

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/yourusername/nasa-research-frontend.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel.com:**
   - Sign up with GitHub
   - Click "New Project"

2. **Import your repository:**
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure deployment:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `cursor-front`
   - Build Command: `pnpm run build`
   - Output Directory: `.next`

4. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Domains" tab
   - Add your custom domain

2. **Update DNS:**
   - Point your domain to Vercel
   - Vercel will provide DNS instructions

## Environment Variables

Create `.env.local` file:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Vercel Configuration

Create `vercel.json` in your project root:
```json
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
```

## Troubleshooting

### Common Issues:

1. **Build Errors:**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **Environment Variables:**
   - Ensure all `NEXT_PUBLIC_` variables are set
   - Check API URL is correct

3. **API Connection:**
   - Verify backend is running
   - Check CORS settings
   - Test API endpoints

## Performance Optimization

### Vercel Features:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Image optimization
- ✅ Automatic deployments
- ✅ Preview deployments

### Next.js Optimizations:
- ✅ Static generation
- ✅ Image optimization
- ✅ Code splitting
- ✅ Bundle optimization

## Monitoring

### Vercel Analytics:
- Page views
- Performance metrics
- Core Web Vitals
- Real user monitoring

## Support

- Vercel Documentation
- Next.js Documentation
- GitHub Issues
- Vercel Community

---

## Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel

# Deploy with production settings
vercel --prod
```

Your frontend will be live at: `https://your-project.vercel.app`
