"""
Quick test to diagnose the streaming issue
"""
import asyncio
import sys
sys.path.insert(0, '.')

from agent.agent import Agent


async def test():
    print("🧪 Testing agent streaming...")
    
    try:
        agent = Agent(use_checkpointing=False)
        print("✅ Agent loaded")
        
        message = "Hello"
        print(f"📤 Sending: {message}")
        
        token_count = 0
        async for token in agent.astream(message):
            token_count += 1
            print(f"Token #{token_count}: '{token}'")
            
            if token_count > 10:  # Stop after 10 tokens to see if it works
                print("✅ Streaming works! (stopped after 10 tokens)")
                break
        
        if token_count == 0:
            print("❌ No tokens received!")
        elif token_count <= 10:
            print(f"✅ Received {token_count} tokens")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test())
