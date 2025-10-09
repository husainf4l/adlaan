"""
Simple test to see what thinking node decides for "hello"
"""
import asyncio
from agent.agent import Agent


async def test_hello():
    """Test what happens with hello"""
    agent = Agent(use_checkpointing=False)
    
    print("🧪 Testing: 'hello'\n")
    print("=" * 60)
    
    full_response = ""
    async for token in agent.astream("hello"):
        print(token, end="", flush=True)
        full_response += str(token)
    
    print("\n" + "=" * 60)
    print(f"\n📊 Total response length: {len(full_response)} characters")
    

if __name__ == "__main__":
    asyncio.run(test_hello())
