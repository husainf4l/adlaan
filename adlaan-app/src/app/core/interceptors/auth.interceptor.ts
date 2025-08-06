import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Since we're using HTTP-only cookies for authentication,
  // we don't need to manually add Authorization headers.
  // The cookies will be automatically included with requests to the same domain.
  
  // Clone the request to add standard headers
  const authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return next(authReq);
};
