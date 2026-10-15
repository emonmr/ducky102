import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { delay, dematerialize, materialize, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponseDto,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponseDto,
  RegisterRequest,
  ResetPasswordRequest,
} from '../auth/auth.model';

/*
 * DEV-ONLY fake auth backend. The demo API (JSONPlaceholder) has no auth endpoints, so this
 * answers `auth/*` requests in-memory. Registered only when `!environment.production`.
 * DELETE this file (and its registration in app.config.ts) once a real auth API exists.
 */

interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

const users: MockUser[] = [
  { id: 1, name: 'Demo User', email: 'demo@ducky.dev', password: 'password123' },
];

const AUTH_PATH = `${environment.apiUrl}/auth/`;
const LATENCY_MS = 400;

export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || !req.url.startsWith(AUTH_PATH)) return next(req);

  const endpoint = req.url.slice(AUTH_PATH.length);
  // materialize/dematerialize so errors are delayed too, like a real network round-trip.
  return handle(endpoint, req).pipe(materialize(), delay(LATENCY_MS), dematerialize());
};

function handle(endpoint: string, req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  switch (endpoint) {
    case 'login': {
      const { email, password } = req.body as LoginRequest;
      const user = findByEmail(email);
      return user && user.password === password
        ? ok(sessionFor(user))
        : fail(req, 401, 'Invalid email or password.');
    }
    case 'register': {
      const { name, email, password } = req.body as RegisterRequest;
      if (findByEmail(email)) return fail(req, 409, 'An account with this email already exists.');
      const user: MockUser = { id: users.length + 1, name, email, password };
      users.push(user);
      return ok(sessionFor(user));
    }
    case 'forgot-password': {
      const { email } = req.body as ForgotPasswordRequest;
      return ok<MessageResponseDto>({
        message: `If an account exists for ${email}, a reset link is on its way.`,
      });
    }
    case 'reset-password': {
      const { token, password } = req.body as ResetPasswordRequest;
      if (!token) return fail(req, 400, 'This reset link is invalid or has expired.');
      // No real tokens here: apply the new password to the demo account.
      users[0] = { ...users[0], password };
      return ok<MessageResponseDto>({ message: 'Your password has been reset.' });
    }
    default:
      return fail(req, 404, 'Not found.');
  }
}

function findByEmail(email: string): MockUser | undefined {
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

function sessionFor(user: MockUser): AuthResponseDto {
  return {
    accessToken: `mock-token.${user.id}.${Date.now()}`,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

function ok<T>(body: T): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status: 200, body }));
}

function fail(req: HttpRequest<unknown>, status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message }, url: req.url }));
}
