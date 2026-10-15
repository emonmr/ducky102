---
name: signal-store
description: Create or modify an NgRx SignalStore in this Angular 22 app (feature store or app-wide store), including its spec. Use when adding state, async loading, CRUD methods, or derived/computed state.
argument-hint: "<store purpose, e.g. 'cart store with add, remove, clear'>"
---

# NgRx SignalStore

Task: $ARGUMENTS

Read @src/app/features/users/state/users.store.ts and @src/app/features/users/state/users.store.spec.ts first and mirror them exactly.

## Where it goes
| Scope | File | Provided |
|---|---|---|
| One feature | `src/app/features/<feature>/state/<feature>.store.ts` | route `providers: [XStore]` in `<feature>.routes.ts` (omit `providedIn`) |
| App-wide / cross-feature | `src/app/core/state/<name>.store.ts` | `signalStore({ providedIn: 'root' }, ...)` |
| One component only | — | use `signal()` in the component, or `providers: [XStore]` on that component |

## Shape (in this order)
1. `interface XState { ... }` — always include `loading: boolean; error: string | null` when there's async work
2. `const initialState: XState = { ... }`
3. `export const XStore = signalStore(withState(initialState), withComputed(...), withMethods(...), withHooks(...)?)`

## Rules
- State updates ONLY via `patchState(store, partial)` or `patchState(store, (s) => ({...}))` — never mutate arrays
- Derived values go in `withComputed` — components never filter/map store data themselves
- Inject dependencies as default params: `withMethods((store, api = inject(XApiService)) => ({ ... }))`
- Async methods use `rxMethod<T>(pipe(...))` + `tapResponse({ next, error })` from `@ngrx/operators`
- Flattening operator by intent:
  - `exhaustMap` — loads/refreshes (ignore repeats while in-flight)
  - `switchMap` — search/typeahead (latest wins)
  - `mergeMap` — independent mutations (delete/update different items)
  - `concatMap` — ordered mutations that must not overlap
- Set `loading: true, error: null` at start; `loading: false` in both `next` and `error`
- Errors arrive as `Error` (normalized by `core/http/http-error.interceptor.ts`) — store `err.message`
- Use `withHooks({ onInit })` for effects/initial loads that belong to the store, not the component
- Need entity collections at scale? `withEntities()` from `@ngrx/signals/entities` (already installed)

## Spec (required)
- `TestBed.configureTestingModule({ providers: [XStore, { provide: XApiService, useValue: mock }] })`
- Mock API methods return `of(...)` / `throwError(() => new Error('...'))` so rxMethods run synchronously
- Cover: successful load, error path, each computed, each mutation

## Done when
`ng test --watch=false --include=**/<name>.store.spec.ts` passes and `ng lint` is clean.
