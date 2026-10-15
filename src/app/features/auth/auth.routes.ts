import { Routes } from '@angular/router';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { ResetPassword } from './components/reset-password/reset-password';

/**
 * Auth pages. No feature store here: the session is app-wide state in `core/state/auth.store.ts`
 * (guards, the interceptor and the navbar all need it).
 */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login, title: 'Sign in' },
  { path: 'register', component: Register, title: 'Create account' },
  { path: 'forgot-password', component: ForgotPassword, title: 'Forgot password' },
  { path: 'reset-password', component: ResetPassword, title: 'Reset password' },
];
