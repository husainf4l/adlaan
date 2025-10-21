# Agent Tools and Nodes Organization

## Overview
Each agent now has its own dedicated subdirectory in both `tools/` and `nodes/` directories, containing only the tools and nodes that are relevant to their specific functionality.

## Agent-Specific Organization

### 1. Legal Document Generator Agent
**Location**: `src/agents/agents/legal_document_generator.py`

**Tools** (`src/agents/tools/legal_document_generator/`):
- `FormattingTool`: For document formatting and structure
- `LegalResearchTool`: For legal research during document creation
- `DocumentValidationTool`: For validating generated documents

**Nodes** (`src/agents/nodes/legal_document_generator/`):
- `ThinkingNode`: For complex reasoning about document requirements
- `PlanningNode`: For planning document structure and content
- `DocumentGeneratorNode`: For the actual document generation workflow

**Workflow**: Requirements Analysis → Legal Research → Draft Generation → Review & Refinement → Finalization

---

### 2. Document Analyzer Agent
**Location**: `src/agents/agents/document_analyzer.py`

**Tools** (`src/agents/tools/document_analyzer/`):
- `DocumentValidationTool`: For parsing and validating document structure
- `RiskAssessmentTool`: For identifying potential legal risks
- `ComplianceTool`: For checking regulatory compliance

**Nodes** (`src/agents/nodes/document_analyzer/`):
- `ThinkingNode`: For complex analysis reasoning
- `PlanningNode`: For structuring analysis approach

**Workflow**: Document Parsing → Structure Analysis → Risk Identification → Compliance Assessment → Report Generation

---

### 3. Document Classifier Agent
**Location**: `src/agents/agents/document_classifier.py`

**Tools** (`src/agents/tools/document_classifier/`):
- `DocumentValidationTool`: For document parsing and validation
- `ComplianceTool`: For determining document compliance categories

**Nodes** (`src/agents/nodes/document_classifier/`):
- `ThinkingNode`: For classification reasoning

**Workflow**: Document Analysis → Content Extraction → Pattern Recognition → Category Assignment → Confidence Scoring

---

### 4. Legal Research Agent
**Location**: `src/agents/agents/legal_research_agent.py`

**Tools** (`src/agents/tools/legal_research_agent/`):
- `LegalResearchTool`: For conducting legal research and finding precedents
- `ComplianceTool`: For compliance analysis during research

**Nodes** (`src/agents/nodes/legal_research_agent/`):
- `ThinkingNode`: For research strategy and reasoning
- `PlanningNode`: For planning research approach
- `LegalResearchNode`: For the actual research workflow

**Workflow**: Query Analysis → Precedent Search → Citation Finding → Compliance Assessment → Research Compilation

---

### 5. Contract Reviewer Agent
**Location**: `src/agents/agents/contract_reviewer.py`

**Tools** (`src/agents/tools/contract_reviewer/`):
- `DocumentValidationTool`: For contract parsing and validation
- `RiskAssessmentTool`: For identifying contract risks
- `ComplianceTool`: For compliance checking
- `RemediationTool`: For suggesting contract improvements

**Nodes** (`src/agents/nodes/contract_reviewer/`):
- `ThinkingNode`: For contract analysis reasoning
- `PlanningNode`: For structuring review approach

**Workflow**: Contract Parsing → Clause Analysis → Risk Assessment → Compliance Check → Recommendation Generation

## Directory Structure

```
src/agents/
├── tools/
│   ├── legal_document_generator/
│   │   └── __init__.py (FormattingTool, LegalResearchTool, DocumentValidationTool)
│   ├── document_analyzer/
│   │   └── __init__.py (DocumentValidationTool, RiskAssessmentTool, ComplianceTool)
│   ├── document_classifier/
│   │   └── __init__.py (DocumentValidationTool, ComplianceTool)
│   ├── legal_research_agent/
│   │   └── __init__.py (LegalResearchTool, ComplianceTool)
│   ├── contract_reviewer/
│   │   └── __init__.py (DocumentValidationTool, RiskAssessmentTool, ComplianceTool, RemediationTool)
│   ├── compliance.py
│   ├── document_validation.py
│   ├── formatting.py
│   ├── legal_research.py
│   ├── remediation.py
│   └── risk_assessment.py
└── nodes/
    ├── legal_document_generator/
    │   └── __init__.py (ThinkingNode, PlanningNode, DocumentGeneratorNode)
    ├── document_analyzer/
    │   └── __init__.py (ThinkingNode, PlanningNode)
    ├── document_classifier/
    │   └── __init__.py (ThinkingNode)
    ├── legal_research_agent/
    │   └── __init__.py (ThinkingNode, PlanningNode, LegalResearchNode)
    ├── contract_reviewer/
    │   └── __init__.py (ThinkingNode, PlanningNode)
    ├── thinking_node.py
    ├── planning_node.py
    ├── legal_research_node.py
    └── document_generator_node.py
```

## Benefits of This Organization

1. **Clear Separation of Concerns**: Each agent has access only to the tools and nodes it actually needs
2. **Easier Maintenance**: Changes to agent-specific tools/nodes don't affect other agents
3. **Better Performance**: Reduced import overhead and memory usage
4. **Scalability**: Easy to add new tools/nodes for specific agents
5. **Code Organization**: Logical grouping makes the codebase more navigable
6. **Testing**: Easier to write focused unit tests for agent-specific functionality

## Usage

Each agent now imports its specific tools and nodes:

```python
# Example from Legal Document Generator
from src.agents.tools.legal_document_generator import (
    FormattingTool,
    LegalResearchTool,
    DocumentValidationTool
)
from src.agents.nodes.legal_document_generator import (
    ThinkingNode,
    PlanningNode,
    DocumentGeneratorNode
)
```

This organization ensures that each agent has exactly what it needs, no more, no less.