"""
Tools module initialization.

All tools are now located in agent-specific directories:
- src/agents/legal_document_generator/tools/
- src/agents/document_analyzer/tools/
- src/agents/document_classifier/tools/
- src/agents/legal_research_agent/tools/
- src/agents/contract_reviewer/tools/

Import tools directly from individual agent modules.
"""

# No centralized tools - all are agent-specific now
__all__ = []