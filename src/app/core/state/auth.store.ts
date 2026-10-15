import { computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, tap } from 'rxjs';
import { AuthApiService } from '../auth/auth-api.service';
import {
  AuthSession,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../auth/auth.model';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  /** Success text for flows that don't navigate away (forgot / reset password). */
  notice: string | null;
}

export const AUTH_STORAGE_KEY = 'auth-session';

/** Where the app lands after sign-in when no `returnUrl` was given. */
const DEFAULT_REDIRECT = '/users';

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<AuthSession>;
    return session.token && session.user ? (session as AuthSession) : null;
  } catch {
    return null;
  }
}

/** Only allow app-relative redirects so a crafted `returnUrl` can't send users off-site. */
function safeRedirect(returnUrl: string | null | undefined): string {
  return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : DEFAULT_REDIRECT;
}

/**
 * App-wide session store: read by guards, the auth interceptor and the navbar, so it lives in
 * `core/state` with `providedIn: 'root'`. The session is restored from (and persisted to)
 * localStorage, mirroring `theme.store.ts`.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(() => {
    const session = readStoredSession();
    return {
      user: session?.user ?? null,
      token: session?.token ?? null,
      loading: false,
      error: null,
      notice: null,
    };
  }),

  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => token() !== null && user() !== null),
    displayName: computed(() => user()?.name ?? ''),
  })),

  withMethods((store, authApi = inject(AuthApiService), router = inject(Router)) => {
    /**
     * Shared success path for login and register: both return a full session, so we store it
     * (the persistence effect in `onInit` writes it to localStorage) and leave the auth pages.
     */
    function startSession(session: AuthSession, returnUrl?: string | null): void {
      patchState(store, {
        user: session.user,
        token: session.token,
        loading: false,
        error: null,
      });
      void router.navigateByUrl(safeRedirect(returnUrl));
    }

    /** Shared failure path: the error interceptor has already turned the HTTP error into a readable message. */
    function fail(err: Error): void {
      patchState(store, { error: err.message, loading: false });
    }

    return {
      /**
       * Clears any error/notice left over from a previous page or attempt. Auth pages call this
       * on init so, e.g., a failed login message doesn't show up on the register page.
       */
      clearMessages(): void {
        patchState(store, { error: null, notice: null });
      },

      /**
       * Ends the session locally and returns to the login page. There is no server call: the
       * token is a bearer token, so dropping it is enough on the client. Used both by the navbar
       * "Sign out" button and by the auth interceptor when the API answers 401.
       */
      logout(): void {
        patchState(store, { user: null, token: null, error: null, notice: null });
        void router.navigateByUrl('/auth/login');
      },

      /**
       * Signs in with email + password. `exhaustMap` ignores repeat submits while a request is
       * in flight (double-clicks). On success, navigates to `returnUrl` (set by `authGuard` when
       * it bounced the user) or to the default page.
       */
      login: rxMethod<{ credentials: LoginRequest; returnUrl?: string | null }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, notice: null })),
          exhaustMap(({ credentials, returnUrl }) =>
            authApi.login(credentials).pipe(
              tapResponse({
                next: (session) => startSession(session, returnUrl),
                error: fail,
              }),
            ),
          ),
        ),
      ),

      /**
       * Creates an account. The API responds with a session, so a successful registration
       * signs the user straight in and lands them on the default page.
       */
      register: rxMethod<RegisterRequest>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, notice: null })),
          exhaustMap((request) =>
            authApi.register(request).pipe(
              tapResponse({
                next: (session) => startSession(session),
                error: fail,
              }),
            ),
          ),
        ),
      ),

      /**
       * Requests a password-reset email. Stays on the page and shows the server's confirmation
       * in `notice` (the server answers the same way whether or not the email exists, so the UI
       * never reveals which addresses are registered).
       */
      forgotPassword: rxMethod<ForgotPasswordRequest>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, notice: null })),
          exhaustMap((request) =>
            authApi.forgotPassword(request).pipe(
              tapResponse({
                next: (notice) => patchState(store, { notice, loading: false }),
                error: fail,
              }),
            ),
          ),
        ),
      ),

      /**
       * Sets a new password using the token from the reset email link. On success the page
       * shows `notice` with a link back to sign in; the user is not signed in automatically.
       */
      resetPassword: rxMethod<ResetPasswordRequest>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, notice: null })),
          exhaustMap((request) =>
            authApi.resetPassword(request).pipe(
              tapResponse({
                next: (notice) => patchState(store, { notice, loading: false }),
                error: fail,
              }),
            ),
          ),
        ),
      ),
    };
  }),

  withHooks({
    onInit(store) {
      // Keep localStorage in sync with the session so a reload stays signed in.
      effect(() => {
        const user = store.user();
        const token = store.token();
        try {
          if (user && token) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch {
          // Storage unavailable (private mode) — the session still works until the tab closes.
        }
      });
    },
  }),
);
