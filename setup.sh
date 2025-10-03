#!/bin/bash

# NASA Research Analytics Platform - Quick Setup Script
# This script automates the installation and setup process

set -e  # Exit on any error

echo "🚀 NASA Research Analytics Platform - Setup Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "cursor-back" ] || [ ! -d "cursor-front" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Starting setup process..."

# Check system requirements
print_info "Checking system requirements..."

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    if [ "$(echo "$PYTHON_VERSION >= 3.8" | bc -l)" -eq 1 ]; then
        print_status "Python $PYTHON_VERSION found"
    else
        print_error "Python 3.8+ required, found $PYTHON_VERSION"
        exit 1
    fi
else
    print_error "Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_status "Node.js $(node --version) found"
    else
        print_error "Node.js 18+ required, found $(node --version)"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    print_status "pnpm $(pnpm --version) found"
else
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    print_status "pnpm installed"
fi

# Setup Backend
print_info "Setting up backend..."

cd cursor-back

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_status "Python dependencies installed"

# Check for required data files
print_info "Checking for required data files..."
REQUIRED_FILES=("SB_publication_PMC.csv" "Taskbook_cleaned_for_NLP.csv" "all_papers_chunked.jsonl")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found $file"
    else
        print_warning "Missing $file - some features may not work"
    fi
done

cd ..

# Setup Frontend
print_info "Setting up frontend..."

cd cursor-front

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
pnpm install
print_status "Node.js dependencies installed"

cd ..

# Create environment files
print_info "Creating environment files..."

# Frontend .env.local
if [ ! -f "cursor-front/.env.local" ]; then
    cat > cursor-front/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
EOF
    print_status "Created cursor-front/.env.local"
fi

# Backend .env
if [ ! -f "cursor-back/.env" ]; then
    cat > cursor-back/.env << EOF
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=True
LOG_LEVEL=INFO
EOF
    print_status "Created cursor-back/.env"
fi

# Create startup scripts
print_info "Creating startup scripts..."

# Backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting NASA Research Analytics Backend..."
cd cursor-back
source venv/bin/activate
python main.py
EOF
chmod +x start-backend.sh

# Frontend startup script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Starting NASA Research Analytics Frontend..."
cd cursor-front
pnpm run dev
EOF
chmod +x start-frontend.sh

# Combined startup script
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting NASA Research Analytics Platform..."

# Start backend in background
echo "Starting backend server..."
cd cursor-back
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../cursor-front
pnpm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
EOF
chmod +x start-all.sh

print_status "Startup scripts created"

# Final verification
print_info "Running final verification..."

# Test Python imports
cd cursor-back
source venv/bin/activate
python -c "
try:
    import fastapi, uvicorn, transformers, pandas, numpy
    print('✅ Backend dependencies verified')
except ImportError as e:
    print(f'❌ Backend dependency error: {e}')
    exit(1)
"
cd ..

# Test Node.js setup
cd cursor-front
if pnpm list --depth=0 > /dev/null 2>&1; then
    print_status "Frontend dependencies verified"
else
    print_error "Frontend dependency verification failed"
    exit 1
fi
cd ..

# Success message
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Start the application: ./start-all.sh"
echo "2. Or start individually:"
echo "   - Backend: ./start-backend.sh"
echo "   - Frontend: ./start-frontend.sh"
echo ""
echo "🌐 Access Points:"
echo "   - Main App: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Landing: http://localhost:3000/landing"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete setup guide"
echo "   - REQUIREMENTS.md - Detailed requirements"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check logs for any errors"
echo "   - Verify all data files are present"
echo "   - Ensure ports 3000 and 8000 are available"
echo ""
print_status "Setup completed successfully!"
