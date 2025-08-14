// Authentication service for NestJS backend integration

import { API_CONFIG } from '@/lib/constants';
import { documentService } from './documentService';
import type { 
  GoogleSignInRequest, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User 
} from '@/types';

class AuthService {
  private baseUrl: string;
  private tokenKey = 'access_token';

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    console.log('🔐 Access token stored in localStorage');
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    console.log('🗑️ Access token removed from localStorage');
  }

    // Helper method for API calls with Bearer token authentication
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`🔐 Bearer token added to ${options.method || 'GET'} request`);
    } else {
      console.warn(`⚠️ No access token found for ${options.method || 'GET'} request to ${endpoint}`);
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);

    const response = await fetch(url, config);

    console.log(`📡 Response status:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`❌ API Error (${response.status}):`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle JSON parsing with proper error handling
    try {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log(`📄 Response headers for ${endpoint}:`, {
        contentType,
        contentLength,
        status: response.status,
        statusText: response.statusText
      });
      
      // Check if response has content
      if (contentLength === '0') {
        console.log(`⚠️ Empty response (content-length: 0) for ${endpoint}`);
        return {} as T;
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`⚠️ Non-JSON response (content-type: ${contentType}) for ${endpoint}`);
        const textContent = await response.text();
        console.log(`📄 Text content for ${endpoint}:`, textContent);
        return {} as T;
      }
      
      // Read response as text first to avoid stream consumption issues
      const responseText = await response.text();
      console.log(`📖 Raw response text for ${endpoint}:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
      if (!responseText || responseText.trim() === '') {
        console.log(`⚠️ Empty response body for ${endpoint}`);
        return {} as T;
      }
      
      const data = JSON.parse(responseText);
      console.log(`✅ Parsed JSON data for ${endpoint}:`, data);
      return data;
    } catch (jsonError) {
      console.error(`❌ JSON parsing failed for ${endpoint}:`, jsonError);
      const error = jsonError as Error;
      console.log(`📄 Response content-type:`, response.headers.get('content-type'));
      console.log(`📏 Response content-length:`, response.headers.get('content-length'));
      
      // Try to get response as text for debugging
      try {
        const textContent = await response.text();
        console.log(`📄 Response as text:`, textContent);
      } catch (textError) {
        console.error(`❌ Could not read response as text:`, textError);
      }
      
      // If it's a successful response but empty/invalid JSON, treat as success
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Treating empty/invalid JSON as success for status ${response.status}`);
        return {} as T;
      }
      
      throw new Error(`Failed to parse response as JSON: ${error.message}`);
    }
  }

  // Google Sign-In - backend returns access and refresh tokens
  async googleSignIn(data: GoogleSignInRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`❌ Google Sign-In Error (${response.status}):`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔐 Google Sign-In response:', result);

    // Extract tokens and user from the response structure:
    // { message, user, tokens: { accessToken, refreshToken } }
    if (result.tokens && result.tokens.accessToken) {
      console.log('💾 Storing access token in localStorage');
      this.setToken(result.tokens.accessToken);
      
      // Update document service with new tokens
      console.log('📁 Setting document service tokens');
      documentService.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      
      if (result.tokens.refreshToken) {
        console.log('🔄 Storing refresh token in localStorage');
        localStorage.setItem('refresh_token', result.tokens.refreshToken);
      }
    } else {
      console.error('❌ No tokens found in Google Sign-In response');
      throw new Error('Invalid authentication response - no tokens received');
    }

    // Return the expected AuthResponse format
    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      message: result.message,
    };
  }

  // Regular login - backend sets HTTP-only cookies  
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log("🍪 Login successful - HTTP-only cookies should be set");
    return response;
  }

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.apiCall<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

    // Get user profile - relies on HTTP-only cookies for auth
  async getProfile(): Promise<User> {
    const response = await this.apiCall<{ user: User }>('/api/auth/profile', {
      method: 'GET',
    });
    
    console.log("👤 Profile response structure:", response);
    
    // Extract user from the response wrapper
    if (response && response.user) {
      console.log("✅ User extracted from response:", response.user);
      return response.user;
    }
    
    // If response is the user directly (fallback)
    if (response && (response as any).id) {
      console.log("✅ Response is user directly:", response);
      return response as any;
    }
    
    console.error("❌ Unexpected profile response structure:", response);
    throw new Error("Invalid profile response structure");
  }

  // Complete user profile with company information
  async completeProfile(profileData: {
    companyName: string;
    companySize: string;
    industry: string;
    phoneNumber: string;
  }): Promise<{ message: string; user: User }> {
    const response = await this.apiCall<{ message: string; user: User }>('/api/profile/complete', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    
    console.log("✅ Profile completion successful:", response);
    return response;
  }

  // Logout - remove access token and call backend
  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.apiCall<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      });

      // Remove token from localStorage regardless of backend response
      this.removeToken();
      // Also clear document service tokens
      documentService.clearTokens();
      console.log("🔐 Logout successful - access token removed");
      
      return response;
    } catch (error) {
      // Remove token even if backend call fails
      this.removeToken();
      // Also clear document service tokens
      documentService.clearTokens();
      console.log("🔐 Logout - access token removed (backend call failed)");
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log("🔒 No access token found");
      return false;
    }

    try {
      await this.getProfile();
      console.log("🔐 User is authenticated");
      return true;
    } catch {
      console.log("🔒 Authentication failed - removing invalid token");
      this.removeToken();
      return false;
    }
  }

  // Verify JWT token
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const profile = await this.getProfile();
      return { valid: true, user: profile };
    } catch {
      return { valid: false };
    }
  }

  // Refresh token (if your NestJS backend supports it)
  async refreshToken(): Promise<AuthResponse> {
    return this.apiCall<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export individual methods for easier imports (updated for HTTP-only cookies)
export const {
  googleSignIn,
  login,
  register,
  getProfile,
  logout,
  verifyToken,
  refreshToken,
} = authService;
