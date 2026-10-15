import { TestBed } from '@angular/core/testing';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { authGuard, guestGuard } from './auth.guards';

function setup(isAuthenticated: boolean) {
  TestBed.configureTestingModule({
    providers: [{ provide: AuthStore, useValue: { isAuthenticated: () => isAuthenticated } }],
  });
  return TestBed.inject(Router);
}

const snapshot = {} as Parameters<CanMatchFn>[2];
const segments = [new UrlSegment('users', {}), new UrlSegment('42', {})];

const runAuthGuard = () =>
  TestBed.runInInjectionContext(() => authGuard({} as Route, segments, snapshot));
const runGuestGuard = () =>
  TestBed.runInInjectionContext(() => guestGuard({} as Route, [], snapshot));

describe('authGuard', () => {
  it('allows signed-in users', () => {
    setup(true);
    expect(runAuthGuard()).toBe(true);
  });

  it('redirects anonymous users to login with a returnUrl', () => {
    const router = setup(false);
    const result = runAuthGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/auth/login?returnUrl=%2Fusers%2F42');
  });
});

describe('guestGuard', () => {
  it('allows anonymous users', () => {
    setup(false);
    expect(runGuestGuard()).toBe(true);
  });

  it('redirects signed-in users to the app', () => {
    const router = setup(true);
    expect(router.serializeUrl(runGuestGuard() as UrlTree)).toBe('/users');
  });
});
