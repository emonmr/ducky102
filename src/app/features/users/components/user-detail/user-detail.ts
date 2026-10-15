import { Component, input, output } from '@angular/core';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.html',
})
export class UserDetail {
  readonly user = input.required<User>();
  readonly closed = output();
}
