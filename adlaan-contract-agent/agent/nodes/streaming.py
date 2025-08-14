"""
Streaming nodes for real-time contract processing.

These nodes handle streaming responses and real-time processing
for contract analysis workflows.
"""

from typing import Dict, Any, AsyncIterator
from langchain_core.messages import HumanMessage, AIMessage

from ..core import ContractAgentState, get_streaming_llm, AgentConfig
from ..tools import get_all_tools


async def stream_router_node(state: ContractAgentState) -> ContractAgentState:
    """
    Route the streaming workflow based on current state and user input.

    This node determines the processing path for streaming contract analysis.

    Args:
        state: Current agent state

    Returns:
        Updated state with routing decision
    """
    # Initialize streaming buffer if not present
    if "stream_buffer" not in state:
        state["stream_buffer"] = []

    if "chunk_count" not in state:
        state["chunk_count"] = 0

    # Determine workflow path based on input
    last_message = state["messages"][-1] if state["messages"] else None
    has_contract = bool(state.get("contract_text"))

    if has_contract:
        state["current_step"] = "stream_analysis"
        state["processing_status"] = "starting_analysis"
    else:
        state["current_step"] = "stream_response"
        state["processing_status"] = "ready_for_input"

    # Add initial streaming chunk
    state["stream_buffer"].append("🔄 Starting contract analysis...")
    state["chunk_count"] += 1

    return state


async def stream_analysis_node(state: ContractAgentState) -> ContractAgentState:
    """
    Perform streaming contract analysis with real-time updates.

    This node processes contracts while providing streaming updates
    on the analysis progress.

    Args:
        state: Current agent state

    Returns:
        Updated state with analysis results
    """
    try:
        config = AgentConfig.from_env()
        llm = get_streaming_llm(config)
        tools = get_all_tools()

        contract_text = state.get("contract_text", "")

        if not contract_text:
            state["errors"].append("No contract text provided for analysis")
            state["processing_status"] = "error"
            state["stream_buffer"].append("❌ Error: No contract text provided")
            return state

        # Stream analysis updates
        analysis_steps = [
            "📄 Analyzing contract structure...",
            "🔍 Extracting metadata...",
            "⚖️ Checking compliance...",
            "📊 Generating summary...",
        ]

        # Add each step to stream buffer
        for step in analysis_steps:
            state["stream_buffer"].append(step)
            state["chunk_count"] += 1

        # Perform actual analysis using tools
        from ..tools.contract_analysis import (
            analyze_contract_structure,
            extract_contract_metadata,
            validate_contract_compliance,
        )

        # Run analysis tools
        structure_analysis = analyze_contract_structure.invoke(
            {"contract_text": contract_text}
        )
        metadata_analysis = extract_contract_metadata.invoke(
            {"contract_text": contract_text}
        )
        compliance_analysis = validate_contract_compliance.invoke(
            {"contract_text": contract_text}
        )

        # Compile results
        analysis_results = {
            "structure": structure_analysis,
            "metadata": metadata_analysis,
            "compliance": compliance_analysis,
            "summary": {
                "contract_length": len(contract_text),
                "sections_found": len(structure_analysis.get("sections", [])),
                "dates_found": len(metadata_analysis.get("dates", [])),
                "compliance_score": compliance_analysis.get("compliance_score", 0),
            },
        }

        state["analysis_results"] = analysis_results
        state["processing_status"] = "analysis_complete"
        state["current_step"] = "stream_response"

        # Add completion message
        state["stream_buffer"].append("✅ Analysis complete! Generating response...")
        state["chunk_count"] += 1

    except Exception as e:
        state["errors"].append(f"Analysis error: {str(e)}")
        state["processing_status"] = "error"
        state["stream_buffer"].append(f"❌ Analysis failed: {str(e)}")
        state["chunk_count"] += 1

    return state


async def stream_response_node(state: ContractAgentState) -> ContractAgentState:
    """
    Generate streaming response based on analysis results.

    This node creates a comprehensive streaming response for the user
    based on all analysis results and context.

    Args:
        state: Current agent state

    Returns:
        Updated state with final streaming response
    """
    try:
        config = AgentConfig.from_env()
        llm = get_streaming_llm(config)

        # Prepare response based on state
        if state["processing_status"] == "error":
            error_msg = f"I encountered errors: {', '.join(state['errors'])}"
            state["stream_buffer"].append(error_msg)

        elif state.get("analysis_results"):
            # Generate detailed response from analysis
            analysis = state["analysis_results"]
            summary = analysis.get("summary", {})

            response_parts = [
                f"📋 **Contract Analysis Complete**",
                f"",
                f"📏 **Document Stats:**",
                f"• Length: {summary.get('contract_length', 0):,} characters",
                f"• Sections: {summary.get('sections_found', 0)}",
                f"• Dates found: {summary.get('dates_found', 0)}",
                f"• Compliance score: {summary.get('compliance_score', 0)}%",
                f"",
                f"🔍 **Key Findings:**",
            ]

            # Add structure findings
            structure = analysis.get("structure", {})
            if structure.get("sections"):
                response_parts.append("• Document has clear sectional structure")
            else:
                response_parts.append("• Document may lack clear section headers")

            # Add compliance findings
            compliance = analysis.get("compliance", {})
            if compliance.get("violations"):
                response_parts.append(
                    f"• Found {len(compliance['violations'])} potential compliance issues"
                )
            else:
                response_parts.append("• No major compliance issues detected")

            response_parts.extend(
                [
                    f"",
                    f"✅ Analysis complete! The contract has been thoroughly reviewed.",
                ]
            )

            # Stream each part of the response
            for part in response_parts:
                state["stream_buffer"].append(part)
                state["chunk_count"] += 1

        else:
            # No analysis - provide general help
            help_message = [
                "👋 Hello! I'm your contract analysis assistant.",
                "",
                "I can help you:",
                "• Analyze contract structure and organization",
                "• Extract key metadata (parties, dates, amounts)",
                "• Check compliance against regulations",
                "• Search similar contracts in our database",
                "",
                "To get started, please provide a contract to analyze!",
            ]

            for line in help_message:
                state["stream_buffer"].append(line)
                state["chunk_count"] += 1

        # Create final AI message from stream buffer
        final_response = "\n".join(state["stream_buffer"])
        ai_message = AIMessage(content=final_response)
        state["messages"].append(ai_message.dict())

        state["current_step"] = "complete"
        state["processing_status"] = "complete"
        state["is_final"] = True

    except Exception as e:
        state["errors"].append(f"Response generation error: {str(e)}")
        error_message = AIMessage(
            content="I apologize, but I encountered an error generating a response."
        )
        state["messages"].append(error_message.dict())
        state["processing_status"] = "error"
        state["is_final"] = True

    return state
