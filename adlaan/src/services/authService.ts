// Authentication service for NestJS backend integration

import { API_CONFIG } from '@/lib/constants';
import type { 
  GoogleSignInRequest, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User 
} from '@/types';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Helper method for API calls - relies on HTTP-only cookies
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers,
      credentials: 'include', // This sends HTTP-only cookies automatically
      ...options,
    };

    console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
    console.log(`🍪 Credentials included for HTTP-only cookies`);

    const response = await fetch(url, config);

    console.log(`📡 Response status:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`❌ API Error (${response.status}):`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Google Sign-In - backend will set HTTP-only cookies
  async googleSignIn(data: GoogleSignInRequest): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>('/auth/google/token', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log("🍪 Google authentication successful - HTTP-only cookies set by backend");
    return response;
  }

  // Regular login - backend sets HTTP-only cookies  
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log("🍪 Login successful - HTTP-only cookies should be set");
    return response;
  }

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

    // Get user profile - relies on HTTP-only cookies for auth
  async getProfile(): Promise<User> {
    return this.apiCall('/auth/profile', {
      method: 'GET',
    });
  }

  // Logout - backend will clear HTTP-only cookies
  async logout(): Promise<{ message: string }> {
    const response = await this.apiCall<{ message: string }>('/auth/logout', {
      method: 'POST',
    });

    console.log("🍪 Logout successful - HTTP-only cookies cleared by backend");
    
    return response;
  }

  // Check if user is authenticated by trying to get profile
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
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
    return this.apiCall<AuthResponse>('/auth/refresh', {
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
