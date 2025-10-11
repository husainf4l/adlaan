#!/bin/bash
# Adlaan Services Startup Script
# Starts all services in the correct order with proper configuration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/home/dev/Desktop/adlaan"

echo -e "${BLUE}🚀 Starting Adlaan Services${NC}"
echo "=================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to wait for service to start
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $name to start...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -E "200|404" > /dev/null; then
            echo -e "${GREEN}✅ $name is running!${NC}"
            return 0
        fi
        
        echo -ne "\r   Attempt $attempt/$max_attempts..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}❌ $name failed to start${NC}"
    return 1
}

# Kill existing processes if any
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "python.*manage.py.*runserver" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
sleep 2

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
cd "$PROJECT_ROOT"
source venv/bin/activate

# Check if required packages are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing missing packages...${NC}"
    pip install fastapi uvicorn django
fi

# Set environment variables
export PYTHONPATH="$PROJECT_ROOT:$PROJECT_ROOT/adlaan-agent:$PYTHONPATH"
export OPENAI_API_KEY="development"
export ENVIRONMENT="development"

# Start Agent Service
echo -e "${BLUE}🤖 Starting Agent Service...${NC}"
cd "$PROJECT_ROOT/adlaan-agent"

if check_port 8005; then
    # Check if main.py exists and is runnable
    if [ -f "main.py" ]; then
        echo "   Starting on http://localhost:8005"
        python main.py --host 0.0.0.0 --port 8005 > agent.log 2>&1 &
        AGENT_PID=$!
        echo "   Process ID: $AGENT_PID"
        
        # Wait a moment for startup
        sleep 3
        
        # Check if process is still running
        if kill -0 $AGENT_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Agent service started successfully${NC}"
        else
            echo -e "${RED}❌ Agent service failed to start${NC}"
            echo "   Check agent.log for details:"
            tail -10 agent.log
        fi
    else
        echo -e "${RED}❌ main.py not found in adlaan-agent${NC}"
    fi
fi

# Start Web Service  
echo -e "${BLUE}🌐 Starting Web Service...${NC}"
cd "$PROJECT_ROOT/adlaan-web"

if check_port 8000; then
    # Check if manage.py exists
    if [ -f "manage.py" ]; then
        echo "   Starting on http://localhost:8000"
        python manage.py runserver 0.0.0.0:8000 > web.log 2>&1 &
        WEB_PID=$!
        echo "   Process ID: $WEB_PID"
        
        # Wait a moment for startup
        sleep 3
        
        # Check if process is still running
        if kill -0 $WEB_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Web service started successfully${NC}"
        else
            echo -e "${RED}❌ Web service failed to start${NC}"
            echo "   Check web.log for details:"
            tail -10 web.log
        fi
    else
        echo -e "${RED}❌ manage.py not found in adlaan-web${NC}"
    fi
fi

# Install curl if not available
if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}📦 Installing curl...${NC}"
    sudo apt update && sudo apt install -y curl
fi

# Check service health
echo -e "\n${BLUE}🔍 Checking Service Health...${NC}"
echo "=================================="

# Check Agent Service
echo -e "${BLUE}Agent Service (http://localhost:8005):${NC}"
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8005/" | grep -E "200|404" > /dev/null; then
    echo -e "${GREEN}✅ Responding${NC}"
    
    # Try to get status
    AGENT_STATUS=$(curl -s "http://localhost:8005/" 2>/dev/null | head -1)
    if [ ! -z "$AGENT_STATUS" ]; then
        echo "   Status: $AGENT_STATUS"
    fi
else
    echo -e "${RED}❌ Not responding${NC}"
    if [ -f "$PROJECT_ROOT/adlaan-agent/agent.log" ]; then
        echo "   Last error:"
        tail -3 "$PROJECT_ROOT/adlaan-agent/agent.log"
    fi
fi

# Check Web Service
echo -e "\n${BLUE}Web Service (http://localhost:8000):${NC}"
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/" | grep -E "200|404|500" > /dev/null; then
    echo -e "${GREEN}✅ Responding${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
    if [ -f "$PROJECT_ROOT/adlaan-web/web.log" ]; then
        echo "   Last error:"
        tail -3 "$PROJECT_ROOT/adlaan-web/web.log"
    fi
fi

# Final status
echo -e "\n${BLUE}📊 Service Summary:${NC}"
echo "=================================="
echo -e "Agent Service:   ${GREEN}http://localhost:8005${NC}"
echo -e "Web Interface:   ${GREEN}http://localhost:8000${NC}"
echo -e "Enhanced Debug:  ${GREEN}http://localhost:8005/debug${NC}"
echo -e "Intelligence:    ${GREEN}http://localhost:8005/api/intelligence/status${NC}"

echo -e "\n${GREEN}🎉 Adlaan services startup complete!${NC}"
echo -e "${YELLOW}💡 Tip: Run 'python health_check.py' to verify all systems${NC}"

# Keep script running and show logs
echo -e "\n${BLUE}📋 Live Logs (Ctrl+C to exit):${NC}"
echo "=================================="

# Function to show logs
show_logs() {
    while true; do
        if [ -f "$PROJECT_ROOT/adlaan-agent/agent.log" ]; then
            echo -e "\n${BLUE}[AGENT]${NC}"
            tail -3 "$PROJECT_ROOT/adlaan-agent/agent.log" 2>/dev/null | head -3
        fi
        
        if [ -f "$PROJECT_ROOT/adlaan-web/web.log" ]; then
            echo -e "\n${BLUE}[WEB]${NC}"  
            tail -3 "$PROJECT_ROOT/adlaan-web/web.log" 2>/dev/null | head -3
        fi
        
        sleep 5
    done
}

# Start log monitoring in background
show_logs &
LOG_PID=$!

# Wait for user interrupt
trap "echo -e '\n${YELLOW}🛑 Stopping services...${NC}'; kill $LOG_PID 2>/dev/null; pkill -f 'python.*manage.py.*runserver' 2>/dev/null; pkill -f 'python.*main.py' 2>/dev/null; exit 0" SIGINT

wait