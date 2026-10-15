---
name: new-feature
description: Build a complete lazy-loaded feature end-to-end (model, API service, SignalStore, components, routes, specs) using the plan-first workflow. Use when the user asks for a new page, section, or feature area.
argument-hint: "<feature name and requirements>"
disable-model-invocation: true
---

# New Feature — End-to-End

Feature request: $ARGUMENTS

Reference implementation to mirror throughout: @src/app/features/users/

## Step 1 — Plan first (stop for approval)
Produce a short plan and WAIT for the user to approve it before writing files:
- File tree under `src/app/features/<name>/`
- `models/<entity>.model.ts`: entity + DTO interfaces
- Store state shape, computed signals, methods (with the flattening operator for each async method)
- Component tree: which is the container, which are presentational, what goes in `@defer`
- Route path and how it's registered in `src/app/app.routes.ts`
- Any new npm package needed (requires explicit user OK)

## Step 2 — Model + API service
- `models/<entity>.model.ts`
- `services/<entity>-api.service.ts` with `@Service()`, wrapping `core/http/api.service.ts`; map DTO → model here

## Step 3 — Store
Follow the `/signal-store` skill. Feature store, provided in the route — no `providedIn`. Write its spec.

## Step 4 — Components
Follow the `/angular-component` and `/bootstrap-layout` skills. Scaffold with `ng generate component features/<name>/components/<thing>`.

## Step 5 — Routes
- `<name>.routes.ts` exports `<NAME>_ROUTES` with `providers: [<Name>Store]` on the parent route and `title` on pages
- Register in `src/app/app.routes.ts` via `loadChildren: () => import('./features/<name>/<name>.routes').then((m) => m.<NAME>_ROUTES)` — above the `**` wildcard
- Add a nav link in `src/app/app.html`

## Step 6 — Verify
Run `npm run verify` and fix everything it reports. Confirm `ng build` lists a separate lazy chunk for the feature. Summarize what was built and anything left open.
