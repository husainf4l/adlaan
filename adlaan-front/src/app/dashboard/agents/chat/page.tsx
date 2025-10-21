"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Download, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'document' | 'analysis';
  metadata?: any;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

interface DocumentUploadInputProps {
  onSendMessage: (fileData?: { file: File; message?: string }) => void;
  isLoading: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const DocumentUploadInput = ({ onSendMessage, isLoading, selectedFile, setSelectedFile }: DocumentUploadInputProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === 'application/pdf') {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onSendMessage({ file: selectedFile });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs font-medium">Drop PDF here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Max 10MB
          </p>
        </div>
      ) : (
        <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-xs">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedFile(null)}
            className="h-6 w-6 p-0 text-xs"
          >
            ×
          </Button>
        </div>
      )}

      {/* Analyze Button */}
      <Button
        className="w-full h-8 text-sm"
        onClick={handleAnalyze}
        disabled={isLoading || !selectedFile}
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <FileText className="w-3 h-3 mr-2" />
        )}
        Analyze Document
      </Button>
    </div>
  );
};

function ChatPageContent() {
  const searchParams = useSearchParams();
  const agentType = searchParams.get('agent') || 'legalResearch';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your ${getAgentTitle(agentType)}. How can I assist you with your legal needs today?`,
      timestamp: new Date(),
      type: 'text'
    }]);

    // Initialize workflow steps
    setWorkflowSteps([
      { id: '1', name: 'Understanding Request', status: 'pending', description: 'Processing your input' },
      { id: '2', name: 'Legal Analysis', status: 'pending', description: 'Analyzing legal context' },
      { id: '3', name: 'Generating Response', status: 'pending', description: 'Preparing detailed response' },
      { id: '4', name: 'Quality Review', status: 'pending', description: 'Ensuring accuracy and compliance' }
    ]);
  }, [agentType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAgentTitle = (type: string) => {
    const titles = {
      legalDocGenerator: 'Legal Document Generator',
      docAnalyzer: 'Document Analyzer', 
      docClassifier: 'Document Classifier',
      legalResearch: 'Legal Research Assistant',
      contractReviewer: 'Contract Reviewer'
    };
    return titles[type as keyof typeof titles] || 'AI Assistant';
  };

  const updateWorkflowStep = (stepId: string, status: WorkflowStep['status']) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleSendMessage = async (fileData?: { file: File; message?: string }) => {
    const currentInput = fileData?.message || input;
    const currentFile = fileData?.file;
    
    if (agentType === 'docAnalyzer') {
      if (!currentFile || isLoading) return;
    } else {
      if (!currentInput.trim() || isLoading) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: agentType === 'docAnalyzer' ? `Analyzing document: ${currentFile?.name}` : currentInput,
      timestamp: new Date(),
      type: agentType === 'docAnalyzer' ? 'document' : 'text',
      metadata: agentType === 'docAnalyzer' ? { fileName: currentFile?.name, fileSize: currentFile?.size } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    if (agentType !== 'docAnalyzer') {
      setInput('');
    }
    if (agentType === 'docAnalyzer') {
      setSelectedFile(null);
    }
    setIsLoading(true);

    // Reset workflow
    setWorkflowSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    try {
      // Simulate workflow progression
      updateWorkflowStep('1', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateWorkflowStep('1', 'completed');
      
      updateWorkflowStep('2', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateWorkflowStep('2', 'completed');
      
      updateWorkflowStep('3', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateWorkflowStep('3', 'completed');
      
      updateWorkflowStep('4', 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateWorkflowStep('4', 'completed');

      // Send request to agent API
      let response;
      if (agentType === 'docAnalyzer' && currentFile) {
        // For document analyzer, send file data
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('action', 'analyze');
        formData.append('analysisType', 'general');
        
        response = await fetch(`/api/agents/${agentType}`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer demo-token'
          },
          body: formData
        });
      } else {
        // For other agents, send text message
        response = await fetch(`/api/agents/${agentType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token'
          },
          body: JSON.stringify({
            action: 'chat',
            payload: {
              message: currentInput,
              context: messages.slice(-5) // Send last 5 messages for context
            }
          })
        });
      }

      let assistantMessage: Message;

      if (response.ok) {
        const data = await response.json();
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data?.response || 'I understand your request and I am here to help with your legal needs.',
          timestamp: new Date(),
          type: data.data?.type || 'text',
          metadata: data.data?.metadata
        };
      } else {
        // Fallback response based on agent type
        const fallbackResponses = {
          legalDocGenerator: 'I can help you generate legal documents. What type of document do you need? For example, contracts, agreements, letters, or legal forms.',
          docAnalyzer: 'I can analyze legal documents for you. Please upload a document or describe what you need analyzed.',
          docClassifier: 'I can classify and organize your documents automatically. Upload documents and I\'ll sort them into appropriate folders.',
          legalResearch: 'I can help you research legal precedents, regulations, and case law. What legal topic would you like me to research?',
          contractReviewer: 'I can review contracts and legal agreements. Please share the contract details or upload the document for review.'
        };

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackResponses[agentType as keyof typeof fallbackResponses] || 'How can I assist you today?',
          timestamp: new Date(),
          type: 'text'
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      updateWorkflowStep('4', 'error');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getWorkflowIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{getAgentTitle(agentType)}</h1>
              <p className="text-muted-foreground">Interactive AI-powered legal assistance</p>
            </div>
          </div>
          <Badge variant="default" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Online
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Conversation</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                          {message.role === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.type === 'document' && (
                              <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto">
                                <FileText className="w-3 h-3 mr-1" />
                                <Download className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  {agentType === 'docAnalyzer' ? (
                    <DocumentUploadInput 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your legal question..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !input.trim()}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    {getWorkflowIcon(step.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agent Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Agent Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agentType === 'legalDocGenerator' && (
                  <>
                    <Badge variant="outline">Contract Generation</Badge>
                    <Badge variant="outline">Legal Forms</Badge>
                    <Badge variant="outline">Letter Templates</Badge>
                    <Badge variant="outline">Agreement Drafting</Badge>
                  </>
                )}
                {agentType === 'docAnalyzer' && (
                  <>
                    <Badge variant="outline">Document Review</Badge>
                    <Badge variant="outline">Content Analysis</Badge>
                    <Badge variant="outline">Risk Assessment</Badge>
                    <Badge variant="outline">Clause Extraction</Badge>
                  </>
                )}
                {agentType === 'docClassifier' && (
                  <>
                    <Badge variant="outline">Auto Classification</Badge>
                    <Badge variant="outline">Folder Organization</Badge>
                    <Badge variant="outline">Document Tagging</Badge>
                    <Badge variant="outline">Smart Sorting</Badge>
                  </>
                )}
                {agentType === 'legalResearch' && (
                  <>
                    <Badge variant="outline">Case Law Research</Badge>
                    <Badge variant="outline">Legal Precedents</Badge>
                    <Badge variant="outline">Regulation Analysis</Badge>
                    <Badge variant="outline">Jurisprudence</Badge>
                  </>
                )}
                {agentType === 'contractReviewer' && (
                  <>
                    <Badge variant="outline">Contract Review</Badge>
                    <Badge variant="outline">Terms Analysis</Badge>
                    <Badge variant="outline">Risk Identification</Badge>
                    <Badge variant="outline">Compliance Check</Badge>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}

export default ChatPageWrapper;
