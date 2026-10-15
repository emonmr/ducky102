import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';
import { UsersStore } from './users.store';

const users: User[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    username: 'ada',
    email: 'ada@example.com',
    phone: '',
    website: '',
    company: 'Analytical Engines',
    city: 'London',
    isActive: true,
  },
  {
    id: 2,
    name: 'Alan Turing',
    username: 'alan',
    email: 'alan@example.com',
    phone: '',
    website: '',
    company: 'Bletchley Park',
    city: 'Wilmslow',
    isActive: false,
  },
];

function setup(api: Partial<UserApiService>) {
  TestBed.configureTestingModule({
    providers: [UsersStore, { provide: UserApiService, useValue: api }],
  });
  return TestBed.inject(UsersStore);
}

describe('UsersStore', () => {
  it('loads users and derives counts', () => {
    const store = setup({ getAll: () => of(users) });

    store.loadUsers();

    expect(store.users()).toEqual(users);
    expect(store.loading()).toBe(false);
    expect(store.totalUsers()).toBe(2);
    expect(store.activeCount()).toBe(1);
  });

  it('stores the error message when loading fails', () => {
    const store = setup({ getAll: () => throwError(() => new Error('Boom')) });

    store.loadUsers();

    expect(store.error()).toBe('Boom');
    expect(store.loading()).toBe(false);
  });

  it('filters by query across name, email, company and city', () => {
    const store = setup({ getAll: () => of(users) });
    store.loadUsers();

    store.setQuery('bletchley');

    expect(store.filteredUsers().map((u) => u.id)).toEqual([2]);
  });

  it('deletes a user and clears the selection if it was selected', () => {
    const store = setup({ getAll: () => of(users), delete: () => of(undefined) });
    store.loadUsers();
    store.selectUser(1);

    store.deleteUser(1);

    expect(store.users().map((u) => u.id)).toEqual([2]);
    expect(store.selectedUser()).toBeNull();
  });
});
