"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  FileText, 
  Search, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Activity,
  Brain,
  Users,
  Zap
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

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      // Try to fetch from API, but fall back to mock data if not authenticated
      let response;
      if (user) {
        response = await fetch('/api/agents/status', {
          headers: {
            'Authorization': `Bearer demo-token`,
          },
        });
      }

      if (!user || !response || !response.ok) {
        // Use mock data for demo/testing
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
      } else {
        const data = await response.json();
        setAgents(data.agents || []);
        setSystemHealth(data.systemHealth || 'healthy');
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
      // Fall back to mock data
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
      setSystemHealth('degraded');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-muted-foreground">Loading agent status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Adlaan AI Agents</h1>
            <p className="text-muted-foreground">
              Manage and monitor your AI-powered legal assistants
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={systemHealth === 'healthy' ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${systemHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              System {systemHealth}
            </Badge>
            <Button onClick={fetchAgentStatus} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

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
                      <Link href={`/dashboard/agents/chat?agent=${agent.agentType}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                      {agent.agentType === 'docClassifier' ? (
                        <Link href={`/dashboard/agents/classifier`}>
                          <Button variant="outline" size="sm">
                            <Bot className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/agents/debug?agent=${agent.agentType}`}>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common agent operations and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/agents/drive">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  Document Drive
                </Button>
              </Link>
              <Link href="/dashboard/agents/debug">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Settings className="w-6 h-6 mb-2" />
                  Debug Console
                </Button>
              </Link>
              <Link href="/dashboard/agents/dev">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Brain className="w-6 h-6 mb-2" />
                  Development Mode
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-20 flex flex-col" onClick={fetchAgentStatus}>
                <Activity className="w-6 h-6 mb-2" />
                System Health
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
