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
          : (serverMessage(err) ??
            `Request failed (${err.status}${err.statusText ? ` ${err.statusText}` : ''}).`);
      return throwError(() => new Error(message, { cause: err }));
    }),
  );

/** The API's own `{ message }` error body, when it sent one (e.g. "Invalid email or password."). */
function serverMessage(err: HttpErrorResponse): string | null {
  const body: unknown = err.error;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body;
    if (typeof message === 'string' && message) return message;
  }
  return null;
}
