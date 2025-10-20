"use client";

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Tag,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import { GET_TASKS_QUERY } from '../../lib/graphql';
import { TaskStatus, AgentType, Task } from '../../lib/ai-types';

interface TaskManagementProps {
  onBack: () => void;
}

export const TaskManagement = ({ onBack }: TaskManagementProps) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [agentFilter, setAgentFilter] = useState<AgentType | 'ALL'>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasksData, loading: tasksLoading, refetch } = useQuery(GET_TASKS_QUERY, {
    variables: {
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      agentType: agentFilter !== 'ALL' ? agentFilter : undefined
    },
    pollInterval: 5000, // Refresh every 5 seconds
  });

  const tasks: Task[] = tasksData?.tasks || [];

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case TaskStatus.PROCESSING:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case TaskStatus.FAILED:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentIcon = (agentType: AgentType) => {
    switch (agentType) {
      case AgentType.DOCUMENT_GENERATOR:
        return <FileText className="h-4 w-4" />;
      case AgentType.DOCUMENT_ANALYZER:
        return <Search className="h-4 w-4" />;
      case AgentType.DOCUMENT_CLASSIFIER:
        return <Tag className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getAgentName = (agentType: AgentType) => {
    switch (agentType) {
      case AgentType.DOCUMENT_GENERATOR:
        return 'Document Generator';
      case AgentType.DOCUMENT_ANALYZER:
        return 'Document Analyzer';
      case AgentType.DOCUMENT_CLASSIFIER:
        return 'Document Classifier';
      default:
        return 'Unknown Agent';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const processing = tasks.filter(t => t.status === TaskStatus.PROCESSING).length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const failed = tasks.filter(t => t.status === TaskStatus.FAILED).length;

    return { total, pending, processing, completed, failed };
  };

  const stats = getTaskStats();

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI agent tasks
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tasks</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Refresh
                </Button>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                >
                  <option value="ALL">All Statuses</option>
                  <option value={TaskStatus.PENDING}>Pending</option>
                  <option value={TaskStatus.PROCESSING}>Processing</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                  <option value={TaskStatus.FAILED}>Failed</option>
                </select>
                
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value as AgentType | 'ALL')}
                >
                  <option value="ALL">All Agents</option>
                  <option value={AgentType.DOCUMENT_GENERATOR}>Document Generator</option>
                  <option value={AgentType.DOCUMENT_ANALYZER}>Document Analyzer</option>
                  <option value={AgentType.DOCUMENT_CLASSIFIER}>Document Classifier</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks found</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <Card 
                      key={task.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTask?.id === task.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getAgentIcon(task.agentType)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-sm">
                                  {getAgentName(task.agentType)}
                                </p>
                                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Created: {formatDate(task.createdAt)}
                              </p>
                              {task.status === TaskStatus.PROCESSING && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Task Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTask ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a task to view details
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agent:</span>
                        <span>{getAgentName(selectedTask.agentType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={`text-xs ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{selectedTask.progress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatDate(selectedTask.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{formatDate(selectedTask.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {selectedTask.metadata && Object.keys(selectedTask.metadata).length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Metadata</h3>
                      <div className="text-sm space-y-1">
                        {Object.entries(selectedTask.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="text-right break-all">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {selectedTask.status === TaskStatus.FAILED && selectedTask.error && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Error</h3>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {selectedTask.error}
                      </p>
                    </div>
                  )}

                  {/* Result */}
                  {selectedTask.status === TaskStatus.COMPLETED && selectedTask.result && (
                    <div>
                      <h3 className="font-semibold mb-2">Result</h3>
                      <div className="text-sm bg-green-50 p-2 rounded max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {typeof selectedTask.result === 'string' 
                            ? selectedTask.result 
                            : JSON.stringify(selectedTask.result, null, 2)
                          }
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                    
                    {selectedTask.status === TaskStatus.FAILED && (
                      <Button variant="outline" size="sm" className="w-full">
                        Retry Task
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};