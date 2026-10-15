import { Routes } from '@angular/router';
import { UserList } from './components/user-list/user-list';
import { UsersStore } from './state/users.store';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    // Feature-scoped store: one instance shared by every component under this route.
    providers: [UsersStore],
    children: [{ path: '', component: UserList, title: 'Users' }],
  },
];
