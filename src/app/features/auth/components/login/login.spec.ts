import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { AuthStore } from '../../../../core/state/auth.store';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  const login = vi.fn(() => of({ token: 't', user: { id: 1, name: 'Ada', email: 'a@b.co' } }));
  const el = () => fixture.nativeElement as HTMLElement;

  function type(selector: string, value: string): void {
    const input = el().querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    el()
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    login.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: AuthApiService, useValue: { login } },
      ],
    });
    fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('returnUrl', '/users');
    await fixture.whenStable();
  });

  it('renders email and password fields', () => {
    expect(el().querySelector('#login-email')).not.toBeNull();
    expect(el().querySelector('#login-password')).not.toBeNull();
  });

  it('does not submit an invalid form and shows field errors', async () => {
    await submit();

    expect(login).not.toHaveBeenCalled();
    expect(el().querySelectorAll('.invalid-feedback').length).toBe(2);
  });

  it('signs in with the entered credentials', async () => {
    type('#login-email', 'ada@example.com');
    type('#login-password', 'secret');
    await submit();

    expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'secret' });
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(true);
  });

  it('toggles password visibility', async () => {
    const toggle = el().querySelector<HTMLButtonElement>('button[aria-label="Show password"]')!;
    toggle.click();
    await fixture.whenStable();

    expect(el().querySelector<HTMLInputElement>('#login-password')!.type).toBe('text');
  });
});
