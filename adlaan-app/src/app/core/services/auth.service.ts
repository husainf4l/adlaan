import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  twoFactorEnabled?: boolean;
  companyId?: string | null;
  company?: any | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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

export interface RegisterResponse {
  message: string;
  user?: User;
  requiresEmailVerification?: boolean;
  otpSent?: boolean;
  otpCode?: string;
}

export interface OtpVerificationRequest {
  phoneNumber: string;
  code: string;
  type: 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION' | 'PASSWORD_RESET';
}

export interface OtpVerificationResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check auth status on service initialization
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, 
      credentials,
      { withCredentials: true } // Important: Include cookies for JWT
    ).pipe(
      tap(response => {
        console.log('Login response:', response);
        // If login successful and no OTP required
        if (response.user && !response.requiresOtp) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  verifyOtp(otpData: OtpVerificationRequest): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(
      `${this.apiUrl}/auth/verify-otp`, 
      otpData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('OTP verification response:', response);
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Registration response:', response);
        if (response.user && !response.requiresEmailVerification) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/auth/profile`,
      { withCredentials: true }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  private checkAuthStatus(): void {
    this.getProfile().subscribe({
      next: (user) => {
        console.log('Auth check successful:', user);
        this.currentUserSubject.next(user);
      },
      error: (error) => {
        console.log('Auth check failed:', error);
        // User not authenticated, which is fine
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
