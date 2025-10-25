import { NextRequest, NextResponse } from 'next/server';

const ADLAAN_AGENT_BASE_URL = process.env.NEXT_PUBLIC_AGENTS_URL || 'http://adlaan.com/api';

// Agent endpoints configuration
const AGENT_ENDPOINTS = {
  legalDocGenerator: '/ai/agents/legal-doc-generator',
  docAnalyzer: '/ai/agents/doc-analyzer', 
  docClassifier: '/ai/agents/doc-classifier',
  legalResearch: '/ai/agents/legal-research',
  contractReviewer: '/ai/agents/contract-reviewer'
};

interface AgentRequest {
  action: string;
  payload: any;
  agentId?: string;
}

interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  taskId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentType: string }> }
): Promise<NextResponse<AgentResponse>> {
  try {
    const { agentType } = await params;
    const body: AgentRequest = await request.json();
    
    // Validate agent type
    if (!AGENT_ENDPOINTS[agentType as keyof typeof AGENT_ENDPOINTS]) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent type' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Prepare request to Adlaan agent API
    const agentEndpoint = AGENT_ENDPOINTS[agentType as keyof typeof AGENT_ENDPOINTS];
    const url = `${ADLAAN_AGENT_BASE_URL}${agentEndpoint}`;

    console.log(`[AI Agent API] ${agentType} request to:`, url);
    console.log(`[AI Agent API] Request payload:`, JSON.stringify(body, null, 2));

    // Make request to Adlaan agent with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'X-Agent-Type': agentType,
        'X-Request-Source': 'adlaan-frontend',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();

    console.log(`[AI Agent API] ${agentType} response:`, responseData);

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: responseData.message || 'Agent request failed',
          data: responseData 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      taskId: responseData.taskId || responseData.id,
    });

  } catch (error) {
    console.error(`[AI Agent API] Error:`, error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentType: string }> }
): Promise<NextResponse<AgentResponse>> {
  try {
    const { agentType } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status');

    // Validate agent type
    if (!AGENT_ENDPOINTS[agentType as keyof typeof AGENT_ENDPOINTS]) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent type' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (taskId) queryParams.set('taskId', taskId);
    if (status) queryParams.set('status', status);

    // Prepare request URL
    const agentEndpoint = AGENT_ENDPOINTS[agentType as keyof typeof AGENT_ENDPOINTS];
    const url = `${ADLAAN_AGENT_BASE_URL}${agentEndpoint}?${queryParams.toString()}`;

    console.log(`[AI Agent API] GET ${agentType} request to:`, url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'X-Agent-Type': agentType,
        'X-Request-Source': 'adlaan-frontend',
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: responseData.message || 'Agent request failed',
          data: responseData 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error(`[AI Agent API] GET Error:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}