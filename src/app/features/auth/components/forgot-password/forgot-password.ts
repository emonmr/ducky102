import { Component, inject, OnInit, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/state/auth.store';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-forgot-password',
  imports: [AuthCard, FormField, FormRoot, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword implements OnInit {
  protected readonly store = inject(AuthStore);

  protected readonly model = signal({ email: '' });
  protected readonly forgotForm = form(
    this.model,
    (s) => {
      required(s.email, { message: 'Email is required.' });
      email(s.email, { message: 'Enter a valid email address.' });
    },
    {
      submission: {
        action: async () => {
          this.store.forgotPassword(this.model());
        },
      },
    },
  );

  ngOnInit(): void {
    this.store.clearMessages();
  }
}
