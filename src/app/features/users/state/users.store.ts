import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, mergeMap, pipe, tap } from 'rxjs';
import { User } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';

export type UsersViewMode = 'cards' | 'table';

interface UsersState {
  users: User[];
  selectedUserId: User['id'] | null;
  query: string;
  viewMode: UsersViewMode;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUserId: null,
  query: '',
  viewMode: 'cards',
  loading: false,
  error: null,
};

/**
 * Feature-scoped store: provided in `users.routes.ts`, so its state lives only while the
 * users feature is active. Reference implementation for every other store in the app.
 */
export const UsersStore = signalStore(
  withState(initialState),

  withComputed(({ users, selectedUserId, query }) => ({
    selectedUser: computed(() => users().find((u) => u.id === selectedUserId()) ?? null),
    totalUsers: computed(() => users().length),
    activeCount: computed(() => users().filter((u) => u.isActive).length),
    filteredUsers: computed(() => {
      const q = query().trim().toLowerCase();
      if (!q) return users();
      return users().filter((u) =>
        [u.name, u.username, u.email, u.company, u.city].some((v) => v.toLowerCase().includes(q)),
      );
    }),
  })),

  withMethods((store, userApi = inject(UserApiService)) => ({
    selectUser(id: User['id']): void {
      patchState(store, { selectedUserId: id });
    },
    clearSelection(): void {
      patchState(store, { selectedUserId: null });
    },
    setQuery(query: string): void {
      patchState(store, { query });
    },
    setViewMode(viewMode: UsersViewMode): void {
      patchState(store, { viewMode });
    },

    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap(() =>
          userApi.getAll().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, loading: false }),
              error: (err: Error) => patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),

    deleteUser: rxMethod<User['id']>(
      pipe(
        mergeMap((id) =>
          userApi.delete(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, (state) => ({
                  users: state.users.filter((u) => u.id !== id),
                  selectedUserId: state.selectedUserId === id ? null : state.selectedUserId,
                })),
              error: (err: Error) => patchState(store, { error: err.message }),
            }),
          ),
        ),
      ),
    ),
  })),
);
