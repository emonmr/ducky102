import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Normalizes HTTP failures into a plain `Error` with a user-readable message for stores to display. */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }
      const message =
        err.status === 0
          ? 'Network error — check your connection and try again.'
          : `Request failed (${err.status}${err.statusText ? ` ${err.statusText}` : ''}).`;
      return throwError(() => new Error(message, { cause: err }));
    }),
  );
