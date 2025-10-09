"""
Visualize the three-stage agent workflow in real-time
"""
import asyncio
import sys
import time
sys.path.insert(0, '.')

from agent.agent import Agent


def print_colored(text, color_code):
    """Print colored text"""
    print(f"\033[{color_code}m{text}\033[0m")


def print_stage_header(stage_num, stage_name, emoji):
    """Print a visual stage header"""
    print("\n" + "=" * 80)
    print_colored(f"{emoji} STAGE {stage_num}: {stage_name}", "96")
    print("=" * 80)


async def visualize_workflow():
    """Visualize the three-stage workflow with a real request"""
    
    print_colored("\n" + "█" * 80, "95")
    print_colored("  🤖 THREE-STAGE LEGAL AGENT VISUALIZATION", "95")
    print_colored("█" * 80 + "\n", "95")
    
    # Initialize agent
    print_colored("⚙️  Initializing agent...", "93")
    agent = Agent(use_checkpointing=False)
    print_colored("✅ Agent ready!\n", "92")
    
    # Test requests
    requests = [
        "Draft an employment contract",
        "What is a tort?",
        "Create an LLC operating agreement"
    ]
    
    print("📋 Available test requests:")
    for i, req in enumerate(requests, 1):
        print(f"   {i}. {req}")
    
    choice = input("\n👉 Choose a request (1-3) or type your own: ").strip()
    
    if choice.isdigit() and 1 <= int(choice) <= len(requests):
        message = requests[int(choice) - 1]
    else:
        message = choice or requests[0]
    
    print(f"\n📤 User Request: \"{message}\"")
    print_colored("\n⏳ Processing through three stages...\n", "93")
    
    # Track stages and timing
    stage_markers = {
        "thinking": False,
        "planning": False,
        "execution": False
    }
    
    accumulated = ""
    start_time = time.time()
    token_count = 0
    stage_start = start_time
    
    # Stream response with stage detection
    async for token in agent.astream(message):
        accumulated += token
        token_count += 1
        
        # Detect stage transitions by looking at content patterns
        if not stage_markers["thinking"] and "thinking" in accumulated.lower():
            elapsed = time.time() - stage_start
            print_stage_header(1, "THINKING STAGE", "🧠")
            print_colored(f"⏱️  Time: {elapsed:.2f}s | Tokens: {token_count}", "90")
            print("\n", end='')
            stage_markers["thinking"] = True
            stage_start = time.time()
        
        elif not stage_markers["planning"] and stage_markers["thinking"] and "plan" in accumulated.lower():
            elapsed = time.time() - stage_start
            print_stage_header(2, "PLANNING STAGE", "📋")
            print_colored(f"⏱️  Time: {elapsed:.2f}s | Tokens: {token_count}", "90")
            print("\n", end='')
            stage_markers["planning"] = True
            stage_start = time.time()
        
        elif not stage_markers["execution"] and stage_markers["planning"]:
            # Check if we're in execution (look for document markers)
            if any(marker in accumulated.lower() for marker in ["agreement", "contract", "document", "section", "whereas"]):
                elapsed = time.time() - stage_start
                print_stage_header(3, "EXECUTION STAGE", "⚖️")
                print_colored(f"⏱️  Time: {elapsed:.2f}s | Tokens: {token_count}", "90")
                print("\n", end='')
                stage_markers["execution"] = True
                stage_start = time.time()
        
        # Print the token
        print(token, end='', flush=True)
    
    # Final statistics
    total_time = time.time() - start_time
    
    print("\n\n" + "=" * 80)
    print_colored("📊 WORKFLOW STATISTICS", "96")
    print("=" * 80)
    
    print(f"\n⏱️  Total Time: {total_time:.2f}s")
    print(f"🔤 Total Tokens: {token_count}")
    print(f"📏 Total Characters: {len(accumulated)}")
    print(f"⚡ Tokens/Second: {token_count/total_time:.1f}")
    
    print(f"\n✅ Stages Completed:")
    print(f"   1. Thinking: {'✓' if stage_markers['thinking'] else '✗'}")
    print(f"   2. Planning: {'✓' if stage_markers['planning'] else '✗'}")
    print(f"   3. Execution: {'✓' if stage_markers['execution'] else '✗'}")
    
    print("\n" + "=" * 80)
    print_colored("✨ Workflow Complete!", "92")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    try:
        asyncio.run(visualize_workflow())
    except KeyboardInterrupt:
        print_colored("\n\n⚠️  Interrupted by user", "93")
        sys.exit(1)
    except Exception as e:
        print_colored(f"\n\n❌ Error: {e}", "91")
        import traceback
        traceback.print_exc()
        sys.exit(1)
