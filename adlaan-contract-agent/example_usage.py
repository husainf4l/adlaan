"""
Example usage of the contract agent.

This script demonstrates how to use the LangGraph contract agent
for processing contracts and general conversation.
"""

import asyncio
from typing import Dict, Any

from agent import create_contract_agent, ContractAgentState


def create_initial_state(
    user_message: str, contract_text: str = None
) -> ContractAgentState:
    """
    Create initial state for the agent workflow.

    Args:
        user_message: The user's message
        contract_text: Optional contract text to analyze

    Returns:
        Initial state dictionary
    """
    return {
        "messages": [{"role": "user", "content": user_message}],
        "contract_text": contract_text,
        "contract_metadata": {},
        "current_step": "start",
        "processing_status": "pending",
        "tool_outputs": {},
        "analysis_results": {},
        "errors": [],
        "session_id": "example_session",
        "user_id": "example_user",
    }


async def run_agent_example():
    """Run example agent interactions."""

    # Create the agent
    agent = create_contract_agent()

    print("🤖 Contract Agent Example")
    print("=" * 40)

    # Example 1: General chat
    print("\n1. General Chat Example:")
    print("-" * 25)

    initial_state = create_initial_state("Hello, what can you help me with?")

    # Run the agent
    config = {"configurable": {"thread_id": "example_thread_1"}}
    final_state = await agent.ainvoke(initial_state, config=config)

    # Print the response
    last_message = final_state["messages"][-1]
    print(f"Agent: {last_message['content']}")

    # Example 2: Contract analysis request
    print("\n2. Contract Analysis Example:")
    print("-" * 30)

    contract_text = """
    This is a sample contract between Party A and Party B.
    The contract is valid from January 1, 2025 to December 31, 2025.
    Total value: $50,000.
    """

    initial_state = create_initial_state(
        "Please analyze this contract for me", contract_text=contract_text
    )

    config = {"configurable": {"thread_id": "example_thread_2"}}
    final_state = await agent.ainvoke(initial_state, config=config)

    # Print the response
    last_message = final_state["messages"][-1]
    print(f"Agent: {last_message['content']}")

    # Print analysis results if available
    if final_state.get("analysis_results"):
        print(f"\nAnalysis Results: {final_state['analysis_results']}")

    print("\n✅ Examples completed!")


def run_sync_example():
    """Run a synchronous example."""

    # Create the agent
    agent = create_contract_agent()

    print("\n🔄 Synchronous Example:")
    print("-" * 25)

    initial_state = create_initial_state("Hi there!")
    config = {"configurable": {"thread_id": "sync_thread"}}

    # Run synchronously
    final_state = agent.invoke(initial_state, config=config)

    # Print the response
    last_message = final_state["messages"][-1]
    print(f"Agent: {last_message['content']}")


if __name__ == "__main__":
    # Run async examples
    asyncio.run(run_agent_example())

    # Run sync example
    run_sync_example()
