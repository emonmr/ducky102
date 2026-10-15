---
name: angular-component
description: Create or refactor an Angular 22 component in this app (container/page or presentational) following project conventions — signal inputs/outputs, separate template, Bootstrap markup, spec. Use for any new component or component rewrite.
argument-hint: "<component name and purpose>"
---

# Angular Component

Task: $ARGUMENTS

## 1. Decide the kind
- **Container (page)** — lives in `features/<f>/components/`, injects the feature store, no `@Input`s from routes except via `withComponentInputBinding` (route params arrive as `input()`). Example: @src/app/features/users/components/user-list/user-list.ts
- **Presentational** — only `input()`/`output()`, no injected stores/services. Feature-specific → `features/<f>/components/`; reusable across features → `shared/components/`. Examples: @src/app/features/users/components/user-card/user-card.ts, @src/app/shared/components/data-table/data-table.ts

## 2. Scaffold with the CLI
```
ng generate component features/<feature>/components/<name>
```
This produces `<name>.ts/.html/.scss/.spec.ts` and class `<Name>` (no `Component` suffix). Delete the `.scss` and `styleUrl` if it stays empty.

## 3. Class rules
- Omit `standalone`, `changeDetection` — Angular 22 defaults are standalone + OnPush
- `readonly x = input<T>(default)` / `input.required<T>()`; `readonly y = output<T>()`; two-way: `model<T>()`
- Output names must not shadow DOM events (`select`, `click`, `change`, `close`...) — lint enforces; use `view`, `remove`, `closed`, `picked`
- Local UI state: `protected readonly open = signal(false)`; derived: `computed()`
- Template-only members are `protected`; `inject()` for DI
- Don't call methods in templates for derived data — use `computed()`
- Lifecycle: prefer `effect()`/store hooks; `ngOnInit` only to trigger a store load

## 4. Template rules
- `@if` / `@for (x of xs(); track x.id)` + `@empty` / `@switch`; `@defer` for heavy or below-the-fold UI
- Bootstrap utilities for all layout/spacing (see `/bootstrap-layout`); theme-aware text/bg classes
- Every clickable thing is a `<button type="button">` or `<a>`; icon-only buttons get `aria-label`
- Read DOM values with template refs (`#search` → `search.value`), never `$any($event.target)`

## 5. Spec
Use `TestBed.createComponent`, set inputs with `fixture.componentRef.setInput(...)`, `await fixture.whenStable()`, assert on rendered DOM. Containers: provide a stub store or mock the API service.

## Done when
`ng lint` and `ng test --watch=false --include=**/<name>.spec.ts` pass.
