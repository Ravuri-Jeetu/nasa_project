# 🚀 Space Biology Research Platform

A comprehensive AI-powered research management platform for space biology studies, featuring dynamic analytics, real-time data processing, and interactive knowledge graphs.

## 🌟 Features

### 📊 Dynamic Manager Dashboard
- **Real-time Analytics**: Live data processing from CSV files
- **Investment Recommendations**: AI-powered funding optimization suggestions
- **Red Flag Alerts**: Critical research gap identification
- **Budget Simulator**: Interactive funding scenario testing
- **Domain Analytics**: Comprehensive research area distribution analysis

### 🔬 Scientist Dashboard
- **Paper Management**: 607+ space biology publications with clickable links
- **AI Summarization**: One-click paper summary generation
- **Knowledge Graph**: Interactive research relationship visualization
- **Intrapaper Analysis**: Paper-to-paper relationship mapping
- **Top Paper Selection**: Best 4 papers based on impact metrics

### 🤖 AI Integration
- **Smart Chatbot**: Context-aware research assistance
- **Paper Summarization**: Hugging Face DistilBART model integration
- **Keyword Extraction**: Automated research categorization
- **Methodology Classification**: AI-powered research method identification

### 📈 Advanced Analytics
- **Domain Classification**: 6 research areas (Plants, Microbes, Psychology, etc.)
- **Trend Analysis**: 5-year and 7-year research trend comparison
- **ROI Calculations**: Investment return analysis
- **Emerging Areas**: Growth potential identification

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts for visualizations
- **Animations**: Framer Motion

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **AI Models**: Hugging Face Transformers (DistilBART-CNN-12-6)
- **Data Processing**: Pandas for CSV analysis
- **CORS**: Enabled for frontend-backend communication
- **Real-time Processing**: Dynamic data analysis

## 📁 Project Structure

```
Frontend/
├── cursor-back/                 # FastAPI Backend
│   ├── main.py                 # Main API server
│   ├── data_processor.py       # Real-time data processing
│   ├── requirements.txt        # Python dependencies
│   └── SB_publication_PMC.csv  # Space biology publications
├── cursor-front/               # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── api/              # API client functions
│   │   └── store/            # Zustand state management
│   └── package.json           # Node.js dependencies
├── manager.py                 # Data analysis script
├── Taskbook_cleaned_for_NLP.csv # Research data
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+ with pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Start the Backend**
   ```bash
   cd cursor-back
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Start the Frontend**
   ```bash
   cd cursor-front
   pnpm install
   pnpm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000 (or available port)
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📊 Data Sources

### SB_publication_PMC.csv
- **607 space biology publications** from PubMed Central
- **Columns**: Title, Link, Authors, Abstract, Keywords
- **Real-time Processing**: Dynamic domain classification and analytics

### Taskbook_cleaned_for_NLP.csv
- **374 research projects** for manager analytics
- **Columns**: Title, Abstract, Methods, Results, Conclusion
- **Analysis**: Funding simulation and investment recommendations

## 🎯 Key Features in Detail

### Dynamic Manager Dashboard
- **Domain Analytics**: Real-time research area distribution
- **Investment Recommendations**: AI-suggested funding optimizations
- **Red Flag Alerts**: Critical research gap warnings
- **Budget Simulator**: Interactive funding scenario testing (-50% to +100%)
- **Emerging Areas**: Top 3 high-potential research domains

### Enhanced Knowledge Graph
- **Research Areas**: 6 main domains with paper counts
- **Intrapaper Relationships**: Paper-to-paper similarity analysis
- **Top Paper Selection**: Best 4 papers based on citations + funding
- **Interactive Visualization**: Click-to-select and explore connections

### AI-Powered Features
- **Paper Summarization**: One-click AI-generated summaries
- **Context-Aware Chat**: Research-specific chatbot responses
- **Keyword Extraction**: Automated research categorization
- **Similarity Analysis**: Paper relationship calculations

## 🔧 API Endpoints

### Papers & Analytics
- `GET /api/papers` - Get all papers with role filtering
- `GET /api/papers/{id}` - Get specific paper details
- `GET /api/analytics` - Get research analytics
- `GET /api/knowledge-graph` - Get knowledge graph data

### Manager Dashboard
- `GET /api/manager/domain-analytics` - Domain distribution analysis
- `GET /api/manager/investment-recommendations` - Funding suggestions
- `GET /api/manager/red-flag-alerts` - Critical gap alerts
- `GET /api/manager/budget-simulation` - Funding scenario testing
- `GET /api/manager/emerging-areas` - Growth opportunity analysis

### AI Features
- `POST /api/chat` - AI chatbot with paper context
- `POST /api/paper-summaries` - Generate paper summaries

## 🎨 UI Components

### Core Components
- **DynamicManagerDashboard**: Real-time analytics with dark theme
- **ScientistDashboard**: Paper management and AI features
- **KnowledgeGraph**: Interactive research visualization
- **ChatbotPanel**: AI-powered research assistance

### Styling
- **Dark Theme**: Professional gray-900/800 backgrounds
- **Color Coding**: Cyan headers, yellow highlights, red alerts
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover effects and transitions

## 📈 Analytics Features

### Domain Classification
- **Plants**: 42.5% (159 studies)
- **Microbes**: 22.5% (84 studies)
- **Psychology**: 19.3% (72 studies)
- **Radiation**: 10.2% (38 studies)
- **Human Physiology**: 3.5% (13 studies)
- **Other**: 2.1% (8 studies)

### Investment Recommendations
- **Primary**: Invest more in underfunded domains
- **Balance**: Optimize overfunded areas
- **ROI Analysis**: Real-time return calculations
- **Cost-Benefit**: Detailed financial impact analysis

## 🚨 Red Flag Alerts
- **Radiation & Food Supply**: Only 3 studies in the last decade
- **Crew Psychology**: <5 papers in the last 7 years
- **Human Physiology**: Critical gaps in astronaut health research

## 🔄 Real-Time Features
- **Data Refresh**: One-click CSV reload
- **Live Updates**: Dynamic chart updates
- **Interactive Simulations**: Real-time budget testing
- **Context-Aware AI**: Paper-specific chatbot responses

## 🛠️ Development

### Adding New Features
1. **Backend**: Add new endpoints in `cursor-back/main.py`
2. **Frontend**: Create components in `cursor-front/src/components/`
3. **API**: Update client functions in `cursor-front/src/api/`
4. **State**: Manage state with Zustand in `cursor-front/src/store/`

### Data Processing
- **CSV Analysis**: Modify `data_processor.py` for new analytics
- **Domain Classification**: Update keyword mapping in `main.py`
- **AI Integration**: Extend Hugging Face model usage

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for the space biology research community**
