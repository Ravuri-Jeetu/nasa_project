# NASA Research Analytics Platform - Requirements

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: Dual-core processor (Quad-core recommended)
- **Internet**: Stable connection for AI model downloads

### Software Requirements

#### Backend (Python)
- **Python**: 3.8 or higher
- **pip**: Latest version
- **Virtual Environment**: venv or conda

#### Frontend (Node.js)
- **Node.js**: 18.x or higher
- **pnpm**: Latest version (recommended) or npm
- **Git**: For version control

## Python Dependencies

### Core Backend Requirements
```
fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.0
torch==2.1.0
pydantic==2.5.0
accelerate==0.24.1
pandas==2.1.3
scikit-learn==1.3.2
numpy==1.24.3
sentence-transformers==2.2.2
faiss-cpu==1.7.4
requests==2.31.0
```

### Optional AI Dependencies
```
ollama==0.1.7
gradio==4.7.1
datasets==2.14.6
```

## Node.js Dependencies

### Frontend Requirements
```json
{
  "next": "^15.5.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.2.2",
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15",
  "tailwindcss": "^3.3.5",
  "@tailwindcss/typography": "^0.5.10",
  "zustand": "^4.4.6",
  "@tanstack/react-query": "^5.8.4",
  "axios": "^1.6.0",
  "framer-motion": "^10.16.4",
  "recharts": "^2.8.0",
  "lucide-react": "^0.292.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

## Data Files Required

### Research Data
- `SB_publication_PMC.csv` - NASA research papers (607+ papers)
- `Taskbook_cleaned_for_NLP.csv` - Project data (374+ projects)
- `all_papers_chunked.jsonl` - Processed paper chunks (27,351+ chunks)

### AI Model Files
- `faiss_index.bin` - Vector search index
- `chunks.pkl` - Processed text chunks
- `embedding_model/` - Sentence transformer model files

## Installation Commands

### Quick Setup Script (Windows)
```powershell
# Clone repository
git clone https://github.com/Ravuri-Jeetu/nasa_project.git
cd nasa_project

# Backend setup
cd cursor-back
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ..\cursor-front
pnpm install
```

### Quick Setup Script (macOS/Linux)
```bash
# Clone repository
git clone https://github.com/Ravuri-Jeetu/nasa_project.git
cd nasa_project

# Backend setup
cd cursor-back
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../cursor-front
pnpm install
```

## Verification Commands

### Check Backend Setup
```bash
cd cursor-back
python -c "import fastapi, uvicorn, transformers; print('✅ Backend dependencies OK')"
```

### Check Frontend Setup
```bash
cd cursor-front
pnpm --version
node --version
```

### Check Data Files
```bash
# Backend directory
ls cursor-back/SB_publication_PMC.csv
ls cursor-back/Taskbook_cleaned_for_NLP.csv
ls cursor-back/all_papers_chunked.jsonl

# AI model directory
ls nasa-ai-model/rag_system/
```

## Performance Recommendations

### For Development
- Use SSD storage for faster I/O
- Allocate 4GB+ RAM to Node.js
- Enable hot reloading for faster development

### For Production
- Use dedicated server with 16GB+ RAM
- Enable GPU acceleration if available
- Use CDN for static assets
- Implement caching strategies

## Troubleshooting Common Issues

### Python Version Issues
```bash
# Check Python version
python --version
# Should be 3.8 or higher

# If using conda
conda create -n nasa-platform python=3.9
conda activate nasa-platform
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version
# Should be 18.x or higher

# Install pnpm globally
npm install -g pnpm
```

### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Windows
set NODE_OPTIONS=--max-old-space-size=4096
```

### Port Conflicts
```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :8000

# Kill processes if needed
taskkill /F /PID <process_id>
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (.env)
```env
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=True
LOG_LEVEL=INFO
```

## Docker Support (Optional)

### Dockerfile for Backend
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Dockerfile for Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
```

## Security Considerations

### Data Security
- All research data is publicly available
- No authentication required for basic features
- API endpoints are read-only by default

### Network Security
- CORS enabled for localhost development
- HTTPS recommended for production
- Rate limiting implemented on API endpoints

## Support and Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor for security vulnerabilities
- Keep AI models updated

### Backup Strategy
- Backup data files regularly
- Version control all code changes
- Document configuration changes

---

*For detailed setup instructions, see the main README.md file.*
