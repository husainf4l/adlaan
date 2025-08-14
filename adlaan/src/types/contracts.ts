export interface ContractData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lastModified: string;
  status: "draft" | "reviewing" | "final";
  type: "service" | "employment" | "purchase" | "rental" | "partnership";
}

// Enhanced Chat Message with LangGraph support
export interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system" | "tool" | "error";
  content: string;
  timestamp: string;
  
  // Message classification and routing
  intent?: 
    | "contract_edit"           // User wants to edit contract
    | "contract_review"         // User wants review/feedback
    | "legal_question"          // User has legal questions
    | "clause_suggestion"       // User wants clause suggestions
    | "compliance_check"        // User wants compliance verification
    | "general_chat"           // General conversation
    | "contract_analysis";     // Deep contract analysis
  
  // Action types for UI handling
  action?: 
    | "edit"                   // Show edit interface
    | "suggestion"             // Show suggestions panel
    | "clarification"          // Show clarification dialog
    | "highlight"              // Highlight contract sections
    | "diff"                   // Show contract changes
    | "analysis"               // Show analysis results
    | "workflow_start"         // Start multi-step workflow
    | "workflow_step";         // Continue workflow

  // Rich content metadata
  metadata?: {
    confidence_score?: number;          // AI confidence (0-1)
    contract_sections?: string[];       // Referenced contract sections
    entities?: Array<{                  // Extracted entities
      type: "person" | "date" | "amount" | "clause" | "legal_term";
      value: string;
      start_pos?: number;
      end_pos?: number;
    }>;
    suggestions?: Array<{               // Action suggestions
      type: "edit" | "add" | "remove" | "clarify";
      target_section?: string;
      proposed_text?: string;
      reason?: string;
    }>;
    references?: Array<{                // Legal references
      type: "law" | "precedent" | "guideline";
      title: string;
      url?: string;
      relevance_score?: number;
    }>;
  };

  // Streaming and interaction data
  streaming?: {
    is_streaming: boolean;
    chunk_index?: number;
    total_chunks?: number;
    stream_status?: "starting" | "streaming" | "complete" | "error";
  };

  // UI interaction elements
  ui_elements?: {
    quick_actions?: Array<{
      label: string;
      action_type: string;
      payload?: any;
      style?: "primary" | "secondary" | "warning" | "success";
    }>;
    interactive_sections?: Array<{
      section_id: string;
      type: "editable" | "highlightable" | "commentable";
      content: string;
    }>;
    progress_indicator?: {
      current_step: number;
      total_steps: number;
      step_description: string;
    };
  };
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface ContractDetails {
  party1?: string;
  party2?: string;
  address1?: string;
  address2?: string;
  phone1?: string;
  phone2?: string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  obligations1?: string;
  obligations2?: string;
}

// Workflow state for complex interactions
export interface WorkflowState {
  id: string;
  type: "contract_edit" | "legal_review" | "compliance_check" | "guided_creation";
  status: "active" | "paused" | "completed" | "cancelled";
  current_step: number;
  total_steps: number;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}
