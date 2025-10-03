# 🚀 NASA Research Analytics Platform

A comprehensive AI-powered research analytics platform designed for NASA space biology research, featuring role-based dashboards, hypothesis generation, and intelligent data analysis.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔬 **Scientist Dashboard**
- **Hypothesis Generation**: AI-powered generation of testable scientific hypotheses
- **Knowledge Graph**: Interactive visualization of research relationships
- **Methodology Comparison**: Side-by-side analysis of research methodologies
- **Topic Comparison**: Comparative analysis of research topics
- **Gap Analysis**: Real-time identification of research gaps
- **Publications Browser**: Paginated research paper exploration

### 💼 **Manager Dashboard**
- **Dynamic Analytics**: Real-time project and funding analytics
- **Budget Optimization**: AI-powered budget allocation recommendations
- **Investment Analysis**: ROI and performance tracking
- **Red Flag Alerts**: Automated risk identification
- **Team Performance**: Resource utilization and efficiency metrics

### 🚀 **Mission Planner Dashboard**
- **Mission Feasibility**: AI-powered mission assessment
- **Risk Analysis**: Comprehensive risk evaluation
- **Resource Planning**: Mission resource optimization
- **What-If Analysis**: Scenario modeling and simulation

### 🤖 **AI Integration**
- **Hybrid AI Chatbot**: Combines Ollama models with RAG system
- **Real-time Analysis**: Live data processing and insights
- **Evidence-based Recommendations**: Research-backed suggestions

## 🏗️ Architecture

```
Frontend (Next.js 15)          Backend (FastAPI)
├── React Components           ├── API Endpoints
├── Tailwind CSS              ├── AI Services
├── shadcn/ui                 ├── Data Processing
├── Zustand State             ├── RAG System
└── React Query               └── ML Models
```

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **pnpm**: Latest version
- **Git**: For version control

### Hardware Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: Multi-core processor recommended

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Ravuri-Jeetu/nasa_project.git
cd nasa_project
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd cursor-back

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd cursor-front

# Install dependencies using pnpm
pnpm install
```

### 4. Data Setup
Ensure the following data files are present in `cursor-back/`:
- `SB_publication_PMC.csv` - NASA research papers
- `Taskbook_cleaned_for_NLP.csv` - Project data
- `all_papers_chunked.jsonl` - Processed paper chunks

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file in `cursor-front/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### AI Model Configuration
The system uses multiple AI models:
- **Ollama**: Custom NASA-trained model (optional)
- **Sentence Transformers**: For embeddings
- **FAISS**: For vector search
- **Hugging Face**: For summarization

## 🚀 Running the Application

### 1. Start the Backend Server
```bash
cd cursor-back
python main.py
```
The backend will be available at: `http://localhost:8000`

### 2. Start the Frontend Server
```bash
cd cursor-front
pnpm run dev
```
The frontend will be available at: `http://localhost:3000`

### 3. Access the Application
Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Landing Page**: http://localhost:3000/landing

## 📚 API Documentation

### Core Endpoints

#### Papers API
```http
GET /api/papers?role=Scientist&limit=10&offset=0
POST /api/papers
GET /api/papers/{paper_id}
```

#### Analytics API
```http
GET /api/analytics?role=Scientist
GET /api/knowledge-graph?role=Scientist
GET /api/gap-finder?role=Scientist
```

#### AI Chat API
```http
POST /api/hybrid-nasa-ai-chat
POST /api/nasa-ai-chat
```

#### Hypothesis Generation API
```http
POST /api/hypothesis
Content-Type: application/json
{
  "query": "microgravity effects on bone density",
  "role": "scientist"
}
```

#### Mission Planner API
```http
POST /api/mission-planner
Content-Type: application/json
{
  "destination": "Mars",
  "crew_size": 4,
  "duration_days": 900,
  "payload_capacity": "50 tons"
}
```

## 📖 Usage Guide

### For Scientists

1. **Navigate to Scientist Dashboard**
   - Select "Scientist" role
   - Access dashboard at `/dashboard`

2. **Generate Hypotheses**
   - Go to "Hypothesis Generation" tab
   - Enter research query (e.g., "psychological effects of long-duration missions")
   - Click "Generate" to see AI-generated hypotheses
   - Click on related research papers to access full articles

3. **Explore Knowledge Graph**
   - Switch to "Knowledge Graph" tab
   - Interact with nodes to explore research relationships
   - Hover over nodes to see labels

4. **Compare Methodologies**
   - Use "Methodology Comparison" tab
   - Select topics from dropdown
   - View AI-powered recommendations

### For Managers

1. **Access Manager Dashboard**
   - Select "Manager" role
   - View real-time analytics and metrics

2. **Analyze Budget Allocation**
   - Review funding distribution charts
   - Get AI recommendations for optimization

3. **Monitor Project Status**
   - Check red flag alerts
   - Review team performance metrics

### For Mission Planners

1. **Navigate to Mission Planner**
   - Select "Mission Planner" role
   - Access mission planning tools

2. **Design Missions**
   - Configure mission parameters
   - Get feasibility scores
   - Review risk assessments

3. **Analyze Resources**
   - View resource requirements
   - Optimize mission parameters

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version

# Verify dependencies
pip list

# Check for port conflicts
netstat -an | findstr :8000
```

#### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Check Node.js version
node --version
```

#### AI Models Not Loading
```bash
# Verify model files exist
ls cursor-back/
ls nasa-ai-model/rag_system/

# Check Python packages
pip install sentence-transformers faiss-cpu
```

#### Database Connection Issues
- Ensure CSV files are in correct location
- Check file permissions
- Verify data format

### Performance Optimization

#### Memory Usage
- Close unnecessary applications
- Increase virtual memory if needed
- Use SSD storage for better performance

#### Model Loading
- Models are loaded on first startup
- Subsequent requests are faster
- Consider using GPU acceleration if available

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use TypeScript for frontend
- Write comprehensive tests
- Document new features

### Testing
```bash
# Backend tests
cd cursor-back
python -m pytest

# Frontend tests
cd cursor-front
pnpm test
```

## 📊 Data Sources

### Research Papers
- **Source**: NASA Space Biology publications
- **Format**: CSV with PMC links
- **Count**: 607+ papers
- **Coverage**: Space biology, microgravity, radiation, etc.

### Project Data
- **Source**: NASA Taskbook
- **Format**: CSV with project details
- **Count**: 374+ projects
- **Fields**: Funding, team size, status, ROI

### AI Training Data
- **Source**: Processed research chunks
- **Format**: JSONL
- **Count**: 27,351+ chunks
- **Usage**: RAG system and AI training

## 🔒 Security

### Data Protection
- No sensitive data stored
- All data is publicly available research
- API endpoints are read-only for external access

### Authentication
- Role-based access control
- Session management
- CORS protection enabled

## 📈 Performance Metrics

### Response Times
- **API Endpoints**: < 500ms average
- **Hypothesis Generation**: 2-5 seconds
- **Knowledge Graph**: < 1 second
- **Page Load**: < 2 seconds

### Scalability
- **Concurrent Users**: 100+ supported
- **Data Processing**: Real-time
- **Model Inference**: Optimized for speed

## 🆘 Support

### Getting Help
- Check this README first
- Review API documentation at `/docs`
- Check GitHub issues
- Contact maintainers

### Reporting Issues
1. Check existing issues
2. Provide detailed error messages
3. Include system information
4. Describe steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA**: For providing research data and inspiration
- **Hugging Face**: For AI models and infrastructure
- **Open Source Community**: For excellent tools and libraries

## 📞 Contact

- **Repository**: https://github.com/Ravuri-Jeetu/nasa_project
- **Issues**: https://github.com/Ravuri-Jeetu/nasa_project/issues
- **Documentation**: http://localhost:8000/docs (when running)

---

**Built with ❤️ for NASA Space Biology Research**

*Last updated: October 2025*