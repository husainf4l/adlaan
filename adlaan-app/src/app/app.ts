import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication status and redirect appropriately
    const isLoginPage = this.router.url.includes('/login');
    const hasToken = this.authService.isAuthenticated();
    
    if (!hasToken && !isLoginPage) {
      // No token and not on login page, redirect to login
      this.router.navigate(['/login']);
    } else if (hasToken && isLoginPage) {
      // Has token but on login page, redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
