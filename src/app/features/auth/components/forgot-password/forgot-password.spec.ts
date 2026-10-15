import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;
  const forgotPassword = vi.fn(() => of('Check your inbox.'));
  const el = () => fixture.nativeElement as HTMLElement;

  async function submit(): Promise<void> {
    el()
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    forgotPassword.mockClear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthApiService, useValue: { forgotPassword } }],
    });
    fixture = TestBed.createComponent(ForgotPassword);
    await fixture.whenStable();
  });

  it('does not submit without a valid email', async () => {
    await submit();

    expect(forgotPassword).not.toHaveBeenCalled();
    expect(el().querySelector('.invalid-feedback')).not.toBeNull();
  });

  it('requests a reset link and replaces the form with the confirmation', async () => {
    const input = el().querySelector<HTMLInputElement>('#forgot-email')!;
    input.value = 'ada@example.com';
    input.dispatchEvent(new Event('input'));
    await submit();

    expect(forgotPassword).toHaveBeenCalledWith({ email: 'ada@example.com' });
    expect(el().querySelector('form')).toBeNull();
    expect(el().textContent).toContain('Check your inbox.');
  });
});
