import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Use computed signals - Angular best practice
  protected currentUser = this.authService.currentUser;
  protected showUserMenu = signal(false);
  protected isLoggingOut = signal(false);

  toggleUserMenu(): void {
    this.showUserMenu.set(!this.showUserMenu());
  }

  logout(): void {
    if (this.isLoggingOut()) return; // Prevent multiple logout attempts
    
    this.isLoggingOut.set(true);
    this.showUserMenu.set(false); // Close the dropdown first
    
    console.log('Starting logout process...');
    
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.isLoggingOut.set(false);
        // Navigation will be handled by AuthService
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoggingOut.set(false);
        // Even if logout fails on server, clear local state and redirect
        this.router.navigate(['/login']);
      }
    });
  }
}
