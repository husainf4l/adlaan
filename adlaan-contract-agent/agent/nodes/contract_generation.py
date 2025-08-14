"""
Streaming nodes for real-time contract generation.

These nodes handle the interactive contract generation workflow
including information gathering, legal compliance, and contract creation.
"""

from typing import Dict, Any, AsyncIterator
from langchain_core.messages import HumanMessage, AIMessage

from ..core import ContractAgentState, get_streaming_llm, AgentConfig
from ..tools import contract_tool_registry


async def stream_router_node(state: ContractAgentState) -> ContractAgentState:
    """
    Route the contract generation workflow based on current state.

    Determines whether to gather information, generate contract,
    or request additional details from the client.

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

    # Initialize workflow state flags
    if "needs_more_info" not in state:
        state["needs_more_info"] = True
    if "ready_to_generate" not in state:
        state["ready_to_generate"] = False
    if "generation_complete" not in state:
        state["generation_complete"] = False

    # Determine workflow path
    if state.get("generation_complete"):
        state["current_step"] = "stream_final_response"
        state["processing_status"] = "complete"
    elif state.get("ready_to_generate"):
        state["current_step"] = "stream_contract_generation"
        state["processing_status"] = "generating_contract"
    elif not state.get("contract_type"):
        state["current_step"] = "stream_type_identification"
        state["processing_status"] = "identifying_contract_type"
    elif state.get("needs_more_info"):
        state["current_step"] = "stream_information_gathering"
        state["processing_status"] = "gathering_information"
    else:
        state["current_step"] = "stream_contract_generation"
        state["processing_status"] = "ready_to_generate"

    # Add routing message to stream
    state["stream_buffer"].append(f"🔄 {state['processing_status'].replace('_', ' ').title()}...")
    state["chunk_count"] += 1

    return state


async def stream_type_identification_node(state: ContractAgentState) -> ContractAgentState:
    """
    Identify contract type and jurisdiction from user request.

    Uses the user's description to determine what type of contract
    they need and which legal jurisdiction applies.

    Args:
        state: Current agent state

    Returns:
        Updated state with contract type and jurisdiction
    """
    try:
        user_query = state.get("user_query", "")
        last_message = state["messages"][-1] if state["messages"] else None
        
        if last_message and hasattr(last_message, 'content'):
            user_query = last_message.content

        state["stream_buffer"].append("🔍 Analyzing your request to identify contract type...")
        state["chunk_count"] += 1

        # Use contract identification tool
        from ..tools.contract_generation import identify_contract_type
        
        contract_info = identify_contract_type.invoke({"description": user_query})
        
        state["contract_type"] = contract_info["contract_type"]
        state["tool_outputs"]["contract_identification"] = contract_info

        # Ask for jurisdiction if not specified
        jurisdiction_keywords = {
            "jordan": ["jordan", "jordanian", "amman", "jod"],
            "ksa": ["saudi", "arabia", "riyadh", "sar", "ksa"],
            "dubai": ["dubai", "uae", "emirates", "aed"]
        }

        detected_jurisdiction = None
        user_query_lower = user_query.lower()
        
        for jurisdiction, keywords in jurisdiction_keywords.items():
            if any(keyword in user_query_lower for keyword in keywords):
                detected_jurisdiction = jurisdiction
                break

        if detected_jurisdiction:
            state["jurisdiction"] = detected_jurisdiction
            state["stream_buffer"].append(f"📍 Detected jurisdiction: {detected_jurisdiction.upper()}")
        else:
            state["stream_buffer"].append("📍 Please specify your jurisdiction: Jordan, KSA, or Dubai?")
            state["needs_more_info"] = True
            state["current_step"] = "stream_information_gathering"
            return state

        # Get legal requirements for this jurisdiction and contract type
        from ..tools.contract_generation import get_jurisdiction_requirements
        
        legal_req = get_jurisdiction_requirements.invoke({
            "jurisdiction": state["jurisdiction"],
            "contract_type": state["contract_type"]
        })
        
        state["legal_requirements"] = legal_req
        state["tool_outputs"]["legal_requirements"] = legal_req

        state["stream_buffer"].append(f"✅ Contract type identified: {contract_info['details']['name']}")
        state["stream_buffer"].append(f"⚖️ Legal requirements loaded for {state['jurisdiction'].upper()}")
        
        # Move to information gathering
        state["current_step"] = "stream_information_gathering"
        state["chunk_count"] += 2

    except Exception as e:
        state["errors"].append(f"Type identification error: {str(e)}")
        state["stream_buffer"].append(f"❌ Error identifying contract type: {str(e)}")
        state["chunk_count"] += 1

    return state


async def stream_information_gathering_node(state: ContractAgentState) -> ContractAgentState:
    """
    Gather required information from the client interactively.

    Generates questions based on missing information and collects
    client responses to build the contract.

    Args:
        state: Current agent state

    Returns:
        Updated state with collected information
    """
    try:
        # Initialize client_info if not present
        if "client_info" not in state:
            state["client_info"] = {}

        contract_type = state.get("contract_type", "general")
        jurisdiction = state.get("jurisdiction", "dubai")
        existing_info = state["client_info"]

        state["stream_buffer"].append("📝 Checking what information we need...")
        state["chunk_count"] += 1

        # Generate questions for missing information
        from ..tools.contract_generation import generate_information_questions
        
        questions = generate_information_questions.invoke({
            "contract_type": contract_type,
            "jurisdiction": jurisdiction,
            "existing_info": existing_info
        })

        if not questions:
            # All information collected, ready to generate
            state["needs_more_info"] = False
            state["ready_to_generate"] = True
            state["stream_buffer"].append("✅ All required information collected!")
            state["current_step"] = "stream_contract_generation"
        else:
            # Ask the first few questions
            state["missing_info"] = questions
            state["stream_buffer"].append("❓ I need some information to create your contract:")
            
            for i, question in enumerate(questions[:3], 1):  # Ask max 3 questions at a time
                state["stream_buffer"].append(f"{i}. {question}")
            
            if len(questions) > 3:
                state["stream_buffer"].append(f"... and {len(questions) - 3} more questions after these.")
            
            state["stream_buffer"].append("\n💡 Please provide the information for these questions.")

        state["chunk_count"] += len(questions) + 2

    except Exception as e:
        state["errors"].append(f"Information gathering error: {str(e)}")
        state["stream_buffer"].append(f"❌ Error gathering information: {str(e)}")
        state["chunk_count"] += 1

    return state


async def stream_contract_generation_node(state: ContractAgentState) -> ContractAgentState:
    """
    Generate the contract based on collected information.

    Creates contract sections progressively and streams the
    generation process to the user.

    Args:
        state: Current agent state

    Returns:
        Updated state with generated contract
    """
    try:
        contract_type = state.get("contract_type", "general")
        jurisdiction = state.get("jurisdiction", "dubai")
        client_info = state.get("client_info", {})

        # Initialize contract sections
        if "contract_sections" not in state:
            state["contract_sections"] = {}

        state["stream_buffer"].append("🏗️ Starting contract generation...")
        state["chunk_count"] += 1

        # Get contract template
        from ..tools.contract_generation import get_contract_templates
        template_result = state["tool_outputs"].get("template")
        
        if not template_result:
            from ..tools.database import get_contract_templates
            template_result = get_contract_templates.invoke({
                "jurisdiction": jurisdiction,
                "contract_type": contract_type
            })
            state["tool_outputs"]["template"] = template_result

        if template_result["status"] == "success":
            template = template_result["template"]
            required_sections = template["sections"].keys()
        else:
            required_sections = ["parties", "terms", "obligations", "payment", "governing_law"]

        # Generate each section
        from ..tools.contract_generation import generate_contract_clause
        
        generated_sections = []
        for section_name in required_sections:
            try:
                state["stream_buffer"].append(f"📄 Generating {section_name.replace('_', ' ').title()} section...")
                
                clause = generate_contract_clause.invoke({
                    "clause_type": section_name,
                    "client_info": client_info,
                    "jurisdiction": jurisdiction
                })
                
                state["contract_sections"][section_name] = clause
                generated_sections.append(section_name)
                
                # Stream a preview of the generated section
                preview = clause[:100] + "..." if len(clause) > 100 else clause
                state["stream_buffer"].append(f"✅ {section_name.title()}: {preview}")
                
            except Exception as e:
                state["stream_buffer"].append(f"⚠️ Issue with {section_name}: {str(e)}")
                state["contract_sections"][section_name] = f"[{section_name.upper()} - Error: {str(e)}]"

        # Validate completeness
        from ..tools.contract_generation import validate_contract_completeness
        
        validation = validate_contract_completeness.invoke({
            "contract_sections": state["contract_sections"],
            "jurisdiction": jurisdiction,
            "contract_type": contract_type
        })

        state["tool_outputs"]["validation"] = validation
        
        # Assemble final contract
        contract_text = f"""
{contract_type.upper()} CONTRACT
{jurisdiction.upper()} JURISDICTION

{'-' * 50}

"""
        
        for section_name, section_content in state["contract_sections"].items():
            contract_text += f"{section_name.replace('_', ' ').upper()}\n"
            contract_text += f"{section_content}\n\n"

        state["generated_contract"] = contract_text
        state["generation_complete"] = True

        state["stream_buffer"].append(f"✅ Contract generation complete!")
        state["stream_buffer"].append(f"📊 Completeness score: {validation.get('completeness_score', 0)}%")
        
        if validation.get("recommendations"):
            state["stream_buffer"].append("💡 Recommendations:")
            for rec in validation["recommendations"][:3]:
                state["stream_buffer"].append(f"  • {rec}")

        state["chunk_count"] += len(required_sections) + 3

    except Exception as e:
        state["errors"].append(f"Contract generation error: {str(e)}")
        state["stream_buffer"].append(f"❌ Error generating contract: {str(e)}")
        state["chunk_count"] += 1

    return state


async def stream_final_response_node(state: ContractAgentState) -> ContractAgentState:
    """
    Generate final streaming response with complete contract.

    Provides the final contract document and summary to the user
    with options for modifications or finalization.

    Args:
        state: Current agent state

    Returns:
        Updated state with final response
    """
    try:
        config = AgentConfig.from_env()
        llm = get_streaming_llm(config)

        contract_text = state.get("generated_contract", "")
        validation = state["tool_outputs"].get("validation", {})

        # Stream the complete contract
        state["stream_buffer"].append("📋 Here's your complete contract:")
        state["stream_buffer"].append(f"```\n{contract_text}\n```")
        
        # Add summary information
        state["stream_buffer"].append("\n📊 Contract Summary:")
        state["stream_buffer"].append(f"• Contract Type: {state.get('contract_type', 'N/A').title()}")
        state["stream_buffer"].append(f"• Jurisdiction: {state.get('jurisdiction', 'N/A').upper()}")
        state["stream_buffer"].append(f"• Sections: {len(state.get('contract_sections', {}))}")
        state["stream_buffer"].append(f"• Completeness: {validation.get('completeness_score', 0)}%")

        # Next steps
        state["stream_buffer"].append("\n🎯 Next Steps:")
        state["stream_buffer"].append("• Review the contract carefully")
        state["stream_buffer"].append("• Have it reviewed by a legal professional")
        state["stream_buffer"].append("• Make any necessary modifications")
        state["stream_buffer"].append("• Ensure all parties sign the final version")

        if validation.get("recommendations"):
            state["stream_buffer"].append("\n💡 Legal Recommendations:")
            for rec in validation["recommendations"]:
                state["stream_buffer"].append(f"• {rec}")

        state["processing_status"] = "complete"
        state["is_final"] = True
        state["chunk_count"] += 10

    except Exception as e:
        state["errors"].append(f"Final response error: {str(e)}")
        state["stream_buffer"].append(f"❌ Error generating final response: {str(e)}")
        state["chunk_count"] += 1

    return state
