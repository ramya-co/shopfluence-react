#!/bin/bash

# Complete Leaderboard Integration Setup
echo "🚀 Setting up Bug Hunter Leaderboard Integration"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backend is already running
check_backend() {
    print_status "Checking if backend is running on port 8002..."
    
    if curl -s "http://localhost:8002/api/health/" > /dev/null 2>&1; then
        print_success "Backend is already running on port 8002"
        return 0
    else
        print_status "Backend not running, will start it..."
        return 1
    fi
}

# Start the backend
start_backend() {
    print_status "Starting Django leaderboard backend..."
    
    cd leaderboard/backend
    
    # Install dependencies if needed
    if [ ! -d "../../.venv" ]; then
        print_error "Virtual environment not found. Please run: python -m venv .venv"
        exit 1
    fi
    
    # Activate virtual environment and start server
    source "../../.venv/bin/activate"
    
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
    
    print_status "Running migrations..."
    python manage.py migrate > /dev/null 2>&1
    
    print_status "Starting backend server on port 8002..."
    python manage.py runserver 8002 &
    BACKEND_PID=$!
    
    # Wait for server to start
    sleep 3
    
    if curl -s "http://localhost:8002/api/health/" > /dev/null 2>&1; then
        print_success "Backend started successfully (PID: $BACKEND_PID)"
        echo $BACKEND_PID > ../../backend.pid
    else
        print_error "Failed to start backend"
        exit 1
    fi
    
    cd ../..
}

# Start the main app
start_frontend() {
    print_status "Starting main React application..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    print_status "Starting frontend on port 5173..."
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    print_success "Frontend started (PID: $FRONTEND_PID)"
}

# Test the integration
test_integration() {
    print_status "Testing API integration..."
    
    sleep 2
    python test_leaderboard_integration.py
}

# Main execution
main() {
    if ! check_backend; then
        start_backend
    fi
    
    start_frontend
    
    sleep 3
    test_integration
    
    echo ""
    print_success "🎉 Leaderboard Integration Complete!"
    echo ""
    echo "📋 What's Running:"
    echo "   • Django Backend: http://localhost:8002/api/"
    echo "   • React Frontend: http://localhost:5173/"
    echo "   • Leaderboard Page: http://localhost:5173/leaderboard"
    echo ""
    echo "🔧 Admin Panel: http://localhost:8002/admin/"
    echo "   (Create superuser: cd leaderboard/backend && python manage.py createsuperuser)"
    echo ""
    echo "🧪 Test Bug Discovery:"
    echo "   1. Go to http://localhost:5173/"
    echo "   2. Navigate around and trigger bugs"
    echo "   3. Check leaderboard at http://localhost:5173/leaderboard"
    echo ""
    echo "🛑 To stop servers:"
    echo "   kill \$(cat backend.pid frontend.pid) 2>/dev/null"
    echo ""
    
    # Keep script running
    echo "Press Ctrl+C to stop all servers..."
    wait
}

# Cleanup function
cleanup() {
    print_status "Stopping servers..."
    if [ -f backend.pid ]; then
        kill $(cat backend.pid) 2>/dev/null
        rm backend.pid
    fi
    if [ -f frontend.pid ]; then
        kill $(cat frontend.pid) 2>/dev/null
        rm frontend.pid
    fi
    print_success "Cleanup complete"
    exit 0
}

# Set up signal handling
trap cleanup INT TERM

# Run main function
main
