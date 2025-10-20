import { NextRequest, NextResponse } from 'next/server';

const ADLAAN_AGENT_BASE_URL = process.env.ADLAAN_AGENT_URL || 'http://adlaan.com/api';

interface AgentStatus {
  agentType: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastUpdate: string;
  activeTasks: number;
  completedTasks: number;
  errorCount: number;
  uptime?: number;
}

interface SystemStatus {
  agents: AgentStatus[];
  systemHealth: 'healthy' | 'degraded' | 'down';
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<SystemStatus | { error: string }>> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const url = `${ADLAAN_AGENT_BASE_URL}/ai/agents/status`;

    console.log('[Agent Status API] Fetching system status from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'X-Request-Source': 'adlaan-frontend',
      },
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data: SystemStatus = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('[Agent Status API] Error:', error);
    
    // Return mock data for development/fallback
    const fallbackStatus: SystemStatus = {
      agents: [
        {
          agentType: 'documentGenerator',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 0,
          completedTasks: 12,
          errorCount: 0,
        },
        {
          agentType: 'documentAnalyzer',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 1,
          completedTasks: 8,
          errorCount: 0,
        },
        {
          agentType: 'documentClassifier',
          status: 'online',
          lastUpdate: new Date().toISOString(),
          activeTasks: 0,
          completedTasks: 15,
          errorCount: 1,
        },
      ],
      systemHealth: 'healthy',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(fallbackStatus);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    const body = await request.json();
    const { action, agentType } = body;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const url = `${ADLAAN_AGENT_BASE_URL}/ai/agents/control`;

    console.log('[Agent Control API] Request:', { action, agentType });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'X-Request-Source': 'adlaan-frontend',
      },
      body: JSON.stringify({ action, agentType }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Control action failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Action completed successfully',
    });

  } catch (error) {
    console.error('[Agent Control API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}