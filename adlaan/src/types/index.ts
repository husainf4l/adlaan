// Type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  companyId?: string | null;
  company?: Company | null;
  isProfileComplete?: boolean;
  twoFactorEnabled?: boolean;
}

export interface Company {
  id: string;
  name: string;
  size?: string;
  industry?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresOtp?: boolean;
  phoneNumber?: string;
  message?: string;
}

export interface RegisterRequest {
  // User data
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  
  // Company data
  companyName: string;
  industry: string;
  companySize: string;
  companyDescription?: string;
  
  // Subscription
  planId?: string;
  
  // Settings
  twoFactorEnabled?: boolean;
}

export interface RegisterResponse {
  requiresOtp?: boolean;
  phoneNumber?: string;
  message?: string;
}

export interface ProfileCompleteRequest {
  companyName: string;
  companySize?: string;
  industry?: string;
  phoneNumber?: string;
}

export interface OtpVerificationRequest {
  phoneNumber: string;
  code: string;
  type: 'LOGIN_VERIFICATION' | 'REGISTRATION_VERIFICATION' | 'PASSWORD_RESET';
}

export interface GoogleSignInRequest {
  credential: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Form state types
export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
}

// Component prop types
export interface PageProps {
  params?: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params?: Promise<Record<string, string>>;
}
