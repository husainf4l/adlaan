#!/usr/bin/env python3
"""
Direct agent test script to verify all agents work independently.
"""
import sys
import os
import asyncio
import json
from typing import Dict, Any

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from agents import get_agent, AVAILABLE_AGENTS

async def test_legal_document_generator():
    """Test Legal Document Generator agent directly."""
    print("📄 Testing Legal Document Generator...")
    try:
        agent = get_agent("legal_document_generator")
        
        # Initialize the agent first
        await agent.initialize()
        
        input_data = {
            "document_type": "employment_contract",
            "title": "Test Employment Agreement",
            "parameters": {
                "employee_name": "John Doe",
                "position": "Software Developer",
                "salary": 75000,
                "start_date": "2025-01-01",
                "department": "Engineering"
            }
        }
        
        result = await agent.process(input_data)
        
        if result and "output" in result:
            print("✅ Legal Document Generator working!")
            print(f"   Generated document type: {result.get('output', {}).get('document_type', 'Unknown')}")
            return True
        else:
            print("❌ Legal Document Generator failed - no output")
            return False
            
    except Exception as e:
        print(f"❌ Legal Document Generator error: {e}")
        return False

async def test_document_analyzer():
    """Test Document Analyzer agent directly."""
    print("\n🔍 Testing Document Analyzer...")
    try:
        agent = get_agent("document_analyzer")
        await agent.initialize()
        
        input_data = {
            "document_content": "This is a sample employment contract for John Doe as a Software Developer with a salary of $75,000.",
            "analysis_type": "risk_assessment"
        }
        
        result = await agent.process(input_data)
        
        if result and "output" in result:
            print("✅ Document Analyzer working!")
            print(f"   Analysis result: {result.get('output', {}).get('analysis_type', 'Unknown')}")
            return True
        else:
            print("❌ Document Analyzer failed - no output")
            return False
            
    except Exception as e:
        print(f"❌ Document Analyzer error: {e}")
        return False

async def test_document_classifier():
    """Test Document Classifier agent directly."""
    print("\n📂 Testing Document Classifier...")
    try:
        agent = get_agent("document_classifier")
        await agent.initialize()
        
        input_data = {
            "document_content": "This is an employment agreement between the company and John Doe.",
            "classification_type": "document_type"
        }
        
        result = await agent.process(input_data)
        
        if result and "output" in result:
            print("✅ Document Classifier working!")
            print(f"   Classification: {result.get('output', {}).get('classification', 'Unknown')}")
            return True
        else:
            print("❌ Document Classifier failed - no output")
            return False
            
    except Exception as e:
        print(f"❌ Document Classifier error: {e}")
        return False

async def test_legal_research_agent():
    """Test Legal Research Agent directly."""
    print("\n🔬 Testing Legal Research Agent...")
    try:
        agent = get_agent("legal_research")
        await agent.initialize()
        
        input_data = {
            "query": "Employment law requirements in California",
            "jurisdiction": "california",
            "research_type": "legal_requirements"
        }
        
        result = await agent.process(input_data)
        
        if result and "output" in result:
            print("✅ Legal Research Agent working!")
            print(f"   Research type: {result.get('output', {}).get('research_type', 'Unknown')}")
            return True
        else:
            print("❌ Legal Research Agent failed - no output")
            return False
            
    except Exception as e:
        print(f"❌ Legal Research Agent error: {e}")
        return False

async def test_contract_reviewer():
    """Test Contract Reviewer agent directly."""
    print("\n⚖️  Testing Contract Reviewer...")
    try:
        agent = get_agent("contract_reviewer")
        await agent.initialize()
        
        input_data = {
            "contract_content": "Employment Agreement: This agreement is between Company XYZ and John Doe for the position of Software Developer.",
            "review_type": "comprehensive",
            "focus_areas": ["liability", "termination", "compensation"]
        }
        
        result = await agent.process(input_data)
        
        if result and "output" in result:
            print("✅ Contract Reviewer working!")
            print(f"   Review type: {result.get('output', {}).get('review_type', 'Unknown')}")
            return True
        else:
            print("❌ Contract Reviewer failed - no output")
            return False
            
    except Exception as e:
        print(f"❌ Contract Reviewer error: {e}")
        return False

async def main():
    """Run all direct agent tests."""
    print("=" * 60)
    print("🧪 DIRECT AGENT TESTING (NO BACKEND REQUIRED)")
    print("=" * 60)
    
    print(f"\n🤖 Available Agents: {list(AVAILABLE_AGENTS.keys())}")
    
    tests = [
        test_legal_document_generator,
        test_document_analyzer,
        test_document_classifier,
        test_legal_research_agent,
        test_contract_reviewer
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if await test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"🎯 DIRECT TEST RESULTS: {passed}/{total} agents working")
    print("=" * 60)
    
    if passed == total:
        print("🎉 ALL AGENTS WORKING PERFECTLY!")
        print("💡 The agents are ready for production use!")
    else:
        print("⚠️  Some agents failed. Check the output above.")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test runner failed: {e}")
        sys.exit(1)