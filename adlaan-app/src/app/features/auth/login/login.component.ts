import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('Sending login request with:', loginData);

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          this.isLoading = false;

          if (response.requiresOtp) {
            // Handle 2FA scenario
            console.log('2FA required');
            // TODO: Navigate to OTP verification page or show OTP input
            // For now, just show a message
            this.errorMessage = '2FA verification required. Please check your phone for the OTP code.';
          } else if (response.user) {
            // Successful login without 2FA
            console.log('Login successful, redirecting to dashboard');
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Login response received but no user data found.';
          }
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.isLoading = false;
          
          // Handle different types of errors
          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.status === 429) {
            this.errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  onGoogleSignUp(): void {
    // TODO: Implement Google OAuth integration
    console.log('Google sign-up clicked');
    // Placeholder for Google OAuth implementation
  }

  onRegister(): void {
    // TODO: Navigate to registration page
    console.log('Register clicked');
    // this.router.navigate(['/register']);
  }

  onContactSales(): void {
    // TODO: Open contact sales modal or navigate to contact page
    console.log('Contact sales clicked');
    // window.open('mailto:sales@adlaan.com', '_blank');
  }

  onForgotPassword(): void {
    // TODO: Navigate to password reset page or open reset password modal
    console.log('Forgot password clicked');
    // this.router.navigate(['/reset-password']);
  }
}
