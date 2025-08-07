import { Component, inject, effect, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signal-based reactive state
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected showPassword = signal(false);
  protected agreeToTerms = signal(false);

  // Modern Angular 20+ pattern: Reactive Forms with Signal integration
  protected signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  // Signal integration with reactive forms (Angular 20+ pattern)
  protected formValue = toSignal(this.signupForm.valueChanges, { initialValue: this.signupForm.value });
  protected isFormValid = computed(() => this.signupForm.valid && this.agreeToTerms());

  constructor() {
    // Use effect for modern signal-based reactivity
    effect(() => {
      const currentUser = this.authService.currentUser();
      const isInitialized = this.authService.isAuthInitializedComputed();
      
      if (currentUser && isInitialized) {
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }

  
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.signupForm.markAllAsTouched();
    
    if (this.signupForm.valid && this.agreeToTerms()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const signupData = {
        name: this.signupForm.value.name,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password
      };

      console.log('Sending signup request with:', signupData);

      this.authService.register(signupData).subscribe({
        next: (response) => {
          console.log('Signup response:', response);
          this.isLoading.set(false);

          if (response.requiresEmailVerification) {
            // Handle email verification scenario
            console.log('Email verification required');
            this.errorMessage.set('Please check your email to verify your account before signing in.');
          } else if (response.user) {
            // Successful signup without email verification
            console.log('Signup successful, redirecting to home');
            this.router.navigate(['/']);
          } else {
            this.errorMessage.set('Signup response received but no user data found.');
          }
        },
        error: (error: any) => {
          console.error('Signup error:', error);
          this.isLoading.set(false);
          
          // Handle different types of errors
          if (error.status === 409) {
            this.errorMessage.set('An account with this email already exists. Please try signing in instead.');
          } else if (error.status === 422) {
            this.errorMessage.set('Please check your information and try again.');
          } else if (error.status === 429) {
            this.errorMessage.set('Too many signup attempts. Please try again later.');
          } else if (error.status === 500) {
            this.errorMessage.set('Server error. Please try again later.');
          } else {
            this.errorMessage.set(error.error?.message || 'Signup failed. Please try again.');
          }
        }
      });
    } else if (!this.agreeToTerms()) {
      this.errorMessage.set('Please agree to the Terms of Service and Privacy Policy.');
    } else {
      console.log('Form is invalid:', this.signupForm.errors);
      this.errorMessage.set('Please fill in all required fields correctly.');
    }
  }

  onGoogleSignUp(): void {
    // TODO: Implement Google OAuth integration
    console.log('Google sign-up clicked');
    // Placeholder for Google OAuth implementation
  }

  onSignIn(): void {
    this.router.navigate(['/login']);
  }

  onContactSales(): void {
    // TODO: Open contact sales modal or navigate to contact page
    console.log('Contact sales clicked');
    // window.open('mailto:sales@adlaan.com', '_blank');
  }
}
