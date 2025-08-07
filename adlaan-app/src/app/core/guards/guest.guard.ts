import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services';

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Auth is guaranteed to be initialized by APP_INITIALIZER
  // Simple synchronous check
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return router.createUrlTree(['/']);
  } else {
    return true;
  }
};