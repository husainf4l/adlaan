"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  FileText,
  Wand2,
  Download,
  Eye,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  MessageSquare,
  User,
  Bot
} from 'lucide-react';
import {
  GET_DOCUMENT_TEMPLATES_QUERY,
  GENERATE_DOCUMENT_MUTATION,
  GET_TASK_QUERY
} from '../../lib/graphql';
import { DocumentTemplate, TemplateField, TaskStatus, DocumentTemplatesQueryResponse, TaskQueryResponse, GenerateDocumentMutationResponse, AgentType } from '../../lib/ai-types';
import { aiAgentService, agentRealtimeService } from '../../lib/ai-agent-service';
import { useAgentErrorHandling } from '../../lib/use-agent-error-handling';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentGeneratorProps {
  onBack: () => void;
}

export const DocumentGenerator = ({ onBack }: DocumentGeneratorProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI legal document assistant. Describe the type of legal document you need (e.g., "employment contract", "NDA", "service agreement") and I\'ll help you create it.',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Enhanced error handling and logging
  const {
    errorState,
    loadingState,
    setError,
    clearError,
    setLoading,
    executeWithErrorHandling,
    logger,
    isRetryable,
    getRecommendedAction
  } = useAgentErrorHandling();

  const [generateDocument, { loading: generating }] = useMutation<GenerateDocumentMutationResponse>(GENERATE_DOCUMENT_MUTATION);

  const { data: taskData } = useQuery<TaskQueryResponse>(GET_TASK_QUERY, {
    variables: { id: currentTaskId },
    skip: !currentTaskId,
    pollInterval: 2000,
  });

  const task = taskData?.task;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Real-time task updates
  useEffect(() => {
    if (!currentTaskId) return;

    const unsubscribe = agentRealtimeService.subscribe('task_update', (data) => {
      if (data.taskId === currentTaskId) {
        logger.log('info', `Task update received: ${data.status}`, 'DocumentGenerator', { taskId: currentTaskId });
      }
    });

    return unsubscribe;
  }, [currentTaskId, logger]);

  // Update generated document when task completes
  useEffect(() => {
    if (task?.status === TaskStatus.COMPLETED && task.result) {
      setGeneratedDocument(task.result.content || 'No content available');
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Document generated successfully! You can view it on the right panel.',
        timestamp: new Date()
      }]);
    }
  }, [task]);

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Generating your document...',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, thinkingMessage]);

    const result = await executeWithErrorHandling(
      async () => {
        return await aiAgentService.executeAgentTask(
          AgentType.DOCUMENT_GENERATOR,
          'generate',
          {
            prompt: currentInput,
            type: 'chat_generation'
          }
        );
      },
      {
        operationName: 'Generate Document from Chat',
        context: 'DocumentGenerator',
        onSuccess: (result) => {
          setCurrentTaskId(result.taskId);
          logger.log('info', `Document generation started with task ID: ${result.taskId}`, 'DocumentGenerator');
        },
        onError: (error) => {
          logger.log('error', `Document generation failed: ${error.message}`, 'DocumentGenerator');
          setChatMessages(prev => prev.slice(0, -1)); // Remove thinking message
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = async () => {
    clearError();
    // Retry with the last user message
    const lastUserMessage = chatMessages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      setCurrentInput(lastUserMessage.content);
      await handleSendMessage();
    }
  };

  const handleDownload = () => {
    if (!generatedDocument) return;

    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Document Generator</h1>
          <p className="text-muted-foreground">
            Chat with AI to create legal documents
          </p>
        </div>
      </div>

      {/* Error Handling */}
      {errorState.hasError && (
        <div className="p-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error Occurred</span>
          </div>
          <p className="text-red-600 text-sm mb-3">{errorState.error?.message}</p>
          <div className="flex space-x-2">
            {isRetryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={loadingState.isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Chat Interface */}
        <div className="w-1/2 flex flex-col border-r">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-1">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loadingState.isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{loadingState.operation || 'Processing...'}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the legal document you need..."
                className="flex-1"
                disabled={loadingState.isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || loadingState.isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Right Side - Document Viewer */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Generated Document</h2>
            </div>
            {generatedDocument && (
              <Button onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {generatedDocument ? (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatedDocument}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Document Generated Yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation on the left to generate your legal document
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Task Status */}
          {currentTaskId && task && (
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                {task.status === TaskStatus.PROCESSING && <Loader2 className="h-4 w-4 animate-spin" />}
                {task.status === TaskStatus.COMPLETED && <CheckCircle className="h-4 w-4 text-green-500" />}
                {task.status === TaskStatus.FAILED && <AlertCircle className="h-4 w-4 text-red-500" />}
                <span className="text-sm font-medium">
                  {task.status === TaskStatus.PROCESSING && 'Generating...'}
                  {task.status === TaskStatus.COMPLETED && 'Completed'}
                  {task.status === TaskStatus.FAILED && 'Failed'}
                </span>
              </div>

              {task.status === TaskStatus.PROCESSING && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {task.status === TaskStatus.FAILED && (
                <p className="text-sm text-red-600">
                  {task.error || 'Generation failed'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};