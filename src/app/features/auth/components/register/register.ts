import { Component, inject, OnInit, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/state/auth.store';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-register',
  imports: [AuthCard, FormField, FormRoot, RouterLink],
  templateUrl: './register.html',
})
export class Register implements OnInit {
  protected readonly store = inject(AuthStore);

  protected readonly model = signal({ name: '', email: '', password: '', confirmPassword: '' });
  protected readonly registerForm = form(
    this.model,
    (s) => {
      required(s.name, { message: 'Name is required.' });
      required(s.email, { message: 'Email is required.' });
      email(s.email, { message: 'Enter a valid email address.' });
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
          const { name, email, password } = this.model();
          this.store.register({ name, email, password });
        },
      },
    },
  );

  ngOnInit(): void {
    this.store.clearMessages();
  }
}
