"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '../../../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Terminal, 
  Activity, 
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  agent?: string;
  data?: any;
}

interface AgentMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

function DebugPageContent() {
  const searchParams = useSearchParams();
  const agentType = searchParams.get('agent') || 'legalDocGenerator';
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<AgentMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    requestCount: 0,
    errorRate: 0
  });

  useEffect(() => {
    // Initialize with some sample logs
    const initialLogs: DebugLog[] = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        message: 'Agent system initialized successfully',
        agent: 'system'
      },
      {
        id: '2',
        timestamp: new Date(),
        level: 'info',
        message: 'Document generator agent started',
        agent: 'documentGenerator'
      },
      {
        id: '3',
        timestamp: new Date(),
        level: 'debug',
        message: 'Processing legal document analysis request',
        agent: 'documentAnalyzer',
        data: { documentType: 'contract', pages: 15 }
      }
    ];
    setLogs(initialLogs);

    // Simulate real-time metrics
    updateMetrics();
    const metricsInterval = setInterval(updateMetrics, 2000);

    return () => clearInterval(metricsInterval);
  }, []);

  useEffect(() => {
    let logInterval: NodeJS.Timeout;
    
    if (isMonitoring) {
      logInterval = setInterval(() => {
        addRandomLog();
      }, 3000);
    }

    return () => {
      if (logInterval) clearInterval(logInterval);
    };
  }, [isMonitoring]);

  const updateMetrics = () => {
    setMetrics({
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      responseTime: Math.floor(Math.random() * 200) + 150,
      requestCount: Math.floor(Math.random() * 10) + 45,
      errorRate: Math.random() * 2
    });
  };

  const addRandomLog = () => {
    const levels: DebugLog['level'][] = ['info', 'debug', 'warning', 'error'];
    const agents = ['documentGenerator', 'documentAnalyzer', 'legalAssistant', 'contractReviewer'];
    const messages = [
      'Processing user request',
      'Document analysis completed',
      'API rate limit warning',
      'Memory usage spike detected',
      'Agent response generated successfully',
      'Connection timeout to external service',
      'Cache miss for document template',
      'Legal validation passed'
    ];

    const newLog: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      agent: agents[Math.floor(Math.random() * agents.length)]
    };

    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep only last 50 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
  };

  const getLevelColor = (level: DebugLog['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getLevelBadgeVariant = (level: DebugLog['level']) => {
    switch (level) {
      case 'error': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      case 'info': return 'default' as const;
      case 'debug': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const getMetricColor = (value: number, threshold: number) => {
    if (value > threshold) return 'text-red-500';
    if (value > threshold * 0.7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <DashboardLayout>
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
              <h1 className="text-2xl font-bold">Debug Console</h1>
              <p className="text-muted-foreground">
                {agentType === 'all' ? 'All Agents' : `Agent: ${agentType}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </Badge>
            <Button
              onClick={toggleMonitoring}
              variant={isMonitoring ? 'destructive' : 'default'}
              size="sm"
            >
              {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.cpuUsage, 80)}`}>
                {metrics.cpuUsage}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.memoryUsage, 85)}`}>
                {metrics.memoryUsage}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.responseTime, 500)}`}>
                {metrics.responseTime}ms
              </div>
              <p className="text-xs text-muted-foreground">avg response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.requestCount}</div>
              <p className="text-xs text-muted-foreground">last minute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.errorRate, 5)}`}>
                {metrics.errorRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">error rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>Debug Logs</span>
                <Badge variant="outline">{logs.length} entries</Badge>
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={clearLogs} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No logs available. Start monitoring to see real-time logs.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0">
                      <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground">{log.message}</p>
                        {log.agent && (
                          <Badge variant="outline" className="text-xs">
                            {log.agent}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                        {log.data && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {JSON.stringify(log.data)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function DebugPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebugPageContent />
    </Suspense>
  );
}

export default DebugPageWrapper;
