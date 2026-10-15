# Ducky102 — Claude Code Context

## Stack
- Angular 22: standalone, zoneless and `OnPush` are all framework DEFAULTS — don't restate them
- NgRx SignalStore (`@ngrx/signals`) for all shared/feature state
- Bootstrap 5.3 via SCSS + Bootstrap Icons — NO Angular Material, NO Tailwind, NO CDK
- RxJS for async; convert to signals at the component boundary (`toSignal()` / stores)
- Vitest via `ng test`; ESLint (angular-eslint) + Prettier; TypeScript strict + strictTemplates

## Project Layout
- `src/app/core/` — app-wide singletons: `http/` (base `ApiService`, interceptors), `state/` (root stores)
- `src/app/shared/components/` — presentational, reusable, no store injection
- `src/app/features/<name>/` — lazy-loaded: `components/ models/ services/ state/ <name>.routes.ts`
- `src/styles/` — `_variables.scss` (Bootstrap overrides), `_mixins.scss`, `styles.scss` (global entry)
- Reference feature to copy patterns from: @src/app/features/users/
- npm scripts: @package.json

## Commands (never use watch mode)
- Build: `ng build`
- Unit tests: `ng test --watch=false` · single file: `ng test --watch=false --include=**/users.store.spec.ts`
- Lint: `ng lint` · Type check: `npm run typecheck`
- Everything (format, lint, types, tests, build): `npm run verify`
- Scaffold: `ng generate component features/<name>/components/<thing>` (generates CLI-style names)

## Angular Rules
- NEVER write `standalone: true`, `changeDetection: OnPush`, or import `zone.js` — all defaults/obsolete
- NEVER use `ChangeDetectionStrategy.Eager` (the old "Default")
- `inject()` only — never constructor injection
- `input()` / `input.required()` / `output()` / `model()` — never `@Input` / `@Output` / `EventEmitter`
- Services: `@Service()` decorator — not `@Injectable({ providedIn: 'root' })`
- Templates: built-in control flow (`@if`, `@for` with `track`, `@switch`); `@defer` for non-critical UI
- Simple reactive GETs: `httpResource()`; mutations and anything a store owns: `ApiService` + `rxMethod`
- Feature HTTP services wrap `core/http/api.service.ts` — never inject `HttpClient` in features
- Components are thin: no business logic, no HTTP — read from stores, call store methods
- Separate `.html` template files; inline templates only for trivial (< ~5 line) components
- Accessibility is linted: interactive elements must be `<button>`/`<a>` or keyboard-operable
- Forms: Signal Forms (`@angular/forms/signals`) for new forms
- Official `angular-developer` skill = Angular API reference; where it conflicts with THIS file
  (e.g. Tailwind, state in services), this file wins — styling is Bootstrap, shared state is SignalStore

## State Management Rules
- Component-local UI state → `signal()` in the component
- Feature state → `features/<name>/state/<name>.store.ts`, provided in the feature's route `providers`
- App-wide state → `core/state/<name>.store.ts` with `{ providedIn: 'root' }`
- Pattern: @src/app/features/users/state/users.store.ts — `withState` → `withComputed` → `withMethods`
- Update only via `patchState()`; never mutate state objects/arrays
- Async in `rxMethod` + `tapResponse`; set `loading`/`error` explicitly
- Every store gets a spec (mock the API service — see `users.store.spec.ts`)

## Bootstrap 5 Rules
- Layout/spacing/colors: Bootstrap utility classes in templates — no custom CSS for these
- Use theme-aware classes (`text-body-secondary`, `bg-body-tertiary`, `text-bg-*`) — dark mode is on
- Component `.scss` only for what utilities can't do; start with `@import 'mixins';` for variables/mixins
- Full Bootstrap is imported ONCE in `src/styles/styles.scss` — never import `bootstrap/scss/bootstrap` elsewhere
- Token changes (colors, radius, fonts) go in `src/styles/_variables.scss`
- Icons: `<i class="bi bi-<name>" aria-hidden="true"></i>`; icon-only buttons need `aria-label`
- Don't use Bootstrap's JS bundle; build interactive behavior (modals, dropdowns) with Angular signals

## File Naming (Angular CLI v20+ style)
- Component: `user-list/user-list.ts` (+ `.html`, `.scss`, `.spec.ts`), class `UserList` — no `.component` suffix
- Store: `users.store.ts` → `UsersStore` · Service: `user-api.service.ts` → `UserApiService`
- Model: `user.model.ts` · Routes: `users.routes.ts` exporting `USERS_ROUTES`

## Workflow
- Non-trivial features: plan first (Plan mode), get approval, then build store → service → components → routes
- `/new-feature` skill walks through that sequence; other skills: `/signal-store`, `/angular-component`,
  `/bootstrap-layout`, `/angular-developer` (official Angular team skill — read its references/ before using unfamiliar APIs)
- Hooks auto-run ESLint --fix + Prettier on every edit and type-check (incl. templates) on stop —
  don't hand-format, and fix any errors the hooks report before moving on
- Angular CLI MCP is available: prefer its docs/best-practices search over guessing at Angular APIs

## Git
- Branches: `feature/<ticket>-short-description`; never commit directly to `main`/`master`
- Run `npm run verify` before committing

## IMPORTANT
- Never install, upgrade or remove npm packages without the user's explicit OK
- Never edit `.env*`, `*.generated.ts`, `package-lock.json`, `dist/`, `.angular/` (hooks will block it)
- Never use NgModules
