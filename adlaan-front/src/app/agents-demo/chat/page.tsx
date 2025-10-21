"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
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

function DemoChatPageContent() {
  const searchParams = useSearchParams();
  const agentType = searchParams.get('agent') || 'legalResearch';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hello! I'm the ${getAgentTitle(agentType)} demo. This is a demonstration of how I would assist you with legal tasks. In the full version, I would be connected to real AI services and databases.`,
      timestamp: new Date(),
      type: 'text'
    }]);
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

    // Simulate processing time
    setTimeout(() => {
      let responseContent = '';
      
      if (agentType === 'docAnalyzer' && currentFile) {
        responseContent = `I would analyze the uploaded PDF document "${currentFile.name}" (${(currentFile.size / 1024 / 1024).toFixed(2)} MB). In the full version, I would:

• Extract key information and parties involved
• Identify legal clauses and obligations  
• Assess potential risks and liabilities
• Analyze compliance with relevant regulations
• Provide detailed insights and recommendations
• Generate a comprehensive analysis report

This document analysis would help you understand the legal implications and make informed decisions about the contract or agreement.`;
      } else {
        const demoResponses = {
          legalDocGenerator: `I would help you generate a legal document for: "${currentInput}". In the full version, I would create professional legal documents, contracts, and forms tailored to your specific needs with proper legal language and formatting.`,
          docAnalyzer: `I would analyze the document you mentioned: "${currentInput}". In the full version, I would extract key information, identify risks, analyze clauses, and provide detailed insights about the document's legal implications.`,
          docClassifier: `I would classify and organize documents related to: "${currentInput}". In the full version, I would automatically sort your documents into appropriate folders like Contracts, Agreements, Legal Research, etc.`,
          legalResearch: `I would research legal information about: "${currentInput}". In the full version, I would search through case law, regulations, legal precedents, and provide comprehensive legal research with citations and analysis.`,
          contractReviewer: `I would review the contract aspects of: "${currentInput}". In the full version, I would analyze contract terms, identify potential risks, suggest improvements, and ensure compliance with legal standards.`
        };
        responseContent = demoResponses[agentType as keyof typeof demoResponses] || 'This is a demo response. Sign in for full AI capabilities.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: agentType === 'docAnalyzer' && currentFile ? 'analysis' : 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/agents-demo">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Demo
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{getAgentTitle(agentType)} - Demo</h1>
              <p className="text-muted-foreground">Experience AI-powered legal assistance (Demo Mode)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Demo Mode</Badge>
            <Link href="/signin">
              <Button size="sm">Get Full Access</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Demo Conversation</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Demo Notice */}
                <div className="p-4 bg-blue-50 border-b">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">
                      This is a demo. Responses are simulated. Sign in for real AI interactions.
                    </p>
                  </div>
                </div>

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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                        placeholder="Try asking about legal documents, contracts, or research..."
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

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Demo Capabilities</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get Full Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to access real AI agents with live connections to legal databases and advanced capabilities.
                </p>
                <Link href="/signin">
                  <Button className="w-full">
                    Sign In Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DemoChatPageContent />
    </Suspense>
  );
}

export default DemoChatPageWrapper;