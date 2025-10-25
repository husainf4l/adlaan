import { NextRequest } from 'next/server';

const ADLAAN_AGENT_BASE_URL = process.env.NEXT_PUBLIC_AGENTS_URL || 'http://adlaan.com/api';

// Store active connections
const connections = new Set<{
  controller: ReadableStreamDefaultController;
  userId?: string;
}>();

interface StreamMessage {
  type: 'task_update' | 'agent_status' | 'system_health' | 'error';
  data: any;
  timestamp: string;
  userId?: string;
}

// Clean up closed connections
function cleanupConnections() {
  connections.forEach(connection => {
    try {
      // Try to send a ping to test if connection is still alive
      connection.controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    } catch (error) {
      // Connection is closed, remove it
      connections.delete(connection);
    }
  });
}

// Broadcast message to all connections or specific user
function broadcastMessage(message: StreamMessage) {
  connections.forEach(connection => {
    try {
      // If message has userId, only send to that user
      if (message.userId && connection.userId !== message.userId) {
        return;
      }

      const data = `data: ${JSON.stringify(message)}\n\n`;
      connection.controller.enqueue(data);
    } catch (error) {
      console.error('Error broadcasting message:', error);
      connections.delete(connection);
    }
  });
}

// Poll backend for updates
async function pollBackendUpdates() {
  try {
    const response = await fetch(`${ADLAAN_AGENT_BASE_URL}/ai/agents/stream`, {
      headers: {
        'X-Request-Source': 'adlaan-frontend-stream',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.updates && Array.isArray(data.updates)) {
        data.updates.forEach((update: any) => {
          broadcastMessage({
            type: update.type || 'task_update',
            data: update,
            timestamp: new Date().toISOString(),
          });
        });
      }
    }
  } catch (error) {
    console.error('Error polling backend updates:', error);
    
    // Send error message to clients
    broadcastMessage({
      type: 'error',
      data: { message: 'Connection to backend lost' },
      timestamp: new Date().toISOString(),
    });
  }
}

// Start polling when first client connects
let pollInterval: NodeJS.Timeout | null = null;

function startPolling() {
  if (pollInterval) return;
  
  console.log('[Agent Stream] Starting backend polling');
  pollInterval = setInterval(() => {
    pollBackendUpdates();
    cleanupConnections();
  }, 2000); // Poll every 2 seconds
}

function stopPolling() {
  if (pollInterval) {
    console.log('[Agent Stream] Stopping backend polling');
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export async function GET(request: NextRequest) {
  // Validate authentication
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Extract user ID from token (simplified - in production, verify JWT)
  let userId: string | undefined;
  try {
    // This is a placeholder - implement proper JWT verification
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.sub || payload.userId;
  } catch (error) {
    console.warn('Could not extract user ID from token');
  }

  console.log('[Agent Stream] New SSE connection from user:', userId);

  const stream = new ReadableStream({
    start(controller) {
      // Add connection to active connections
      const connection = { controller, userId };
      connections.add(connection);

      // Start polling if this is the first connection
      if (connections.size === 1) {
        startPolling();
      }

      // Send initial connection message
      const welcomeMessage: StreamMessage = {
        type: 'system_health',
        data: { 
          message: 'Connected to Adlaan AI Agents stream',
          connectionId: Math.random().toString(36).substr(2, 9),
          connectedClients: connections.size,
        },
        timestamp: new Date().toISOString(),
      };

      try {
        controller.enqueue(`data: ${JSON.stringify(welcomeMessage)}\n\n`);
      } catch (error) {
        console.error('Error sending welcome message:', error);
      }

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'ping',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } catch (error) {
          clearInterval(keepAlive);
          connections.delete(connection);
          
          // Stop polling if no more connections
          if (connections.size === 0) {
            stopPolling();
          }
        }
      }, 30000);

      // Handle connection close
      request.signal.addEventListener('abort', () => {
        console.log('[Agent Stream] SSE connection closed for user:', userId);
        clearInterval(keepAlive);
        connections.delete(connection);
        
        // Stop polling if no more connections
        if (connections.size === 0) {
          stopPolling();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Manual trigger endpoint for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, userId } = body;

    const message: StreamMessage = {
      type: type || 'task_update',
      data,
      timestamp: new Date().toISOString(),
      userId,
    };

    broadcastMessage(message);

    return Response.json({ 
      success: true, 
      message: 'Broadcast sent',
      connections: connections.size,
    });
  } catch (error) {
    console.error('Error in manual broadcast:', error);
    return Response.json(
      { success: false, error: 'Failed to broadcast message' },
      { status: 500 }
    );
  }
}