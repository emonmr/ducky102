import { Component, input, output } from '@angular/core';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  readonly user = input.required<User>();
  readonly selected = input(false);
  readonly view = output<User['id']>();
  readonly remove = output<User['id']>();
}
