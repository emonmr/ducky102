import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from './core/state/auth.store';
import { ThemeStore } from './core/state/theme.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'Ducky102';
  protected readonly theme = inject(ThemeStore);
  protected readonly auth = inject(AuthStore);
}
