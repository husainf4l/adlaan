"""
Simple test to verify LLM streaming works at the token level.
"""
import asyncio
import time
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()


async def test_llm_streaming():
    """Test that OpenAI LLM streams tokens properly"""
    print("=" * 80)
    print("🧪 Testing LLM Token-Level Streaming")
    print("=" * 80 + "\n")
    
    # Initialize LLM with streaming enabled
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7,
        streaming=True
    )
    
    message = "Count from 1 to 10 slowly, one number per line."
    print(f"📤 Sending: '{message}'\n")
    print("📥 Streaming response:\n")
    
    start_time = time.time()
    chunk_count = 0
    accumulated = ""
    
    # Stream the response
    async for chunk in llm.astream([("user", message)]):
        chunk_count += 1
        elapsed = time.time() - start_time
        
        if hasattr(chunk, 'content') and chunk.content:
            content = chunk.content
            accumulated += content
            
            # Print each chunk with timestamp
            print(f"[{elapsed:6.3f}s] Chunk #{chunk_count}: '{content}'")
    
    total_time = time.time() - start_time
    
    print("\n" + "=" * 80)
    print(f"✓ Total chunks: {chunk_count}")
    print(f"✓ Total time: {total_time:.3f}s")
    print(f"✓ Full response:\n{accumulated}")
    print("=" * 80)
    
    if chunk_count > 10:
        print("\n✅ SUCCESS: LLM is streaming token-by-token!")
        return True
    else:
        print(f"\n❌ FAIL: Only {chunk_count} chunks (expected >10)")
        return False


if __name__ == "__main__":
    result = asyncio.run(test_llm_streaming())
    exit(0 if result else 1)
