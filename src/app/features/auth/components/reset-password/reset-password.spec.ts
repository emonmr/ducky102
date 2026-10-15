import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let fixture: ComponentFixture<ResetPassword>;
  const resetPassword = vi.fn(() => of('Your password has been reset.'));
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

  async function render(token: string): Promise<void> {
    fixture = TestBed.createComponent(ResetPassword);
    fixture.componentRef.setInput('token', token);
    await fixture.whenStable();
  }

  beforeEach(() => {
    resetPassword.mockClear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthApiService, useValue: { resetPassword } }],
    });
  });

  it('shows an invalid-link message when the token is missing', async () => {
    await render('');

    expect(el().querySelector('form')).toBeNull();
    expect(el().textContent).toContain('invalid or incomplete');
  });

  it('does not submit mismatched passwords', async () => {
    await render('abc');
    type('#reset-password', 'password123');
    type('#reset-confirm', 'password124');
    await submit();

    expect(resetPassword).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Passwords do not match.');
  });

  it('resets the password with the token and shows the confirmation', async () => {
    await render('abc');
    type('#reset-password', 'password123');
    type('#reset-confirm', 'password123');
    await submit();

    expect(resetPassword).toHaveBeenCalledWith({ token: 'abc', password: 'password123' });
    expect(el().textContent).toContain('Your password has been reset.');
  });
});
