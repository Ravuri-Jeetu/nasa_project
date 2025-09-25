# Research Analytics Platform - Setup Instructions

## Overview
This is a full-stack research analytics platform with a Next.js frontend and FastAPI backend that integrates CSV data for research papers.

## Prerequisites
- Node.js 18+ 
- Python 3.8+
- pnpm (recommended) or npm

## Quick Start

### Option 1: Use the Startup Script (Windows)
1. Double-click `start-dev.bat` to start both servers automatically

### Option 2: Manual Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd cursor-back
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Your CSV file is already in place!
   - The system has automatically detected and loaded `SB_publication_PMC.csv` with 607 papers
   - The backend will extract keywords and methodologies from your paper titles
   - All papers are now available in the frontend with proper categorization

4. Start the backend server:
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd cursor-front
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

## CSV Data Format
Your CSV file should have the following structure (case insensitive):
```csv
Title,Link
"Mice in Bion-M 1 space mission: training and selection","https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/"
"Microgravity induces pelvic bone loss through osteoclastic activity","https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630201/"
```

**Note**: Your `SB_publication_PMC.csv` file has been automatically detected and loaded with 607 space biology research papers!

## Features

### ✅ Completed Integration
- **CSV Integration**: Automatically loads papers from CSV with title and link columns
- **Backend-Frontend Connection**: All API endpoints are connected and functional
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Role-Based Dashboards**: Scientist and Manager views with different analytics
- **AI Chat Integration**: Context-aware AI assistant with paper selection
- **Real-time Data**: Live data from backend API endpoints

### 🎯 Key Features
- **Papers Management**: Browse, search, and select papers for AI context
- **Advanced Analytics**: Role-specific metrics and visualizations
- **Interactive Charts**: Responsive charts using Recharts
- **AI Assistant**: Floating AI button with chat panel
- **Export Capabilities**: Data export and report generation
- **Mobile-First Design**: Optimized for all device sizes

## API Endpoints

### Papers
- `GET /api/papers` - Get all papers with role filtering
- `GET /api/papers/{id}` - Get specific paper by ID

### Analytics
- `GET /api/analytics` - Get role-based analytics data
- `GET /api/knowledge-graph` - Get knowledge graph data
- `GET /api/gap-finder` - Get research gaps by role

### AI Features
- `POST /api/chat` - Send chat messages with context
- `POST /api/summaries` - Generate paper summaries
- `POST /api/paper-summaries` - Generate summaries from CSV data

## Development

### Backend (FastAPI)
- Automatic CSV loading on startup
- Role-based data filtering
- AI summarization with Hugging Face models
- CORS enabled for frontend integration

### Frontend (Next.js)
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching
- Responsive design with mobile-first approach

## Troubleshooting

### Common Issues
1. **CSV not loading**: Ensure your CSV file is in the `cursor-back` directory with proper column names
2. **Backend not starting**: Check if port 8000 is available and all dependencies are installed
3. **Frontend not connecting**: Verify the backend is running and check the API base URL

### Environment Variables
The frontend expects the backend to be running on `http://localhost:8000` by default. You can modify this in the `.env.local` file if needed.

## Next Steps
1. Add your CSV file to the `cursor-back` directory
2. Run the startup script or manually start both servers
3. Visit `http://localhost:3000` to access the application
4. Switch between Scientist and Manager roles to see different analytics

## Support
For issues or questions, check the console logs in both the frontend and backend terminals for error messages.
