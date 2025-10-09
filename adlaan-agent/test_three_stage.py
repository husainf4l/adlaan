"""
Test the three-stage agent workflow: Thinking → Planning → Execution
"""
import asyncio
import sys
sys.path.insert(0, '.')

from agent.agent import Agent


def print_stage(stage_name, color_code):
    """Print a stage header"""
    print(f"\033[{color_code}m")
    print("=" * 80)
    print(f"  {stage_name}")
    print("=" * 80)
    print("\033[0m")


async def test_three_stage_workflow():
    """Test the complete three-stage workflow"""
    print("\n" + "=" * 80)
    print("🧪 Testing Three-Stage Agent Workflow")
    print("   Stage 1: Thinking (Analyze request)")
    print("   Stage 2: Planning (Create execution plan)")
    print("   Stage 3: Execution (Generate response)")
    print("=" * 80 + "\n")
    
    # Initialize agent without checkpointing for faster testing
    agent = Agent(use_checkpointing=False)
    
    # Test message
    message = "Draft a simple non-disclosure agreement"
    print(f"📤 User Request: \"{message}\"\n")
    
    # Stream the response (will go through all three stages)
    print("📥 Agent Response (streaming through all stages):\n")
    
    accumulated = ""
    token_count = 0
    
    async for token in agent.astream(message):
        accumulated += token
        token_count += 1
        
        # Print token
        print(token, end='', flush=True)
    
    print(f"\n\n{'=' * 80}")
    print(f"✅ Streaming complete!")
    print(f"   Total tokens: {token_count}")
    print(f"   Total characters: {len(accumulated)}")
    print(f"{'=' * 80}\n")
    
    # Try to parse the final response
    try:
        import json
        parsed = json.loads(accumulated)
        print("\n📊 Parsed Response Structure:")
        print(f"   Type: {type(parsed)}")
        if isinstance(parsed, list):
            print(f"   Items: {len(parsed)}")
            for i, item in enumerate(parsed, 1):
                print(f"   Item {i}: type='{item.get('type')}', content_length={len(item.get('content', ''))}")
    except:
        print("\n⚠️  Response is not JSON (raw text response)")
    
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_three_stage_workflow())
        print("\n✅ Test completed successfully!")
        sys.exit(0)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
