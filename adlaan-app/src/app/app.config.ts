import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withViewTransitions, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor, AuthService } from './core';

// App initializer factory function
export function initializeAuth(authService: AuthService) {
  return (): Promise<void> => authService.initializeAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // APP_INITIALIZER to properly initialize auth before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(), // Latest Angular 20+ pattern
      withViewTransitions(), // Smooth page transitions
      withPreloading(PreloadAllModules) // Preload all lazy modules for better performance
    ),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
