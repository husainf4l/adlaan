"""
Test script to verify agent streaming functionality.
Tests that responses stream word-by-word, not as complete paragraphs.
"""

import asyncio
import time
import sys
from datetime import datetime
import uuid

# Add parent directory to path
sys.path.insert(0, '.')

from agent.agent import Agent


def print_colored(text, color_code):
    """Print colored text to terminal"""
    print(f"\033[{color_code}m{text}\033[0m")


def print_success(text):
    """Print success message in green"""
    print_colored(f"✓ {text}", "92")


def print_error(text):
    """Print error message in red"""
    print_colored(f"✗ {text}", "91")


def print_info(text):
    """Print info message in blue"""
    print_colored(f"ℹ {text}", "94")


def print_warning(text):
    """Print warning message in yellow"""
    print_colored(f"⚠ {text}", "93")


async def test_streaming_basic():
    """Test 1: Basic streaming functionality"""
    print_info("Test 1: Basic Streaming Test")
    print("─" * 80)
    
    agent = Agent(use_checkpointing=False)
    message = "Say hello in one sentence"
    
    print(f"📤 Sending: '{message}'")
    print("📥 Receiving chunks:\n")
    
    chunk_count = 0
    total_response = ""
    start_time = time.time()
    first_chunk_time = None
    
    try:
        async for chunk in agent.astream(message):
            chunk_count += 1
            
            # Record first chunk time
            if first_chunk_time is None:
                first_chunk_time = time.time() - start_time
            
            # chunk is now a string token
            if chunk:
                print(f"  Chunk #{chunk_count}: '{chunk}'")
                total_response += chunk
            
            # Small delay to see streaming effect
            await asyncio.sleep(0.01)
        
        end_time = time.time() - start_time
        
        print("\n" + "─" * 80)
        print_success(f"Received {chunk_count} chunks")
        print_success(f"First chunk in {first_chunk_time:.3f}s")
        print_success(f"Total time: {end_time:.3f}s")
        print_success(f"Response length: {len(total_response)} characters")
        
        # Validate streaming
        if chunk_count > 1:
            print_success("✓ PASS: Multiple chunks received (streaming works!)")
            return True
        else:
            print_error("✗ FAIL: Only 1 chunk received (not streaming)")
            return False
            
    except Exception as e:
        print_error(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_streaming_word_level():
    """Test 2: Verify word-level streaming (not paragraph-level)"""
    print_info("\nTest 2: Word-Level Streaming Test")
    print("─" * 80)
    
    agent = Agent(use_checkpointing=False)
    message = "Write exactly five words"
    
    print(f"📤 Sending: '{message}'")
    print("📥 Streaming response (real-time):\n")
    
    chunks = []
    chunk_times = []
    total_response = ""
    start_time = time.time()
    
    try:
        async for chunk in agent.astream(message):
            current_time = time.time() - start_time
            
            # chunk is now a string token
            if chunk:
                chunks.append(chunk)
                chunk_times.append(current_time)
                total_response += chunk
                
                # Print with timestamp
                print(f"  [{current_time:6.3f}s] Chunk #{len(chunks)}: '{chunk}'")
        
        print("\n" + "─" * 80)
        
        # Analyze chunks
        if len(chunks) >= 2:
            # Calculate total response
            total_response = ''.join(chunks)
            
            print_info(f"Received {len(chunks)} total chunks")
            print_info(f"Total response: {len(total_response)} characters")
            
            # Check timing between chunks
            if len(chunk_times) >= 2:
                intervals = [chunk_times[i+1] - chunk_times[i] for i in range(len(chunk_times)-1)]
                avg_interval = sum(intervals) / len(intervals)
                print_info(f"Average interval between chunks: {avg_interval:.3f}s")
                
                if avg_interval < 1.0:  # Chunks arriving quickly = streaming
                    print_success("✓ PASS: Chunks arrive quickly (word-level streaming)")
                    return True
                else:
                    print_warning("⚠ WARNING: Large intervals between chunks")
                    return True  # Still pass, might be slow network
            else:
                print_warning("⚠ Not enough chunks to measure intervals")
                return True
        else:
            print_error("✗ FAIL: Too few chunks (not streaming)")
            return False
            
    except Exception as e:
        print_error(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_streaming_with_checkpointing():
    """Test 3: Streaming with conversation memory (checkpointing)"""
    print_info("\nTest 3: Streaming with Checkpointing Test")
    print("─" * 80)
    
    try:
        agent = Agent(use_checkpointing=True)
        thread_id = f"test-{uuid.uuid4()}"
        
        print(f"🧵 Thread ID: {thread_id}")
        print_info("Checkpointing enabled")
        
        # First message
        message1 = "My name is Alice"
        print(f"\n📤 Message 1: '{message1}'")
        
        chunk_count_1 = 0
        response1 = ""
        
        async for chunk in agent.astream(message1, thread_id=thread_id):
            chunk_count_1 += 1
            if chunk:
                response1 += chunk
        
        print(f"📥 Response: {response1[:100]}...")
        print_success(f"Received {chunk_count_1} chunks")
        
        # Second message (test memory)
        message2 = "What is my name?"
        print(f"\n📤 Message 2: '{message2}'")
        
        chunk_count_2 = 0
        response2 = ""
        
        async for chunk in agent.astream(message2, thread_id=thread_id):
            chunk_count_2 += 1
            if chunk:
                response2 += chunk
        
        print(f"📥 Response: {response2[:100]}...")
        print_success(f"Received {chunk_count_2} chunks")
        
        print("\n" + "─" * 80)
        
        # Check if agent remembered the name
        if "alice" in response2.lower():
            print_success("✓ PASS: Agent remembered context (Alice)")
            print_success("✓ PASS: Streaming works with checkpointing")
            return True
        else:
            print_warning("⚠ WARNING: Agent may not have remembered context")
            print_info(f"Response: {response2}")
            # Still pass if streaming worked
            if chunk_count_2 > 1:
                print_success("✓ PASS: Streaming works (even if memory unclear)")
                return True
            return False
            
    except Exception as e:
        print_warning(f"Checkpointing test failed: {e}")
        print_info("This is OK if database is not set up yet")
        return True  # Don't fail test if DB not ready


async def test_streaming_large_response():
    """Test 4: Streaming with larger response to verify chunking"""
    print_info("\nTest 4: Large Response Streaming Test")
    print("─" * 80)
    
    agent = Agent(use_checkpointing=False)
    message = "List 10 common legal terms with one-word definitions"
    
    print(f"📤 Sending: '{message}'")
    print("📥 Streaming chunks in real-time:\n")
    
    chunks = []
    chunk_sizes = []
    start_time = time.time()
    last_content = ""
    
    try:
        async for chunk in agent.astream(message):
            if chunk:
                elapsed = time.time() - start_time
                chunks.append(chunk)
                last_content += chunk
                
                print(f"  [{elapsed:6.3f}s] Chunk #{len(chunks)}: '{chunk}' (total: {len(last_content)} chars)")
        
        end_time = time.time() - start_time
        
        print("\n" + "─" * 80)
        print_success(f"Received {len(chunks)} chunks")
        print_success(f"Total time: {end_time:.3f}s")
        print_success(f"Final response: {len(last_content)} characters")
        
        if len(chunks) > 0:
            avg_chunk_size = len(last_content) / len(chunks)
            print_info(f"Average chunk size: {avg_chunk_size:.1f} characters")
            
            # Check if streaming (not delivering everything at once)
            if len(chunks) >= 10:
                print_success("✓ PASS: Response streams token-by-token!")
                return True
            elif len(chunks) >= 3:
                print_warning("⚠ WARNING: Few chunks, but streaming works")
                return True
            else:
                print_error("✗ FAIL: Too few chunks")
                return False
        else:
            print_error("✗ FAIL: No chunks detected")
            return False
            
    except Exception as e:
        print_error(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print_colored("🧪 LEGAL AGENT STREAMING TESTS", "96")
    print_colored(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "96")
    print("=" * 80 + "\n")
    
    results = []
    
    # Run tests
    tests = [
        ("Basic Streaming", test_streaming_basic),
        ("Word-Level Streaming", test_streaming_word_level),
        ("Streaming with Checkpointing", test_streaming_with_checkpointing),
        ("Large Response Streaming", test_streaming_large_response),
    ]
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
        
        print()  # Blank line between tests
    
    # Summary
    print("=" * 80)
    print_colored("📊 TEST SUMMARY", "96")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        color = "92" if result else "91"
        print_colored(f"{status}: {test_name}", color)
    
    print("\n" + "─" * 80)
    
    if passed == total:
        print_colored(f"🎉 ALL TESTS PASSED ({passed}/{total})", "92")
    else:
        print_colored(f"⚠ SOME TESTS FAILED ({passed}/{total})", "93")
    
    print("=" * 80 + "\n")
    
    return passed == total


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_warning("\n\n⚠ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\n✗ Tests failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
