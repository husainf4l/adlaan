"""
Simple test script to verify the agent setup.

Run this to test if the environment and agent are working correctly.
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def test_environment():
    """Test if environment variables are set correctly."""
    print("🔧 Testing Environment Setup...")

    google_api_key = os.getenv("GOOGLE_API_KEY")
    if google_api_key:
        print("✅ GOOGLE_API_KEY is set")
        print(f"   Key starts with: {google_api_key[:10]}...")
    else:
        print("❌ GOOGLE_API_KEY is not set")
        return False

    return True


def test_imports():
    """Test if all required packages can be imported."""
    print("\n📦 Testing Package Imports...")

    try:
        import langgraph

        print(f"✅ LangGraph version: {langgraph.__version__}")
    except ImportError as e:
        print(f"❌ LangGraph import failed: {e}")
        return False

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        print("✅ LangChain Google GenAI imported successfully")
    except ImportError as e:
        print(f"❌ LangChain Google GenAI import failed: {e}")
        return False

    try:
        from agent import create_contract_agent, ContractAgentState

        print("✅ Agent modules imported successfully")
    except ImportError as e:
        print(f"❌ Agent import failed: {e}")
        return False

    return True


def test_agent_creation():
    """Test if the agent can be created successfully."""
    print("\n🤖 Testing Agent Creation...")

    try:
        from agent import create_contract_agent

        agent = create_contract_agent()
        print("✅ Contract agent created successfully")
        return True
    except Exception as e:
        print(f"❌ Agent creation failed: {e}")
        return False


def test_llm_connection():
    """Test if LLM connection works."""
    print("\n🔗 Testing LLM Connection...")

    try:
        from agent.llm import get_llm

        llm = get_llm()
        print("✅ LLM initialized successfully")

        # Test a simple invoke (commented out to avoid API calls during setup)
        # response = llm.invoke("Hello, this is a test.")
        # print(f"✅ LLM response: {response.content[:50]}...")

        return True
    except Exception as e:
        print(f"❌ LLM connection failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🧪 Adlaan Contract Agent - Setup Test")
    print("=" * 50)

    tests = [
        test_environment,
        test_imports,
        test_agent_creation,
        test_llm_connection,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)

    print("\n" + "=" * 50)
    print("📊 Test Summary:")

    passed = sum(results)
    total = len(results)

    if passed == total:
        print(f"🎉 All tests passed! ({passed}/{total})")
        print("\n✅ Your agent setup is ready!")
        print("\nNext steps:")
        print("1. Run: python example_usage.py")
        print("2. Start FastAPI: ./scripts/run_dev.sh")
        print("3. Test API: curl http://localhost:8000/api/agent/contract/streem")
    else:
        print(f"⚠️  {passed}/{total} tests passed")
        print("\n❌ Some issues need to be resolved before using the agent.")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
