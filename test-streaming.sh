#!/bin/bash
echo "Testing enhanced streaming functionality..."

# Test 1: Check if servers are running
echo "1. Checking server status..."
curl -s http://localhost:8000/health > /dev/null && echo "✅ Django server running" || echo "❌ Django server not responding"
curl -s http://localhost:8005/health > /dev/null && echo "✅ AI agent server running" || echo "❌ AI agent server not responding"

# Test 2: Test chat interface accessibility
echo ""
echo "2. Testing chat interface..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/chat/ | grep -q "200" && echo "✅ Chat interface accessible" || echo "❌ Chat interface not accessible"

# Test 3: Test streaming endpoint
echo ""
echo "3. Testing streaming endpoint..."
timeout 5 curl -s "http://localhost:8005/chat?message=Hello&thread_id=test123" | head -5

echo ""
echo "Test completed. Check the chat interface at http://localhost:8000/chat/"