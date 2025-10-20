"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { 
  AgentType, 
  AgentStatusInfo, 
  AgentCapability, 
  AgentConfiguration as AgentConfigData,
  HealthCheckResult,
  AgentStatus,
  SystemHealth 
} from '../../lib/ai-types';
import { aiAgentService, agentRealtimeService } from '../../lib/ai-agent-service';

interface AgentConfigurationProps {
  onBack: () => void;
}

export const AgentConfiguration = ({ onBack }: AgentConfigurationProps) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusInfo[]>([]);
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfigData | null>(null);
  const [configFormData, setConfigFormData] = useState<Record<string, any>>({});
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
    connectRealtime();

    return () => {
      agentRealtimeService.disconnect();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statuses, caps, health] = await Promise.all([
        aiAgentService.getAgentStatus(),
        aiAgentService.getAgentCapabilities().catch(() => []),
        aiAgentService.getHealthCheck().catch(() => null),
      ]);

      setAgentStatuses(statuses);
      setCapabilities(caps);
      setHealthCheck(health);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to load agent data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const connectRealtime = () => {
    try {
      agentRealtimeService.connect();
      
      // Subscribe to agent status updates
      const unsubscribeStatus = agentRealtimeService.subscribe('agent_status', (data) => {
        setAgentStatuses(prev => {
          const updated = [...prev];
          const index = updated.findIndex(agent => agent.agentType === data.agentType);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...data };
          }
          return updated;
        });
      });

      // Subscribe to system health updates
      const unsubscribeHealth = agentRealtimeService.subscribe('system_health', (data) => {
        setHealthCheck(data);
        setRealtimeConnected(true);
      });

      setRealtimeConnected(true);
    } catch (error) {
      console.error('Failed to connect realtime service:', error);
      setRealtimeConnected(false);
    }
  };

  const testConnectivity = async () => {
    setLoading(true);
    try {
      const health = await aiAgentService.getHealthCheck();
      setHealthCheck(health);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connectivity test failed:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentControl = async (agentType: AgentType, action: 'start' | 'stop' | 'restart') => {
    try {
      let result;
      switch (action) {
        case 'start':
          result = await aiAgentService.startAgent(agentType);
          break;
        case 'stop':
          result = await aiAgentService.stopAgent(agentType);
          break;
        case 'restart':
          result = await aiAgentService.restartAgent(agentType);
          break;
      }

      if (result.success) {
        // Refresh agent statuses
        const statuses = await aiAgentService.getAgentStatus();
        setAgentStatuses(statuses);
      }
    } catch (error) {
      console.error(`Failed to ${action} agent:`, error);
    }
  };

  const loadAgentConfiguration = async (agentType: AgentType) => {
    try {
      const config = await aiAgentService.getAgentConfiguration(agentType);
      setAgentConfig(config);
      setConfigFormData(config.configuration || {});
      setSelectedAgent(agentType);
    } catch (error) {
      console.error('Failed to load agent configuration:', error);
    }
  };

  const saveAgentConfiguration = async () => {
    if (!selectedAgent) return;

    try {
      const result = await aiAgentService.updateAgentConfiguration(selectedAgent, configFormData);
      if (result.success) {
        // Refresh configuration
        await loadAgentConfiguration(selectedAgent);
      }
    } catch (error) {
      console.error('Failed to save agent configuration:', error);
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.ONLINE: return 'bg-green-500';
      case AgentStatus.BUSY: return 'bg-yellow-500';
      case AgentStatus.OFFLINE: return 'bg-gray-500';
      case AgentStatus.ERROR: return 'bg-red-500';
      case AgentStatus.STARTING: return 'bg-blue-500 animate-pulse';
      case AgentStatus.STOPPING: return 'bg-orange-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const getSystemHealthColor = (health: SystemHealth) => {
    switch (health) {
      case SystemHealth.HEALTHY: return 'text-green-500';
      case SystemHealth.DEGRADED: return 'text-yellow-500';
      case SystemHealth.DOWN: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (selectedAgent && agentConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setSelectedAgent(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold">Configure {selectedAgent} Agent</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
            <CardDescription>
              Configure settings for the {selectedAgent} agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(configFormData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <Input
                  value={String(value)}
                  onChange={(e) => setConfigFormData(prev => ({
                    ...prev,
                    [key]: e.target.value
                  }))}
                  placeholder={`Enter ${key}`}
                />
              </div>
            ))}
            
            <div className="flex space-x-2">
              <Button onClick={saveAgentConfiguration}>
                Save Configuration
              </Button>
              <Button variant="outline" onClick={() => loadAgentConfiguration(selectedAgent)}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Agent Configuration & Monitoring</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {realtimeConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {realtimeConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
            </span>
          </div>
          
          <Button variant="outline" onClick={testConnectivity} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {healthCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health</span>
              <Badge 
                variant={healthCheck.systemHealth === SystemHealth.HEALTHY ? "default" : "destructive"}
                className={getSystemHealthColor(healthCheck.systemHealth)}
              >
                {healthCheck.systemHealth}
              </Badge>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(healthCheck.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : connectionStatus === 'disconnected' ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
            <span>Backend Connection</span>
          </CardTitle>
          <CardDescription>
            Status: {connectionStatus === 'connected' ? 'Connected to Adlaan agents' : 
                     connectionStatus === 'disconnected' ? 'Disconnected from backend' : 
                     'Connection status unknown'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentStatuses.map((agent) => (
          <Card key={agent.agentType} className="relative">
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
            
            <CardHeader>
              <CardTitle className="text-lg">
                {agent.agentType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
              <CardDescription>
                Status: {agent.status}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active Tasks:</span>
                  <Badge variant="outline">{agent.activeTasks}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{agent.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className={agent.errorCount > 0 ? 'text-red-500' : ''}>{agent.errorCount}</span>
                </div>
                {agent.uptime && (
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{Math.round(agent.uptime / 3600)}h</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-1 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAgentControl(agent.agentType, 'start')}
                  disabled={agent.status === AgentStatus.ONLINE}
                >
                  <Play className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAgentControl(agent.agentType, 'stop')}
                  disabled={agent.status === AgentStatus.OFFLINE}
                >
                  <Square className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAgentControl(agent.agentType, 'restart')}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => loadAgentConfiguration(agent.agentType)}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Capabilities */}
      {capabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Agent Capabilities</span>
            </CardTitle>
            <CardDescription>
              Available agent types and their capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability) => (
                <div key={capability.agentType} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{capability.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{capability.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {capability.capabilities.map((cap, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Formats: {capability.supportedFormats.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};