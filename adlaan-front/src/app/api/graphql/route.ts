import { NextRequest } from 'next/server';

const BACKEND_GRAPHQL_URL = 'http://adlaan.com/api/graphql';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Proxying request to:', BACKEND_GRAPHQL_URL);
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Forward the request to production API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(BACKEND_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-apollo-operation-name': 'ProxyRequest',
        'apollo-require-preflight': 'true',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);

    // Get the response data
    const data = await response.json();

    console.log('Response data:', JSON.stringify(data, null, 2));

    // Return the response with the same status
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { errors: [{ message: `Failed to connect to production API: ${errorMessage}` }] },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: 'GraphQL proxy endpoint - forwards requests to production API',
    productionUrl: BACKEND_GRAPHQL_URL
  });
}
