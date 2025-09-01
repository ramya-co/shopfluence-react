#!/bin/bash

# Bug Discovery Leaderboard Setup Script
# This script sets up both the backend and frontend for the leaderboard system

set -e  # Exit on any error

echo "🚀 Setting up Bug Discovery Leaderboard System..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "leaderboard" ]; then
    print_error "Please run this script from the shopfluence-react-main directory"
    exit 1
fi

cd leaderboard

# Setup Backend
print_status "Setting up Django backend..."
cd backend

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
print_status "Installing Python dependencies..."
pip install -q -r requirements.txt

# Run database setup
print_status "Setting up database..."
python manage.py makemigrations --verbosity=0
python manage.py migrate --verbosity=0

# Create sample data
print_status "Creating sample data..."
python setup.py > /dev/null 2>&1 || print_warning "Sample data creation had some issues (this is usually fine)"

print_success "Backend setup complete!"

# Setup Frontend
cd ../frontend
print_status "Setting up React frontend..."

# Check if Node.js is available
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install --silent

print_success "Frontend setup complete!"

# Final instructions
cd ../..
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "🔧 To start the leaderboard system:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd leaderboard/backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver 8001"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd leaderboard/frontend"
echo "   npm start"
echo ""
echo "3. View the leaderboard at: http://localhost:3001"
echo ""
echo "🔗 Integration:"
echo "The bug discovery notifications have been automatically updated"
echo "to send data to the leaderboard when bugs are found."
echo ""
echo "🎯 Test it:"
echo "1. Start your main ecommerce app on port 3000"
echo "2. Find bugs in the ecommerce app"
echo "3. Watch them appear in the leaderboard!"
echo ""
echo "📚 More info:"
echo "- README: leaderboard/README.md"
echo "- Integration guide: leaderboard/INTEGRATION.md"
echo "- Admin panel: http://localhost:8001/admin/"
echo "- API docs: http://localhost:8001/api/"

# Create quick start scripts
print_status "Creating quick start scripts..."

# Backend start script
cat > leaderboard/start-backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
echo "🚀 Starting Bug Discovery Leaderboard Backend on port 8001..."
python manage.py runserver 8001
EOF

# Frontend start script  
cat > leaderboard/start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
echo "🚀 Starting Bug Discovery Leaderboard Frontend on port 3001..."
npm start
EOF

# Make scripts executable
chmod +x leaderboard/start-backend.sh
chmod +x leaderboard/start-frontend.sh

print_success "Quick start scripts created!"
echo ""
echo "🚀 Quick start commands:"
echo "Backend:  ./leaderboard/start-backend.sh"
echo "Frontend: ./leaderboard/start-frontend.sh"
echo ""
print_success "🎉 All done! Happy bug hunting!"
