"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  FileText, 
  Search, 
  Settings, 
  Pause, 
  RotateCcw,
  Activity,
  Brain,
  Users,
  Zap,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface AgentStatus {
  agentType: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastUpdate: string;
  activeTasks: number;
  completedTasks: number;
  errorCount: number;
}

export default function AgentsDemoPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  useEffect(() => {
    // Initialize with demo data
    setTimeout(() => {
      setAgents([
        {
          agentType: 'legalDocGenerator',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 2,
          completedTasks: 147,
          errorCount: 0
        },
        {
          agentType: 'docAnalyzer',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 1,
          completedTasks: 89,
          errorCount: 0
        },
        {
          agentType: 'docClassifier',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 3,
          completedTasks: 234,
          errorCount: 1
        },
        {
          agentType: 'legalResearch',
          status: 'busy',
          lastUpdate: new Date().toISOString(),
          activeTasks: 2,
          completedTasks: 156,
          errorCount: 0
        },
        {
          agentType: 'contractReviewer',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 1,
          completedTasks: 178,
          errorCount: 0
        }
      ]);
      setSystemHealth('healthy');
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'legalDocGenerator': return FileText;
      case 'docAnalyzer': return Search;
      case 'docClassifier': return Bot;
      case 'legalResearch': return Search;
      case 'contractReviewer': return FileText;
      default: return Bot;
    }
  };

  const getAgentTitle = (agentType: string) => {
    switch (agentType) {
      case 'legalDocGenerator': return 'Legal Doc Generator';
      case 'docAnalyzer': return 'Document Analyzer';
      case 'docClassifier': return 'Document Classifier';
      case 'legalResearch': return 'Legal Research';
      case 'contractReviewer': return 'Contract Reviewer';
      default: return agentType;
    }
  };

  const getAgentDescription = (agentType: string) => {
    switch (agentType) {
      case 'legalDocGenerator': return 'Generate legal documents with AI assistance';
      case 'docAnalyzer': return 'Analyze and extract insights from documents';
      case 'docClassifier': return 'Classify documents into organized folders';
      case 'legalResearch': return 'Research legal precedents and regulations';
      case 'contractReviewer': return 'Review and analyze legal contracts';
      default: return 'AI-powered legal agent';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Adlaan Agents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Adlaan AI Agents - Demo</h1>
            <p className="text-muted-foreground">
              Explore our AI-powered legal assistants (Demo Mode)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant="default"
              className="flex items-center gap-2 bg-blue-600"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              Demo Mode
            </Badge>
            <Link href="/signin">
              <Button variant="outline">
                Sign In for Full Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Demo Environment</h3>
                <p className="text-blue-700">
                  You&apos;re viewing a demonstration of the Adlaan agent system. 
                  Sign in for full functionality and real agent connections.
                </p>
              </div>
              <Link href="/signin">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter(a => a.status === 'online' || a.status === 'busy').length}</div>
              <p className="text-xs text-muted-foreground">of {agents.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.reduce((sum, agent) => sum + agent.activeTasks, 0)}</div>
              <p className="text-xs text-muted-foreground">currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.reduce((sum, agent) => sum + agent.completedTasks, 0)}</div>
              <p className="text-xs text-muted-foreground">tasks completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Load</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((agents.reduce((sum, agent) => sum + agent.activeTasks, 0) / (agents.length * 5)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">capacity utilized</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const IconComponent = getAgentIcon(agent.agentType);
            return (
              <Card key={agent.agentType} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{getAgentTitle(agent.agentType)}</CardTitle>
                        <CardDescription>{getAgentDescription(agent.agentType)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                      <Badge variant="outline">{agent.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-semibold">{agent.activeTasks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold">{agent.completedTasks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-semibold text-red-500">{agent.errorCount}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/agents-demo/chat?agent=${agent.agentType}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Demo Chat
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" disabled>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Features</CardTitle>
            <CardDescription>Explore the capabilities of Adlaan AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/agents-demo/drive">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <FolderOpen className="w-6 h-6 mb-2" />
                  Document Drive
                </Button>
              </Link>
              <Link href="/agents-demo/classifier">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Bot className="w-6 h-6 mb-2" />
                  AI Classifier
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex flex-col" disabled>
                <Settings className="w-6 h-6 mb-2" />
                Debug Console
                <Badge variant="secondary" className="text-xs mt-1">Pro</Badge>
              </Button>
              <Link href="/signin">
                <Button className="w-full h-20 flex flex-col bg-blue-600 hover:bg-blue-700">
                  <Activity className="w-6 h-6 mb-2" />
                  Full Access
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}