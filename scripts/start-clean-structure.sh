#!/bin/bash
# filepath: start-clean-structure.sh

echo "🚀 Starting Shopfluence Bug Bounty Platform (Clean Structure)..."

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "Port 8000 already free"
lsof -ti:8002 | xargs kill -9 2>/dev/null || echo "Port 8002 already free"  
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "Port 8081 already free"
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "Port 5173 already free"

# Start E-commerce Backend
echo "📊 Starting E-commerce Backend (port 8000)..."
cd ecommerce/backend && python manage.py runserver 8000 &
ECOMMERCE_BACKEND_PID=$!

# Start Leaderboard Backend  
echo "🏆 Starting Leaderboard Backend (port 8002)..."
cd ../../leaderboard/backend && python manage.py runserver 8002 &
LEADERBOARD_BACKEND_PID=$!

# Wait a moment for backends to start
sleep 3

# Start E-commerce Frontend
echo "🛒 Starting E-commerce Frontend (port 8081)..."
cd ../../ecommerce/frontend && npm run dev &
ECOMMERCE_FRONTEND_PID=$!

# Start Leaderboard Frontend
echo "📈 Starting Leaderboard Frontend (port 5173)..."
cd ../../leaderboard/frontend/pycon-leaderboard-main && npm start &
LEADERBOARD_FRONTEND_PID=$!

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   🛒 E-commerce Shop:     http://localhost:8081"
echo "   📈 Leaderboard:        http://localhost:5173"
echo "   🧪 Bug Testing:        http://localhost:8081/docs/test_bug_notifications.html"
echo ""
echo "🔧 API Endpoints:"
echo "   📊 E-commerce API:     http://localhost:8000/api/"
echo "   🏆 Leaderboard API:    http://localhost:8002/api/"
echo ""
echo "📁 Clean Project Structure:"
echo "   ecommerce/"
echo "   ├── frontend/          - React e-commerce app"
echo "   └── backend/           - Django e-commerce API"
echo "   leaderboard/"
echo "   ├── frontend/          - React leaderboard"
echo "   └── backend/           - Django leaderboard API"
echo "   docs/                  - Documentation & testing"
echo ""
echo "💡 Quick Commands:"
echo "   Test all bugs:         Open DevTools → window.runAllTests()"
echo "   Integer overflow:      window.testIntegerOverflow()"
echo "   Rate limiting:         window.testRateLimiting()"
echo "   Price manipulation:    Add data-price='0.01' to cart button in DevTools"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Trap to clean up on exit
trap 'echo "🛑 Stopping all services..."; kill $ECOMMERCE_BACKEND_PID $LEADERBOARD_BACKEND_PID $ECOMMERCE_FRONTEND_PID $LEADERBOARD_FRONTEND_PID 2>/dev/null; exit' INT

# Wait for all background processes
wait
