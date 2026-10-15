import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../state/auth.store';

const AUTH_PATH = `${environment.apiUrl}/auth/`;

/**
 * Attaches the bearer token to requests for our own API (never to third-party URLs), and signs
 * the user out when the API rejects the token. Registered *inside* `httpErrorInterceptor` so it
 * still sees the raw `HttpErrorResponse`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isAuthRequest = req.url.startsWith(AUTH_PATH);

  const authReq =
    token && isApiRequest ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // A 401 from login itself just means bad credentials — let the page show the error.
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthRequest && token) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
