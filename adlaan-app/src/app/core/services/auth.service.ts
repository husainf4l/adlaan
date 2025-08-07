import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../shared';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterResponse, 
  OtpVerificationRequest, 
  OtpVerificationResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals for modern Angular state management
  private currentUserSignal = signal<User | null>(null);
  private authInitializedSignal = signal<boolean>(false);
  
  // Computed signals
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticatedSignal = computed(() => this.currentUserSignal() !== null);
  public isAuthInitializedComputed = computed(() => this.authInitializedSignal());
  
  // Legacy observables for backward compatibility (will be removed in future)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = environment.apiUrl;

  constructor() {
    // Auth initialization will be handled by APP_INITIALIZER
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, 
      credentials,
      { withCredentials: true } // Important: Include cookies for JWT
    ).pipe(
      tap(response => {
        console.log('Login response:', response);
        // If login successful and no OTP required
        if (response.user && !response.requiresOtp) {
          this.setCurrentUser(response.user);
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
      `${this.apiUrl}${API_ENDPOINTS.AUTH.VERIFY_OTP}`, 
      otpData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('OTP verification response:', response);
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Registration response:', response);
        if (response.user && !response.requiresEmailVerification) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<{user: User}>(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.PROFILE}`,
      { 
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    ).pipe(
      tap(response => {
        this.setCurrentUser(response.user);
      }),
      map(response => response.user)
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,
      {},
      { 
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    ).pipe(
      tap(() => {
        console.log('Logout: Clearing user state and navigating to login');
        this.clearAuthState();
        
        // Force navigation with replaceUrl to ensure clean state
        this.router.navigate(['/login'], { replaceUrl: true });
      }),
      catchError((error) => {
        console.error('Logout error, but clearing local state anyway:', error);
        // Even if server logout fails, clear local state
        this.clearAuthState();
        this.router.navigate(['/login'], { replaceUrl: true });
        return of(null); // Return successful observable to prevent error propagation
      })
    );
  }

  // Force clear all auth state
  private clearAuthState(): void {
    console.log('Clearing all authentication state');
    this.setCurrentUser(null);
    this.authInitializedSignal.set(true); // Keep initialized but with null user
    
    // Clear any potential cached data
    if (typeof window !== 'undefined') {
      // Clear any localStorage or sessionStorage if used
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Clear any other auth-related storage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('auth') || key.startsWith('user') || key.startsWith('token')
      );
      authKeys.forEach(key => localStorage.removeItem(key));
    }
  }

  // Helper method to update both signal and observable
  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    this.currentUserSubject.next(user);
  }

  // Initialize auth for APP_INITIALIZER
  initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Initializing auth...');
      this.getProfile().subscribe({
        next: (user) => {
          console.log('Auth initialization successful:', user);
          console.log('User found during initialization, cookies must be valid');
          this.setCurrentUser(user);
          this.authInitializedSignal.set(true);
          resolve();
        },
        error: (error) => {
          console.log('Auth initialization failed (user not authenticated):', error);
          console.log('No valid auth cookies found or user logged out');
          if (error.status === 401 || error.status === 403) {
            this.setCurrentUser(null);
          }
          this.authInitializedSignal.set(true);
          resolve(); // Always resolve, even on auth failure
        }
      });
    });
  }

  // Legacy methods for backward compatibility
  isAuthInitialized(): boolean {
    return this.authInitializedSignal();
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }
}
