import { User } from './user.model';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response from server
 */
export interface LoginResponse {
  message: string;
  user?: User;
  // For 2FA cases
  id?: string;
  requiresOtp?: boolean;
  phoneNumber?: string;
  otpSent?: boolean;
  otpCode?: string; // Only in development mode
}

/**
 * Registration response from server
 */
export interface RegisterResponse {
  message: string;
  user?: User;
  requiresEmailVerification?: boolean;
  otpSent?: boolean;
  otpCode?: string;
}

/**
 * OTP verification request payload
 */
export interface OtpVerificationRequest {
  phoneNumber: string;
  code: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION' | 'PASSWORD_RESET';
}

/**
 * OTP verification response from server
 */
export interface OtpVerificationResponse {
  message: string;
  user: User;
}