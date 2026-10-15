import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthApiService } from '../auth/auth-api.service';
import { AuthSession } from '../auth/auth.model';
import { AUTH_STORAGE_KEY, AuthStore } from './auth.store';

const session: AuthSession = {
  token: 'token-1',
  user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
};

function setup(api: Partial<AuthApiService>) {
  const router = { navigateByUrl: vi.fn(() => Promise.resolve(true)) };
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthApiService, useValue: api },
      { provide: Router, useValue: router },
    ],
  });
  const store = TestBed.inject(AuthStore);
  return { store, router };
}

const stored = () => localStorage.getItem(AUTH_STORAGE_KEY);

describe('AuthStore', () => {
  beforeEach(() => localStorage.clear());

  it('starts signed out when nothing is stored', () => {
    const { store } = setup({});

    expect(store.isAuthenticated()).toBe(false);
    expect(store.displayName()).toBe('');
  });

  it('restores a stored session', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    const { store } = setup({});

    expect(store.isAuthenticated()).toBe(true);
    expect(store.displayName()).toBe('Ada Lovelace');
  });

  it('logs in, persists the session and navigates to the returnUrl', () => {
    const login = vi.fn(() => of(session));
    const { store, router } = setup({ login });

    store.login({
      credentials: { email: 'ada@example.com', password: 'x' },
      returnUrl: '/users/1',
    });
    TestBed.tick();

    expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'x' });
    expect(store.isAuthenticated()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/users/1');
    expect(JSON.parse(stored()!)).toEqual(session);
  });

  it('ignores off-site returnUrls', () => {
    const { store, router } = setup({ login: () => of(session) });

    store.login({ credentials: { email: 'a', password: 'b' }, returnUrl: '//evil.example' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/users');
  });

  it('stores the error message when login fails', () => {
    const { store, router } = setup({
      login: () => throwError(() => new Error('Invalid email or password.')),
    });

    store.login({ credentials: { email: 'a', password: 'b' } });

    expect(store.error()).toBe('Invalid email or password.');
    expect(store.loading()).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('registers and signs the new user in', () => {
    const { store, router } = setup({ register: () => of(session) });

    store.register({ name: 'Ada', email: 'ada@example.com', password: 'password123' });

    expect(store.isAuthenticated()).toBe(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/users');
  });

  it('sets a notice after requesting a reset link', () => {
    const { store } = setup({ forgotPassword: () => of('Check your inbox.') });

    store.forgotPassword({ email: 'ada@example.com' });

    expect(store.notice()).toBe('Check your inbox.');
    expect(store.loading()).toBe(false);
  });

  it('sets a notice after resetting the password, or an error on failure', () => {
    const { store } = setup({ resetPassword: () => of('Password reset.') });
    store.resetPassword({ token: 'abc', password: 'password123' });
    expect(store.notice()).toBe('Password reset.');

    TestBed.resetTestingModule();
    const failing = setup({ resetPassword: () => throwError(() => new Error('Expired link.')) });
    failing.store.resetPassword({ token: 'abc', password: 'password123' });
    expect(failing.store.error()).toBe('Expired link.');
    expect(failing.store.notice()).toBeNull();
  });

  it('clears messages', () => {
    const { store } = setup({ login: () => throwError(() => new Error('Boom')) });
    store.login({ credentials: { email: 'a', password: 'b' } });

    store.clearMessages();

    expect(store.error()).toBeNull();
  });

  it('logs out, clears storage and returns to login', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    const { store, router } = setup({});

    store.logout();
    TestBed.tick();

    expect(store.isAuthenticated()).toBe(false);
    expect(stored()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});
