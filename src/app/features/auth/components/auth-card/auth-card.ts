import { Component, input } from '@angular/core';

/** Centered card shell shared by every auth page. Project the form as content, links into `[authFooter]`. */
@Component({
  selector: 'app-auth-card',
  templateUrl: './auth-card.html',
})
export class AuthCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
