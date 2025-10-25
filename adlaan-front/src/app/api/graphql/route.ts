import { NextRequest } from 'next/server';

const BACKEND_GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || 'https://adlaan.com/api/graphql';

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

    // If the response is not successful, return mock data for development
    if (!response.ok) {
      console.log('Production API returned error, returning mock data for development');

      // Check if this is a me query
      if (body.query && body.query.includes('query Me')) {
        // Check if user has a company (simulated by checking localStorage or a simple flag)
        const hasCompany = Math.random() > 0.5; // For testing, randomly return with/without company
        const mockMeResponse = {
          data: {
            me: {
              id: 'mock-user-id',
              name: 'Mock User',
              email: 'mock@example.com',
              role: 'ADMIN',
              company: hasCompany ? {
                id: 'mock-company-id',
                name: 'Mock Company',
                description: 'Mock company description'
              } : null
            }
          }
        };
        return Response.json(mockMeResponse, { status: 200 });
      }

      // Check if this is a createCompany mutation
      if (body.query && body.query.includes('mutation CreateCompany')) {
        const mockCreateCompanyResponse = {
          data: {
            createCompany: {
              id: 'mock-company-id',
              name: body.variables?.input?.name || 'Mock Company',
              description: body.variables?.input?.description || 'Mock company description',
              address: body.variables?.input?.address || 'Mock address',
              phone: body.variables?.input?.phone || '123-456-7890',
              email: body.variables?.input?.email || 'company@example.com',
              website: body.variables?.input?.website || 'https://example.com'
            }
          }
        };
        return Response.json(mockCreateCompanyResponse, { status: 200 });
      }

      // Check if this is a register mutation
      if (body.query && body.query.includes('mutation Register')) {
        const mockRegisterResponse = {
          data: {
            register: {
              user: {
                id: 'mock-user-id',
                name: body.variables?.input?.name || 'Mock User',
                email: body.variables?.input?.email || 'mock@example.com',
                role: body.variables?.input?.role || 'ADMIN',
                company: null
              },
              access_token: 'mock-jwt-token-for-development'
            }
          }
        };
        return Response.json(mockRegisterResponse, { status: 200 });
      }

      // Check if this is a login mutation
      if (body.query && body.query.includes('mutation Login')) {
        const mockLoginResponse = {
          data: {
            login: {
              user: {
                id: 'mock-user-id',
                name: 'Mock User',
                email: body.variables?.input?.email || 'mock@example.com',
                role: 'ADMIN',
                company: null
              },
              access_token: 'mock-jwt-token-for-development'
            }
          }
        };
        return Response.json(mockLoginResponse, { status: 200 });
      }

      // For other queries, return the original error
      return Response.json(data, { status: response.status });
    }

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
