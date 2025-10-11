#!/bin/bash

# Visual demonstration of how the agent processes a question

echo "═══════════════════════════════════════════════════════════════"
echo "  🤖 ADLAAN LEGAL AI AGENT - WORKFLOW DEMONSTRATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "User Question: 'I need a service agreement for my consulting business'"
echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""

sleep 1

echo "📥 STEP 1: Message Received"
echo "   ├─ Endpoint: POST /api/chat"
echo "   ├─ Thread ID: generated (e.g., uuid-1234)"
echo "   └─ Message: 'I need a service agreement...'"
echo ""
sleep 1

echo "🧠 STEP 2: THINKING NODE (Analysis Stage)"
echo "   ├─ Analyzing user intent..."
echo "   ├─ Task Type: DOCUMENT_CREATION ✓"
echo "   ├─ Complexity: MEDIUM"
echo "   ├─ Document Type: service_agreement"
echo "   ├─ Key Requirements:"
echo "   │  • Service agreement template"
echo "   │  • Standard business terms"
echo "   │  • Consulting-specific clauses"
echo "   └─ Decision: skip_planning ⚡ (faster route)"
echo ""
sleep 1

echo "⏭️  STEP 3: PLANNING NODE"
echo "   └─ SKIPPED (not needed for standard documents)"
echo ""
sleep 1

echo "⚡ STEP 4: EXECUTION NODE (Generation Stage)"
echo "   ├─ Received thinking analysis"
echo "   ├─ System prompt loaded:"
echo "   │  'Create service agreement automatically...'"
echo "   ├─ GPT-4 generating document..."
echo "   └─ Streaming response token-by-token..."
echo ""
sleep 2

echo "📤 STEP 5: STREAMING TO USER"
echo ""
echo "   💬 Message chunk 1:"
echo "      'I've created a comprehensive service agreement for'"
echo "      'your consulting business...'"
echo ""
sleep 1

echo "   📄 Document chunk:"
echo "      ┌─────────────────────────────────────────┐"
echo "      │   SERVICE AGREEMENT                     │"
echo "      │                                         │"
echo "      │   This Service Agreement (\"Agreement\")  │"
echo "      │   is entered into as of [Date]...      │"
echo "      │                                         │"
echo "      │   1. SERVICES                           │"
echo "      │      The Service Provider agrees to... │"
echo "      │                                         │"
echo "      │   2. COMPENSATION                       │"
echo "      │      Payment terms and schedule...     │"
echo "      │                                         │"
echo "      │   3. TERM AND TERMINATION              │"
echo "      │      This Agreement shall commence...  │"
echo "      │                                         │"
echo "      │   [... complete legal document ...]    │"
echo "      └─────────────────────────────────────────┘"
echo ""
sleep 1

echo "   💬 Message chunk 2:"
echo "      'To customize this agreement for your needs:'"
echo "      '• Add your specific service descriptions'"
echo "      '• Set your consulting rates'"
echo "      '• Adjust payment terms...'"
echo ""
sleep 1

echo "💾 STEP 6: BACKGROUND SAVE (Non-blocking)"
echo "   ├─ Saving to database asynchronously..."
echo "   ├─ User message: saved ✓"
echo "   ├─ Assistant messages: saved ✓"
echo "   └─ Conversation history: updated ✓"
echo ""
sleep 1

echo "───────────────────────────────────────────────────────────────"
echo ""
echo "✅ COMPLETE! Response Time: ~3 seconds"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 Key Features Demonstrated:"
echo ""
echo "   ✓ Intelligent intent recognition"
echo "   ✓ Automatic workflow routing (skipped planning)"
echo "   ✓ Proactive document generation (no confirmation needed)"
echo "   ✓ Real-time streaming response"
echo "   ✓ Complete, ready-to-use document"
echo "   ✓ Helpful customization guidance"
echo "   ✓ Non-blocking database operations"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Performance Metrics:"
echo "   • Stages executed: 3 out of 4 (Planning skipped)"
echo "   • Response time: ~3 seconds"
echo "   • Tokens streamed: ~500 tokens"
echo "   • User experience: Seamless and fast"
echo ""
echo "═══════════════════════════════════════════════════════════════"
