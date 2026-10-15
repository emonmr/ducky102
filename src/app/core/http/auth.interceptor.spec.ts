import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../state/auth.store';
import { authInterceptor } from './auth.interceptor';

function setup(token: string | null) {
  const auth = { token: () => token, logout: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: AuthStore, useValue: auth },
    ],
  });
  return {
    auth,
    http: TestBed.inject(HttpClient),
    backend: TestBed.inject(HttpTestingController),
  };
}

const api = (path: string) => `${environment.apiUrl}/${path}`;

describe('authInterceptor', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('adds the bearer token to API requests', () => {
    const { http, backend } = setup('abc');
    http.get(api('users')).subscribe();

    expect(backend.expectOne(api('users')).request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('never sends the token to other origins', () => {
    const { http, backend } = setup('abc');
    http.get('https://cdn.example.com/x.json').subscribe();

    expect(
      backend.expectOne('https://cdn.example.com/x.json').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('sends no header when signed out', () => {
    const { http, backend } = setup(null);
    http.get(api('users')).subscribe();

    expect(backend.expectOne(api('users')).request.headers.has('Authorization')).toBe(false);
  });

  it('logs out when the API rejects the token', () => {
    const { http, backend, auth } = setup('abc');
    http.get(api('users')).subscribe({ error: () => undefined });
    backend.expectOne(api('users')).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
  });

  it('does not log out on a failed login attempt', () => {
    const { http, backend, auth } = setup('abc');
    http.post(api('auth/login'), {}).subscribe({ error: () => undefined });
    backend.expectOne(api('auth/login')).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
