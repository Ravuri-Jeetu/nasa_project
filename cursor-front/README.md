# Research Analytics Dashboard

A production-ready frontend application built with Next.js 14, featuring role-based dashboards for scientists and managers with AI-powered insights and analytics.

## 🚀 Features

### Role-Based Views
- **Scientist Dashboard**: Technical analysis with deep research insights
- **Manager Dashboard**: Business intelligence and investment analytics
- Easy role switching with persistent state management

### Scientist Features
- 📊 Publications filtering and analysis
- 🧠 Knowledge Graph visualization
- 🔬 Methodology comparison panels
- 🔍 Research Gap Finder
- 📈 Technical metrics and impact analysis

### Manager Features
- 💰 Investment ROI analysis
- 📊 Market trends and analytics
- 🎯 Resource allocation heatmaps
- 📈 Correlation analysis (funding vs return)
- 💼 Business intelligence summaries

### AI Integration
- 🤖 Floating AI button with smooth animations
- 💬 Chat panel with role-based responses
- 📝 Context-aware AI assistance
- 🔄 Real-time chat with backend integration

### Paper Management
- 📚 Comprehensive paper listing with filters
- 🔍 Advanced search capabilities
- 📄 Detailed paper analysis pages
- ✅ Paper selection for AI context

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui + lucide-react icons
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Environment**: .env.local configuration

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard (role-based)
│   ├── papers/            # Papers pages
│   │   ├── page.tsx      # Paper list
│   │   └── [id]/page.tsx # Paper detail
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css       # Global styles
├── components/            # UI components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Navigation header
│   ├── main-layout.tsx   # Main layout wrapper
│   ├── ai-button.tsx     # Floating AI button
│   ├── chatbot-panel.tsx # Chat interface
│   ├── scientist-dashboard.tsx
│   ├── manager-dashboard.tsx
│   └── providers.tsx     # React Query provider
├── store/                # Zustand stores
│   └── appStore.ts       # Global app state
├── api/                  # API layer
│   ├── apiClient.ts      # Axios configuration
│   ├── api.ts           # API functions
│   └── hooks.ts         # React Query hooks
└── lib/                 # Utilities
    └── utils.ts         # shadcn/ui utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor-front
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: http://localhost:8000)

### API Integration
The application expects the following backend endpoints:

- `GET /api/papers?role={role}` - Fetch papers by role
- `GET /api/papers/{id}?role={role}` - Fetch specific paper
- `POST /api/chat` - Send chat message
- `GET /api/analytics?role={role}` - Fetch analytics data
- `GET /api/knowledge-graph?role={role}` - Fetch knowledge graph data

### Request Headers
All API requests automatically include:
- `X-User-Role`: Current user role (Scientist/Manager)
- `Content-Type`: application/json

## 🎨 UI Components

### shadcn/ui Components Used
- Button, Card, Badge, Input, Select
- Dialog, Tabs, Separator, Avatar
- All components are fully customizable with Tailwind CSS

### Custom Components
- **AIButton**: Floating action button with animations
- **ChatbotPanel**: Slide-up chat interface
- **RoleToggle**: Segmented control for role switching
- **Dashboard Cards**: Role-specific metric displays

## 📊 Data Visualization

### Charts (Recharts)
- Bar charts for methodology analysis
- Line charts for trend visualization
- Scatter plots for correlation analysis
- Pie charts for resource allocation
- Area charts for revenue trends

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive chart sizing
- Touch-friendly interactions

## 🔄 State Management

### Zustand Store
```typescript
interface AppState {
  role: UserRole;                    // Current user role
  selectedPaperIds: string[];        // Selected papers for AI context
  setRole: (role: UserRole) => void;
  setSelectedPaperIds: (ids: string[]) => void;
  addSelectedPaperId: (id: string) => void;
  removeSelectedPaperId: (id: string) => void;
  clearSelectedPaperIds: () => void;
}
```

### Persistence
- Role preference persisted in localStorage
- Selected papers reset on page refresh
- React Query handles data caching

## 🎭 Role-Based Features

### Scientist Role
- Technical methodology analysis
- Research impact metrics
- Gap analysis and opportunities
- Academic citation tracking
- Technical limitations assessment

### Manager Role
- ROI and investment analysis
- Market size and growth metrics
- Competitive advantage assessment
- Risk factor evaluation
- Business opportunity identification

## 🤖 AI Integration

### Chat Features
- Role-aware responses
- Context from selected papers
- Real-time message handling
- Error handling and retry logic
- Message history persistence

### AI Button
- Fixed bottom-right positioning
- Smooth slide-up animation
- Accessible with proper ARIA labels
- Hover and click animations

## 🚀 Deployment

### Build for Production
```bash
pnpm run build
```

### Start Production Server
```bash
pnpm start
```

### Environment Setup
Ensure your production environment has:
- `NEXT_PUBLIC_API_BASE_URL` pointing to your backend
- Proper CORS configuration on backend
- SSL certificates for HTTPS

## 🧪 Development

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Consistent component structure

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API integration guide
- Open an issue for bugs or feature requests

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.