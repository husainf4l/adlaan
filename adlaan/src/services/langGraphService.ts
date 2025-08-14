import { ChatMessage } from "../types/contracts";

// API service for LangGraph integration
export class LangGraphService {
  private baseUrl = "http://localhost:8000/api/agent";

  /**
   * Stream chat response from LangGraph
   */
  async streamChatResponse(
    message: string,
    contractText: string,
    contractId: string,
    callbacks: {
      onMessageStart: (message: ChatMessage) => void;
      onMessageChunk: (message: ChatMessage) => void;
      onMessageComplete: (message: ChatMessage) => void;
      onError: (error: Error) => void;
      signal: AbortSignal;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/contract/streem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          contract_text: contractText,
          contract_id: contractId,
        }),
        signal: callbacks.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let messageStarted = false;
      let currentMessage: ChatMessage | null = null;
      let messageContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          if (callbacks.signal.aborted) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse server-sent events format
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                await this.handleStreamChunk(data, {
                  messageStarted,
                  currentMessage,
                  messageContent,
                  callbacks,
                  onMessageUpdate: (updated) => {
                    messageStarted = updated.messageStarted;
                    currentMessage = updated.currentMessage;
                    messageContent = updated.messageContent;
                  }
                });
              } catch (parseError) {
                console.warn("Failed to parse stream chunk:", parseError);
              }
            }
          }
        }

        // Handle final message if streaming completed
        if (currentMessage && messageStarted) {
          const message = currentMessage as ChatMessage;
          const finalMessage: ChatMessage = {
            id: message.id,
            type: message.type,
            content: messageContent,
            timestamp: message.timestamp,
            intent: message.intent,
            action: message.action,
            metadata: message.metadata,
            ui_elements: message.ui_elements,
            streaming: {
              is_streaming: false,
              stream_status: "complete"
            }
          };
          callbacks.onMessageComplete(finalMessage);
        }

      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      if (error instanceof Error) {
        callbacks.onError(error);
      } else {
        callbacks.onError(new Error("Unknown streaming error"));
      }
    }
  }

  /**
   * Handle individual stream chunks from LangGraph
   */
  private async handleStreamChunk(
    data: any,
    context: {
      messageStarted: boolean;
      currentMessage: ChatMessage | null;
      messageContent: string;
      callbacks: any;
      onMessageUpdate: (updated: {
        messageStarted: boolean;
        currentMessage: ChatMessage | null;
        messageContent: string;
      }) => void;
    }
  ): Promise<void> {
    const { callbacks, onMessageUpdate } = context;
    let { messageStarted, currentMessage, messageContent } = context;

    if (data.type === "stream_chunk") {
      // Handle different processing statuses
      if (data.processing_status === "error") {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          type: "error",
          content: data.content || "حدث خطأ أثناء تحليل العقد",
          timestamp: new Date().toISOString(),
          metadata: {
            confidence_score: 0,
          }
        };
        callbacks.onError(new Error(errorMessage.content));
        return;
      }

      // Start new message if not started
      if (!messageStarted) {
        currentMessage = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "",
          timestamp: new Date().toISOString(),
          intent: this.classifyIntent(data.content),
          action: this.determineAction(data.node),
          streaming: {
            is_streaming: true,
            chunk_index: data.chunk_id || 1,
            stream_status: "streaming"
          },
          metadata: {
            confidence_score: 0.8,
          }
        };
        
        messageStarted = true;
        callbacks.onMessageStart(currentMessage);
      }

      // Accumulate content
      if (data.content) {
        // For LangGraph, we build the complete message by accumulating all chunks
        if (data.is_final) {
          messageContent += (messageContent ? "\n" : "") + data.content;
        } else {
          // For streaming chunks, just update with the current content
          messageContent = data.content;
        }
        
        if (currentMessage) {
          const updatedMessage: ChatMessage = {
            id: currentMessage.id,
            type: currentMessage.type,
            timestamp: currentMessage.timestamp,
            content: messageContent,
            intent: currentMessage.intent,
            action: currentMessage.action,
            streaming: {
              is_streaming: true,
              chunk_index: data.chunk_id || 1,
              stream_status: data.is_final ? "complete" : "streaming"
            },
            // Add enhanced metadata based on LangGraph node
            metadata: {
              ...currentMessage.metadata,
              contract_sections: this.extractContractSections(data.content),
              confidence_score: this.calculateConfidence(data.node, data.processing_status),
              ...(data.is_final ? this.generateSuggestions(data.content) : {})
            },
            // Add UI elements for final messages
            ...(data.is_final ? {
              ui_elements: {
                quick_actions: this.generateQuickActions(data.content, data.node)
              }
            } : {})
          };

          callbacks.onMessageChunk(updatedMessage);
          currentMessage = updatedMessage;
        }
      }
    } else if (data.type === "stream_complete") {
      // Stream completed
      if (currentMessage && messageStarted) {
        const message = currentMessage as ChatMessage;
        const finalMessage: ChatMessage = {
          id: message.id,
          type: message.type,
          content: messageContent,
          timestamp: message.timestamp,
          intent: message.intent,
          action: message.action,
          metadata: message.metadata,
          ui_elements: message.ui_elements,
          streaming: {
            is_streaming: false,
            stream_status: "complete"
          }
        };
        callbacks.onMessageComplete(finalMessage);
      }
    }

    onMessageUpdate({ messageStarted, currentMessage, messageContent });
  }

  /**
   * Classify message intent based on content
   */
  private classifyIntent(content: string): ChatMessage['intent'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('edit') || lowerContent.includes('تعديل') || lowerContent.includes('change')) {
      return "contract_edit";
    } else if (lowerContent.includes('review') || lowerContent.includes('مراجعة') || lowerContent.includes('analysis')) {
      return "contract_review";
    } else if (lowerContent.includes('legal') || lowerContent.includes('قانوني') || lowerContent.includes('law')) {
      return "legal_question";
    } else if (lowerContent.includes('clause') || lowerContent.includes('بند') || lowerContent.includes('suggest')) {
      return "clause_suggestion";
    } else if (lowerContent.includes('compliance') || lowerContent.includes('امتثال') || lowerContent.includes('check')) {
      return "compliance_check";
    } else if (lowerContent.includes('analysis') || lowerContent.includes('تحليل') || lowerContent.includes('analyze')) {
      return "contract_analysis";
    }
    
    return "general_chat";
  }

  /**
   * Determine action based on LangGraph node
   */
  private determineAction(node: string): ChatMessage['action'] {
    switch (node) {
      case "stream_analysis":
        return "analysis";
      case "stream_response":
        return "suggestion";
      case "stream_router":
        return "clarification";
      default:
        return "suggestion";
    }
  }

  /**
   * Extract contract sections mentioned in the content
   */
  private extractContractSections(content: string): string[] {
    const sections: string[] = [];
    const sectionPatterns = [
      /البند\s+[الأول|الثاني|الثالث|الرابع|الخامس]/g,
      /شروط\s+[الدفع|التنفيذ|الإلغاء]/g,
      /clause\s+\d+/gi,
      /section\s+\d+/gi
    ];

    sectionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        sections.push(...matches);
      }
    });

    return [...new Set(sections)]; // Remove duplicates
  }

  /**
   * Calculate confidence based on node and status
   */
  private calculateConfidence(node: string, status: string): number {
    if (status === "error") return 0;
    
    switch (node) {
      case "stream_analysis":
        return 0.9;
      case "stream_response":
        return 0.85;
      case "stream_router":
        return 0.7;
      default:
        return 0.8;
    }
  }

  /**
   * Generate suggestions based on content analysis
   */
  private generateSuggestions(content: string): { suggestions: any[] } {
    const suggestions = [];
    
    if (content.includes('تحسين') || content.includes('improve')) {
      suggestions.push({
        type: "edit",
        target_section: "البند الأول",
        proposed_text: "نص محسن مقترح",
        reason: "تحسين الوضوح والدقة"
      });
    }

    if (content.includes('مراجعة') || content.includes('review')) {
      suggestions.push({
        type: "add",
        target_section: "شروط إضافية",
        proposed_text: "إضافة بند حماية قانونية",
        reason: "تعزيز الحماية القانونية"
      });
    }

    return { suggestions };
  }

  /**
   * Generate quick actions based on content and node
   */
  private generateQuickActions(content: string, node: string): any[] {
    const actions = [];

    if (node === "stream_analysis") {
      actions.push(
        { label: "تطبيق التحليل", action_type: "apply_analysis", style: "primary" },
        { label: "مراجعة تفصيلية", action_type: "detailed_review", style: "secondary" }
      );
    }

    if (content.includes('تعديل') || content.includes('edit')) {
      actions.push(
        { label: "تطبيق التعديلات", action_type: "apply_edits", style: "primary" },
        { label: "معاينة التغييرات", action_type: "preview_changes", style: "secondary" }
      );
    }

    actions.push(
      { label: "سؤال آخر", action_type: "ask_question", style: "success" }
    );

    return actions;
  }

  /**
   * Test server connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contract/streem`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const langGraphService = new LangGraphService();
