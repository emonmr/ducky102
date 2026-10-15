import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { httpErrorInterceptor } from './core/http/http-error.interceptor';
import { mockAuthInterceptor } from './core/http/mock-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        // Outermost first: errors are normalized last, so authInterceptor still sees raw 401s.
        httpErrorInterceptor,
        authInterceptor,
        // Fake auth backend until a real one exists — see mock-auth.interceptor.ts.
        ...(environment.production ? [] : [mockAuthInterceptor]),
      ]),
    ),
  ],
};
