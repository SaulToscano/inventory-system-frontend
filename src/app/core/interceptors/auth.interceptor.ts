import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const session = authService.currentSession;
  const router = inject(Router);

  let authReq = req;
  
  if (session?.access_token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${session.access_token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.signOut().then(() => {
          router.navigate(['/login']);
        });
      }
      return throwError(() => error);
    })
  );
};