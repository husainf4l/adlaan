import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 font-sf">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg border-r border-gray-200">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-adlaan-dark">Adlaan</h1>
        </div>
        
        <!-- Navigation -->
        <nav class="p-4 space-y-8">
          <!-- Main Section -->
          <div>
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Main</h3>
            <div class="space-y-1">
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-adlaan-accent text-white">
                <span class="mr-3">📊</span>
                Dashboard
              </a>
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">📈</span>
                Analytics
              </a>
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">👥</span>
                Users
              </a>
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">📋</span>
                Projects
              </a>
            </div>
          </div>
          
          <!-- Management Section -->
          <div>
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Management</h3>
            <div class="space-y-1">
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">⚙️</span>
                Settings
              </a>
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">💳</span>
                Billing
              </a>
              <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="mr-3">🔒</span>
                Security
              </a>
            </div>
          </div>
        </nav>
        
        <!-- User Profile Footer -->
        <div class="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-white" *ngIf="currentUser">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-adlaan-accent text-white rounded-full flex items-center justify-center font-semibold">
              {{ currentUser.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ currentUser.email }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <!-- Left Side -->
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <!-- Right Side -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <div class="relative">
                <button class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-adlaan-accent rounded-lg">
                  <span class="text-xl">🔔</span>
                </button>
                <div class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
              
              <!-- User Menu -->
              <div class="relative" *ngIf="currentUser">
                <button 
                  (click)="toggleUserMenu()" 
                  class="flex items-center space-x-2 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-adlaan-accent"
                >
                  <div class="w-8 h-8 bg-adlaan-accent text-white rounded-full flex items-center justify-center font-semibold text-xs">
                    {{ currentUser.name.charAt(0) }}
                  </div>
                  <span class="text-gray-700">{{ currentUser.name }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  *ngIf="showUserMenu" 
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <hr class="my-1 border-gray-200">
                  <a href="#" (click)="logout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
