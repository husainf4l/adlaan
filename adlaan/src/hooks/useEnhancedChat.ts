import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, WorkflowState, ContractData } from "../types/contracts";
import { MessageRouter, MessageRoutingResult, StreamingUpdateResult } from "../lib/messageRouter";
import { langGraphService } from "../services/langGraphService";

// Enhanced chat hook with LangGraph streaming support
export const useEnhancedChat = (contractId: string) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowState | null>(null);
  const [uiState, setUiState] = useState<Record<string, any>>({});
  const [contractContent, setContractContent] = useState<string>("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageRef = useRef<ChatMessage | null>(null);

  // Load contract content when contractId changes
  useEffect(() => {
    if (contractId) {
      const storedContracts = localStorage.getItem("contracts");
      if (storedContracts) {
        const contracts = JSON.parse(storedContracts);
        const contract = contracts.find((c: any) => c.id === contractId);
        if (contract) {
          setContractContent(contract.content);
        }
      }
    }
  }, [contractId]);

  // Auto-scroll with better performance
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "end",
          inline: "nearest"
        });
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Send message and handle streaming response
   */
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isGenerating) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage("");

    // Focus back to input
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }

    setIsGenerating(true);
    streamingMessageRef.current = null;

    try {
      // Call the real LangGraph streaming API
      // Call LangGraph streaming API
      await langGraphService.streamChatResponse(
        currentMessage,
        contractContent,
        contractId,
        {
          onMessageStart: handleStreamStart,
          onMessageChunk: handleStreamChunk,
          onMessageComplete: handleStreamComplete,
          onError: handleStreamError,
          signal: abortControllerRef.current.signal
        }
      );

    } catch (error) {
      if (error instanceof Error && error.message !== 'Aborted') {
        console.error('Chat error:', error);
        handleStreamError(error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false);
        streamingMessageRef.current = null;
      }
    }
  }, [newMessage, isGenerating, contractId, contractContent]);

  /**
   * Handle streaming message start
   */
  const handleStreamStart = useCallback((initialMessage: ChatMessage) => {
    streamingMessageRef.current = initialMessage;
    setChatMessages(prev => [...prev, initialMessage]);
  }, []);

  /**
   * Handle streaming message chunks
   */
  const handleStreamChunk = useCallback((messageChunk: ChatMessage) => {
    const streamingResult = MessageRouter.handleStreamingUpdate(
      messageChunk, 
      streamingMessageRef.current || undefined
    );

    if (streamingResult.should_replace && streamingMessageRef.current) {
      // Update the streaming message
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessageRef.current?.id ? messageChunk : msg
        )
      );
      streamingMessageRef.current = messageChunk;
    } else if (streamingResult.should_append) {
      setChatMessages(prev => [...prev, messageChunk]);
      streamingMessageRef.current = messageChunk;
    }

    // Update UI state based on message routing
    if (streamingResult.should_finalize) {
      const routingResult = MessageRouter.routeMessage(messageChunk);
      handleMessageRouting(routingResult);
    }
  }, []);

  /**
   * Handle streaming completion
   */
  const handleStreamComplete = useCallback((finalMessage: ChatMessage) => {
    if (streamingMessageRef.current) {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessageRef.current?.id ? finalMessage : msg
        )
      );
    } else {
      setChatMessages(prev => [...prev, finalMessage]);
    }

    // Route the final message for UI updates
    const routingResult = MessageRouter.routeMessage(finalMessage);
    handleMessageRouting(routingResult);

    streamingMessageRef.current = null;
  }, []);

  /**
   * Handle streaming errors
   */
  const handleStreamError = useCallback((error: Error) => {
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      type: "error",
      content: "عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.",
      timestamp: new Date().toISOString(),
      metadata: {
        confidence_score: 0,
      }
    };

    if (streamingMessageRef.current) {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessageRef.current?.id ? errorMessage : msg
        )
      );
    } else {
      setChatMessages(prev => [...prev, errorMessage]);
    }

    streamingMessageRef.current = null;
  }, []);

  /**
   * Handle message routing results and update UI
   */
  const handleMessageRouting = useCallback((routingResult: MessageRoutingResult) => {
    // Update UI state based on routing actions
    routingResult.ui_actions.forEach(action => {
      setUiState(prev => ({
        ...prev,
        [action.target]: {
          ...prev[action.target],
          [action.type]: action.data
        }
      }));
    });

    // Update workflow state if needed
    if (routingResult.workflow_status !== "chat") {
      setCurrentWorkflow(prev => prev ? {
        ...prev,
        status: routingResult.workflow_status as any,
        updated_at: new Date().toISOString()
      } : null);
    }
  }, []);

  /**
   * Execute quick actions
   */
  const executeQuickAction = useCallback(async (actionType: string, payload?: any) => {
    const actionMessage: ChatMessage = {
      id: `action-${Date.now()}`,
      type: "user",
      content: `تم تنفيذ الإجراء: ${actionType}`,
      timestamp: new Date().toISOString(),
      action: actionType as any,
      metadata: { 
        confidence_score: 1.0 
      }
    };

    setChatMessages(prev => [...prev, actionMessage]);

    // Here you would send the action to your LangGraph backend
    // await executeAction(contractId, actionType, payload);
  }, [contractId]);

  /**
   * Add welcome message with enhanced typing
   */
  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: `ai-welcome-${Date.now()}`,
      type: "ai",
      content: "مرحباً! تم إنشاء العقد بنجاح. يمكنك الآن مراجعته وطلب أي تعديلات تريدها. أنا هنا لمساعدتك في تحسين العقد وإضافة أي بنود إضافية.",
      timestamp: new Date().toISOString(),
      intent: "general_chat",
      action: "suggestion",
      metadata: {
        confidence_score: 1.0,
      },
      ui_elements: {
        quick_actions: [
          { label: "مراجعة العقد", action_type: "contract_review", style: "primary" },
          { label: "اقتراح تعديلات", action_type: "contract_edit", style: "secondary" },
          { label: "فحص الامتثال", action_type: "compliance_check", style: "warning" },
          { label: "تحليل قانوني", action_type: "legal_question", style: "success" }
        ]
      }
    };

    setChatMessages([welcomeMessage]);
  }, [contractId]);

  return {
    // State
    chatMessages,
    newMessage,
    setNewMessage,
    isGenerating,
    currentWorkflow,
    uiState,
    
    // Refs
    chatEndRef,
    messageInputRef,
    
    // Actions
    handleSendMessage,
    executeQuickAction,
    addWelcomeMessage,
    
    // Utilities
    isStreaming: !!streamingMessageRef.current,
    streamingProgress: streamingMessageRef.current?.streaming?.chunk_index && 
                     streamingMessageRef.current?.streaming?.total_chunks ?
      (streamingMessageRef.current.streaming.chunk_index / streamingMessageRef.current.streaming.total_chunks) * 100 : 0
  };
};
