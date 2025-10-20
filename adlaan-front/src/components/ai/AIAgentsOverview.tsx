"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Search, 
  Tag, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp 
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_TASKS_QUERY } from '../../lib/graphql';
import { TaskStatus, AgentType } from '../../lib/ai-types';

interface AgentCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  agentType: AgentType;
  onNavigate: (route: string) => void;
}

const AgentCard = ({ 
  title, 
  description, 
  icon: Icon, 
  route, 
  agentType, 
  onNavigate 
}: AgentCardProps) => {
  const { data: tasksData } = useQuery(GET_TASKS_QUERY, {
    variables: { agentType },
    pollInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const tasks = tasksData?.tasks || [];
  const processingTasks = tasks.filter((task: any) => 
    task.status === TaskStatus.PROCESSING
  ).length;
  const recentTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.createdAt);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return taskDate > dayAgo;
  }).length;

  const getStatusColor = () => {
    if (processingTasks > 0) return 'bg-blue-500';
    if (recentTasks > 0) return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      </div>
      
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Tasks</span>
            <Badge variant={processingTasks > 0 ? "default" : "secondary"}>
              {processingTasks}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last 24h</span>
            <span className="text-sm font-medium">{recentTasks}</span>
          </div>
          
          <Button 
            className="w-full mt-4 group-hover:bg-primary/90" 
            onClick={() => onNavigate(route)}
          >
            <Play className="w-4 h-4 mr-2" />
            Launch Agent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface AIAgentsOverviewProps {
  onNavigate: (route: string) => void;
}

export const AIAgentsOverview = ({ onNavigate }: AIAgentsOverviewProps) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedToday: 0,
    successRate: 0
  });

  const { data: allTasksData } = useQuery(GET_TASKS_QUERY, {
    pollInterval: 10000, // Poll every 10 seconds
  });

  useEffect(() => {
    if (allTasksData?.tasks) {
      const tasks = allTasksData.tasks;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeTasks = tasks.filter((task: any) => 
        task.status === TaskStatus.PROCESSING
      ).length;
      
      const completedToday = tasks.filter((task: any) => {
        const taskDate = new Date(task.updatedAt);
        return taskDate >= today && task.status === TaskStatus.COMPLETED;
      }).length;
      
      const completedTasks = tasks.filter((task: any) => 
        task.status === TaskStatus.COMPLETED
      ).length;
      
      const successRate = tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

      setStats({
        totalTasks: tasks.length,
        activeTasks,
        completedToday,
        successRate
      });
    }
  }, [allTasksData]);

  const agents = [
    {
      id: 'document-generator',
      title: 'Legal Document Generator',
      description: 'Create legal documents from templates with AI assistance',
      icon: FileText,
      route: '/dashboard/ai/document-generator',
      agentType: AgentType.DOCUMENT_GENERATOR
    },
    {
      id: 'document-analyzer',
      title: 'Document Analyzer',
      description: 'Analyze uploaded documents for insights and risks',
      icon: Search,
      route: '/dashboard/ai/document-analyzer',
      agentType: AgentType.DOCUMENT_ANALYZER
    },
    {
      id: 'document-classifier',
      title: 'Document Classifier',
      description: 'Automatically categorize and organize documents',
      icon: Tag,
      route: '/dashboard/ai/document-classifier',
      agentType: AgentType.DOCUMENT_CLASSIFIER
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Legal Agents</h1>
        <p className="text-muted-foreground">
          Leverage AI-powered tools to streamline your legal practice
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            {...agent}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common workflows to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('/dashboard/ai/document-generator')}
            >
              <FileText className="h-5 w-5" />
              <span>Generate Contract</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('/dashboard/ai/document-analyzer')}
            >
              <Search className="h-5 w-5" />
              <span>Analyze Document</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => onNavigate('/dashboard/ai/tasks')}
            >
              <Clock className="h-5 w-5" />
              <span>View All Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};