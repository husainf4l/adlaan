"""
Test the flexible routing system with different complexity levels
"""
import asyncio
from agent.agent import Agent


async def test_greeting():
    """Test simple greeting - should use direct_response route"""
    print("=" * 60)
    print("TEST 1: Simple Greeting (should skip planning)")
    print("=" * 60)
    
    agent = Agent(use_checkpointing=False)
    message = "hello"
    
    print(f"\n📨 User: {message}\n")
    print("🤖 Agent Response:")
    
    token_count = 0
    async for token in agent.astream(message):
        print(token, end="", flush=True)
        token_count += 1
    
    print(f"\n\n✅ Greeting test complete - {token_count} tokens\n")


async def test_simple_question():
    """Test simple question - should skip planning"""
    print("=" * 60)
    print("TEST 2: Simple Question (should skip planning)")
    print("=" * 60)
    
    agent = Agent(use_checkpointing=False)
    message = "What is a contract?"
    
    print(f"\n📨 User: {message}\n")
    print("🤖 Agent Response:")
    
    token_count = 0
    async for token in agent.astream(message):
        print(token, end="", flush=True)
        token_count += 1
    
    print(f"\n\n✅ Simple question test complete - {token_count} tokens\n")


async def test_medium_task():
    """Test medium complexity - might skip planning"""
    print("=" * 60)
    print("TEST 3: Medium Task (may skip planning)")
    print("=" * 60)
    
    agent = Agent(use_checkpointing=False)
    message = "Draft a simple NDA for my company"
    
    print(f"\n📨 User: {message}\n")
    print("🤖 Agent Response:")
    
    token_count = 0
    async for token in agent.astream(message):
        print(token, end="", flush=True)
        token_count += 1
    
    print(f"\n\n✅ Medium task test complete - {token_count} tokens\n")


async def test_complex_task():
    """Test complex task - should use full planning"""
    print("=" * 60)
    print("TEST 4: Complex Task (should use full planning)")
    print("=" * 60)
    
    agent = Agent(use_checkpointing=False)
    message = "Create a comprehensive employment contract with non-compete clauses, stock options, and international jurisdiction considerations for a senior executive role"
    
    print(f"\n📨 User: {message}\n")
    print("🤖 Agent Response:")
    
    token_count = 0
    async for token in agent.astream(message):
        print(token, end="", flush=True)
        token_count += 1
    
    print(f"\n\n✅ Complex task test complete - {token_count} tokens\n")


async def main():
    """Run all tests"""
    print("\n🧪 Testing Flexible Routing System\n")
    
    await test_greeting()
    await test_simple_question()
    await test_medium_task()
    await test_complex_task()
    
    print("=" * 60)
    print("✅ ALL TESTS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
