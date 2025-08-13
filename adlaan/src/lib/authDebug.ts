// Debug utilities for authentication troubleshooting

export class AuthDebug {
  static async checkCookies() {
    console.log('🍪 Checking cookies...');
    console.log('📋 Document cookies:', document.cookie);
    
    // Check if we can access the profile
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Profile response status:', response.status);
      console.log('📡 Profile response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data:', data);
        return data;
      } else {
        const error = await response.text();
        console.error('❌ Profile error:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  }

  static async testAuthEndpoint(endpoint: string, method: string = 'GET', body?: any) {
    console.log(`🧪 Testing ${method} ${endpoint}...`);
    
    try {
      const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      console.log(`📡 ${endpoint} response status:`, response.status);
      
      const responseText = await response.text();
      console.log(`📡 ${endpoint} response:`, responseText);
      
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error);
      return null;
    }
  }

  static logRequestDetails(url: string, options: RequestInit) {
    console.log('🌐 Request Details:');
    console.log('  URL:', url);
    console.log('  Method:', options.method || 'GET');
    console.log('  Headers:', options.headers);
    console.log('  Credentials:', options.credentials);
    console.log('  Body:', options.body);
  }
}

// Global debug function for easy access in console
if (typeof window !== 'undefined') {
  (window as any).authDebug = AuthDebug;
}
