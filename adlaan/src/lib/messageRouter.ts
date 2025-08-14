import { ChatMessage, WorkflowState } from "../types/contracts";

// Message Router - intelligently handles different message types
export class MessageRouter {
  
  /**
   * Routes incoming messages to appropriate handlers based on intent and metadata
   */
  static routeMessage(message: ChatMessage): MessageRoutingResult {
    const { intent, action, metadata, ui_elements } = message;

    // Determine UI components to show/update
    const uiActions: UIAction[] = [];

    // Route based on intent
    switch (intent) {
      case "contract_edit":
        return this.handleContractEdit(message);
      
      case "contract_review":
        return this.handleContractReview(message);
      
      case "legal_question":
        return this.handleLegalQuestion(message);
      
      case "clause_suggestion":
        return this.handleClauseSuggestion(message);
      
      case "compliance_check":
        return this.handleComplianceCheck(message);
      
      case "contract_analysis":
        return this.handleContractAnalysis(message);
      
      case "general_chat":
      default:
        return this.handleGeneralChat(message);
    }
  }

  private static handleContractEdit(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show edit interface
    if (message.action === "edit") {
      actions.push({
        type: "show_edit_panel",
        target: "contract_viewer",
        data: {
          sections: message.metadata?.contract_sections || [],
          suggestions: message.metadata?.suggestions || []
        }
      });
    }

    // Highlight sections
    if (message.metadata?.contract_sections?.length) {
      actions.push({
        type: "highlight_sections",
        target: "contract_viewer",
        data: { sections: message.metadata.contract_sections }
      });
    }

    // Show diff if suggestions exist
    if (message.metadata?.suggestions?.length) {
      actions.push({
        type: "show_diff_view",
        target: "contract_viewer",
        data: { suggestions: message.metadata.suggestions }
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: true,
      workflow_status: "active"
    };
  }

  private static handleContractReview(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show analysis panel
    actions.push({
      type: "show_analysis_panel",
      target: "side_panel",
      data: {
        analysis: message.metadata,
        confidence: message.metadata?.confidence_score
      }
    });

    // Highlight issues if any
    if (message.metadata?.contract_sections?.length) {
      actions.push({
        type: "highlight_issues",
        target: "contract_viewer",
        data: { 
          sections: message.metadata.contract_sections,
          severity: "warning"
        }
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: false,
      workflow_status: "review"
    };
  }

  private static handleLegalQuestion(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show legal references if available
    if (message.metadata?.references?.length) {
      actions.push({
        type: "show_references_panel",
        target: "side_panel",
        data: { references: message.metadata.references }
      });
    }

    // Add quick action buttons
    if (message.ui_elements?.quick_actions?.length) {
      actions.push({
        type: "show_quick_actions",
        target: "chat_panel",
        data: { actions: message.ui_elements.quick_actions }
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: false,
      workflow_status: "informational"
    };
  }

  private static handleClauseSuggestion(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show suggestion overlay
    actions.push({
      type: "show_clause_suggestions",
      target: "contract_viewer",
      data: {
        suggestions: message.metadata?.suggestions || [],
        position: "inline"
      }
    });

    // Add action buttons for each suggestion
    if (message.metadata?.suggestions?.length) {
      message.metadata.suggestions.forEach((suggestion, index) => {
        actions.push({
          type: "add_suggestion_button",
          target: "contract_viewer",
          data: {
            suggestion_id: `suggestion_${index}`,
            text: "Apply Suggestion",
            action: "apply_suggestion",
            payload: suggestion
          }
        });
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: true,
      workflow_status: "suggestion"
    };
  }

  private static handleComplianceCheck(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show compliance status
    actions.push({
      type: "show_compliance_status",
      target: "header",
      data: {
        status: message.metadata?.confidence_score ? 
          (message.metadata.confidence_score > 0.8 ? "compliant" : "needs_review") : 
          "unknown",
        details: message.content
      }
    });

    // Highlight compliance issues
    if (message.metadata?.contract_sections?.length) {
      actions.push({
        type: "highlight_compliance_issues",
        target: "contract_viewer",
        data: { 
          sections: message.metadata.contract_sections,
          severity: message.metadata.confidence_score && message.metadata.confidence_score < 0.5 ? "error" : "warning"
        }
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: true,
      workflow_status: "compliance"
    };
  }

  private static handleContractAnalysis(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Show detailed analysis
    actions.push({
      type: "show_analysis_report",
      target: "modal",
      data: {
        analysis: message.content,
        entities: message.metadata?.entities || [],
        confidence: message.metadata?.confidence_score,
        sections_analyzed: message.metadata?.contract_sections || []
      }
    });

    return {
      message,
      ui_actions: actions,
      requires_user_action: false,
      workflow_status: "analysis"
    };
  }

  private static handleGeneralChat(message: ChatMessage): MessageRoutingResult {
    const actions: UIAction[] = [];

    // Add quick actions if available
    if (message.ui_elements?.quick_actions?.length) {
      actions.push({
        type: "show_quick_actions",
        target: "chat_panel",
        data: { actions: message.ui_elements.quick_actions }
      });
    }

    return {
      message,
      ui_actions: actions,
      requires_user_action: false,
      workflow_status: "chat"
    };
  }

  /**
   * Handles streaming message updates
   */
  static handleStreamingUpdate(
    message: ChatMessage, 
    previousMessage?: ChatMessage
  ): StreamingUpdateResult {
    const isComplete = message.streaming?.stream_status === "complete";
    const isError = message.streaming?.stream_status === "error";

    return {
      message,
      should_append: !previousMessage || message.streaming?.chunk_index === 0,
      should_replace: !!previousMessage && !isComplete,
      should_finalize: isComplete,
      should_show_error: isError,
      progress: message.streaming?.chunk_index && message.streaming?.total_chunks ?
        (message.streaming.chunk_index / message.streaming.total_chunks) * 100 : undefined
    };
  }
}

// Type definitions for message routing
export interface MessageRoutingResult {
  message: ChatMessage;
  ui_actions: UIAction[];
  requires_user_action: boolean;
  workflow_status: "active" | "review" | "informational" | "suggestion" | "compliance" | "analysis" | "chat";
}

export interface UIAction {
  type: string;
  target: "contract_viewer" | "chat_panel" | "side_panel" | "header" | "modal";
  data: any;
}

export interface StreamingUpdateResult {
  message: ChatMessage;
  should_append: boolean;
  should_replace: boolean;
  should_finalize: boolean;
  should_show_error: boolean;
  progress?: number;
}
