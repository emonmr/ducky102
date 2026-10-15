import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { Register } from './register';

describe('Register', () => {
  let fixture: ComponentFixture<Register>;
  const register = vi.fn(() =>
    of({ token: 't', user: { id: 2, name: 'Ada', email: 'ada@example.com' } }),
  );
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

  function fillValid(confirm = 'password123'): void {
    type('#register-name', 'Ada');
    type('#register-email', 'ada@example.com');
    type('#register-password', 'password123');
    type('#register-confirm', confirm);
  }

  beforeEach(async () => {
    localStorage.clear();
    register.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: AuthApiService, useValue: { register } },
      ],
    });
    fixture = TestBed.createComponent(Register);
    await fixture.whenStable();
  });

  it('does not submit an empty form', async () => {
    await submit();

    expect(register).not.toHaveBeenCalled();
    expect(el().querySelectorAll('.invalid-feedback').length).toBe(4);
  });

  it('rejects mismatched passwords', async () => {
    fillValid('different');
    await submit();

    expect(register).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Passwords do not match.');
  });

  it('registers without sending the confirmation field', async () => {
    fillValid();
    await submit();

    expect(register).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
    });
  });
});
