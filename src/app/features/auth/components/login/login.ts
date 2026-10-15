import { Component, inject, input, OnInit, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/state/auth.store';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-login',
  imports: [AuthCard, FormField, FormRoot, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  protected readonly store = inject(AuthStore);

  /** Set by `authGuard` when it bounced the user here (bound from the query string). */
  readonly returnUrl = input<string>();

  protected readonly showPassword = signal(false);

  protected readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(
    this.model,
    (s) => {
      required(s.email, { message: 'Email is required.' });
      email(s.email, { message: 'Enter a valid email address.' });
      required(s.password, { message: 'Password is required.' });
    },
    {
      submission: {
        action: async () => {
          this.store.login({ credentials: this.model(), returnUrl: this.returnUrl() });
        },
      },
    },
  );

  ngOnInit(): void {
    this.store.clearMessages();
  }
}
