import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'auth',
    canMatch: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'users',
    canMatch: [authGuard],
    loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  { path: '**', redirectTo: 'users' },
];
