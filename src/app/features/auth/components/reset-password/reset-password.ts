import { Component, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, required, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/state/auth.store';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-reset-password',
  imports: [AuthCard, FormField, FormRoot, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  protected readonly store = inject(AuthStore);

  /** Token from the reset email link (`?token=…`), bound from the query string. */
  readonly token = input<string>();

  protected readonly model = signal({ password: '', confirmPassword: '' });
  protected readonly resetForm = form(
    this.model,
    (s) => {
      required(s.password, { message: 'Password is required.' });
      minLength(s.password, 8, { message: 'Use at least 8 characters.' });
      required(s.confirmPassword, { message: 'Confirm your password.' });
      validate(s.confirmPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(s.password)
          ? { kind: 'mismatch', message: 'Passwords do not match.' }
          : undefined,
      );
    },
    {
      submission: {
        action: async () => {
          this.store.resetPassword({ token: this.token() ?? '', password: this.model().password });
        },
      },
    },
  );

  ngOnInit(): void {
    this.store.clearMessages();
  }
}
