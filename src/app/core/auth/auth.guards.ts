import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';

/**
 * Lets signed-in users through; everyone else goes to the login page with a `returnUrl` so they
 * come back here afterwards. `canMatch` means the guarded lazy chunk isn't even downloaded.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  if (inject(AuthStore).isAuthenticated()) return true;

  const returnUrl = '/' + segments.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
};

/** Keeps signed-in users out of the login/register pages. */
export const guestGuard: CanMatchFn = () =>
  inject(AuthStore).isAuthenticated() ? inject(Router).createUrlTree(['/users']) : true;
