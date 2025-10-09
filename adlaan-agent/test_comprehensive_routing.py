"""
Comprehensive test of the flexible routing system
"""
import asyncio
from agent.agent import Agent


async def test_case(agent, message, expected_path):
    """Test a single case and show which path it took"""
    print(f"\n{'='*70}")
    print(f"📨 INPUT: \"{message}\"")
    print(f"🎯 EXPECTED PATH: {expected_path}")
    print(f"{'='*70}\n")
    
    full_response = ""
    stage_marker = ""
    
    async for token in agent.astream(message):
        token_str = str(token)
        full_response += token_str
        print(token_str, end="", flush=True)
        
        # Try to detect which stages ran
        if "plan" in token_str.lower() and "planning" not in stage_marker:
            stage_marker += "→ PLANNING"
        
    print(f"\n\n📊 Response length: {len(full_response)} characters")
    
    # Analyze which path was taken
    if "plan" in full_response.lower()[:500]:  # Check first 500 chars
        actual_path = "THINKING → PLANNING → EXECUTION"
    elif len(full_response) < 500:
        actual_path = "THINKING → EXECUTION (direct)"
    else:
        actual_path = "THINKING → EXECUTION (skipped planning)"
    
    print(f"✅ ACTUAL PATH: {actual_path}")
    
    if expected_path.lower() in actual_path.lower():
        print("✅ PATH MATCHES EXPECTATION")
    else:
        print("⚠️  PATH DIFFERENT FROM EXPECTATION")
    
    return actual_path


async def main():
    """Run comprehensive tests"""
    agent = Agent(use_checkpointing=False)
    
    print("\n" + "="*70)
    print("🧪 COMPREHENSIVE FLEXIBLE ROUTING TEST")
    print("="*70)
    
    # Test 1: Simple greeting (should use direct_response)
    await test_case(
        agent,
        "hello",
        "THINKING → EXECUTION (direct response)"
    )
    
    # Test 2: Simple question (should skip planning)
    await test_case(
        agent,
        "What is a contract?",
        "THINKING → EXECUTION (skip planning)"
    )
    
    # Test 3: Medium task (should skip planning)
    await test_case(
        agent,
        "Draft a simple NDA",
        "THINKING → EXECUTION (skip planning)"
    )
    
    # Test 4: Complex task (should use full planning)
    await test_case(
        agent,
        "Create a comprehensive employment contract for a senior executive with non-compete clauses, stock options, severance terms, and international considerations",
        "THINKING → PLANNING → EXECUTION"
    )
    
    print("\n" + "="*70)
    print("✅ ALL TESTS COMPLETE")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
