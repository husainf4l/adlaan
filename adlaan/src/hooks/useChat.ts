import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "../types/contracts";
import { generateAIResponse } from "../lib/contractUtils";

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll chat to bottom with improved performance
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

    // Use requestAnimationFrame for smoother scrolling
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

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isGenerating) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage("");

    // Focus back to input
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }

    // Simulate AI processing with abort support
    setIsGenerating(true);
    
    try {
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, 1500);
        
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Aborted'));
        });
      });

      // Check if still mounted and not aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const aiResponse = generateAIResponse(currentMessage);
        setChatMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      // Handle abort or other errors silently
      if (error instanceof Error && error.message !== 'Aborted') {
        console.error('Chat error:', error);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [newMessage, isGenerating]);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: `ai-welcome-${Date.now()}`,
      type: "ai",
      content:
        "مرحباً! تم إنشاء العقد بنجاح. يمكنك الآن مراجعته وطلب أي تعديلات تريدها. أنا هنا لمساعدتك في تحسين العقد وإضافة أي بنود إضافية.",
      timestamp: new Date().toISOString(),
      action: "suggestion",
    };

    setChatMessages([welcomeMessage]);
  }, []);

  return {
    chatMessages,
    newMessage,
    setNewMessage,
    isGenerating,
    chatEndRef,
    messageInputRef,
    handleSendMessage,
    addWelcomeMessage,
  };
};
