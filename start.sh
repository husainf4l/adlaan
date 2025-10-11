#!/bin/bash

# Adlaan Project Startup Script
echo "🚀 Welcome to Adlaan Project Setup"
echo "=================================="

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start Django web server
start_web() {
    echo -e "${BLUE}🌐 Starting Django Web Server...${NC}"
    cd adlaan-web
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Run migrations if needed
    echo -e "${YELLOW}Running migrations...${NC}"
    python manage.py migrate --noinput
    
    # Check if port 8000 is available
    if check_port 8000; then
        echo -e "${RED}❌ Port 8000 is already in use${NC}"
        echo "Please stop any running Django servers or use a different port"
        return 1
    fi
    
    echo -e "${GREEN}✅ Starting Django server on http://127.0.0.1:8000${NC}"
    python manage.py runserver &
    WEB_PID=$!
    cd ..
}

# Function to start AI Agent server
start_agent() {
    echo -e "${BLUE}🤖 Starting AI Agent Server...${NC}"
    cd adlaan-agent
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Check if port 8001 is available
    if check_port 8001; then
        echo -e "${RED}❌ Port 8001 is already in use${NC}"
        echo "Please stop any running FastAPI servers or use a different port"
        return 1
    fi
    
    echo -e "${GREEN}✅ Starting AI Agent server on http://127.0.0.1:8001${NC}"
    python main.py &
    AGENT_PID=$!
    cd ..
}

# Function to create test user
create_test_user() {
    echo -e "${BLUE}👤 Creating test user for password reset...${NC}"
    cd adlaan-web
    source venv/bin/activate
    python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adlaan_project.settings')
django.setup()

from django.contrib.auth.models import User
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com'}
)
if not user.email:
    user.email = 'test@example.com'
    user.save()

if created:
    user.set_password('testpass123')
    user.save()
    print('✅ Created test user: testuser (test@example.com)')
else:
    print('✅ Test user already exists: testuser (test@example.com)')
"
    cd ..
}

# Function to show usage information
show_usage() {
    echo -e "${BLUE}📋 Available Commands:${NC}"
    echo "  ./start.sh web      - Start only Django web server"
    echo "  ./start.sh agent    - Start only AI agent server"  
    echo "  ./start.sh both     - Start both servers"
    echo "  ./start.sh test     - Create test user for password reset"
    echo "  ./start.sh stop     - Stop all running servers"
    echo "  ./start.sh help     - Show this help message"
    echo ""
    echo -e "${GREEN}🔗 Quick Links:${NC}"
    echo "  Web App:       http://127.0.0.1:8000"
    echo "  Password Reset: http://127.0.0.1:8000/password_reset/"
    echo "  AI Agent:      http://127.0.0.1:8001"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  - Password reset emails appear in the Django terminal"
    echo "  - Test user: testuser / test@example.com"
    echo "  - Use Ctrl+C to stop servers"
}

# Function to stop servers
stop_servers() {
    echo -e "${RED}🛑 Stopping servers...${NC}"
    pkill -f "manage.py runserver" 2>/dev/null && echo -e "${GREEN}✅ Django server stopped${NC}"
    pkill -f "main.py" 2>/dev/null && echo -e "${GREEN}✅ AI Agent server stopped${NC}"
    echo -e "${GREEN}✅ All servers stopped${NC}"
}

# Main script logic
case "$1" in
    "web")
        start_web
        echo -e "${GREEN}🎉 Django web server is running!${NC}"
        echo -e "Visit: ${BLUE}http://127.0.0.1:8000${NC}"
        echo -e "Password Reset: ${BLUE}http://127.0.0.1:8000/password_reset/${NC}"
        wait $WEB_PID
        ;;
    "agent")
        start_agent
        echo -e "${GREEN}🎉 AI Agent server is running!${NC}"
        echo -e "Visit: ${BLUE}http://127.0.0.1:8001${NC}"
        wait $AGENT_PID
        ;;
    "both")
        start_web
        start_agent
        create_test_user
        echo ""
        echo -e "${GREEN}🎉 Both servers are running!${NC}"
        echo -e "Web App:       ${BLUE}http://127.0.0.1:8000${NC}"
        echo -e "Password Reset: ${BLUE}http://127.0.0.1:8000/password_reset/${NC}"
        echo -e "AI Agent:      ${BLUE}http://127.0.0.1:8001${NC}"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
        wait $WEB_PID $AGENT_PID
        ;;
    "test")
        create_test_user
        ;;
    "stop")
        stop_servers
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac