"""
Quick test to see routing decision
"""
import asyncio
from agent.agent import Agent


async def test():
    agent = Agent(use_checkpointing=False)
    
    print("\n🧪 Testing: 'hello'\n")
    
    count = 0
    async for token in agent.astream("hello"):
        print(token, end="", flush=True)
        count += 1
        if count > 100:  # Stop after 100 tokens to see routing quickly
            break
    
    print("\n\n✅ Done")


if __name__ == "__main__":
    asyncio.run(test())
