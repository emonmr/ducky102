---
name: bootstrap-layout
description: Build or restyle UI with Bootstrap 5.3 in this Angular app — responsive grids, cards, forms, tables, modals/offcanvas without Bootstrap JS, dark-mode-safe colors, SCSS variable usage. Use for any layout, styling, or theming work.
argument-hint: "<what to lay out or style>"
---

# Bootstrap 5.3 Layout

Task: $ARGUMENTS

## Styling decision order
1. Bootstrap **utility classes** in the template (spacing `p-*`/`m-*`/`gap-*`, flex `d-flex`, grid `row`/`col-*`, `text-*`, `rounded-*`, `shadow-*`)
2. Bootstrap **components** (`card`, `list-group`, `badge`, `alert`, `table`, `form-control`, `input-group`, `btn-group`, `nav`, `placeholder`)
3. Only then component `.scss` — start with `@import 'mixins';` to get Bootstrap `$variables`, `media-breakpoint-up()` etc. and project mixins (`clickable`, `hover-lift`) from `src/styles/_mixins.scss`
4. App-wide token changes → `src/styles/_variables.scss` (before Bootstrap is imported)

Never import `bootstrap/scss/bootstrap` in a component — it duplicates all of Bootstrap per component (and blows the 4kB component-style budget).

## Responsive
- Mobile-first: `col-12 col-md-6 col-xl-4`; hide/show with `d-none d-md-block`
- Page wrapper: `<div class="container-fluid py-4">` (or `container` for reading-width pages)
- Use `g-3`/`g-4` gutters on `.row`, not margins on columns

## Dark mode (enabled via `data-bs-theme`, see `core/state/theme.store.ts`)
- Use `text-body`, `text-body-secondary`, `bg-body`, `bg-body-tertiary`, `border`, `text-bg-<color>`
- Avoid hard-coded `bg-white`, `text-dark`, `text-muted`, `table-dark` and hex colors in component SCSS; use `var(--bs-*)` CSS variables when needed

## Interactive components WITHOUT Bootstrap JS
Bootstrap's JS bundle is not installed. Build behavior with signals:
- Modal: `@if (open()) { <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">…</div><div class="modal-backdrop show"></div> }`, close on Escape (`(keydown.escape)`) and backdrop click; move focus into the dialog
- Dropdown / collapse / offcanvas: toggle a `signal<boolean>` and bind `[class.show]`
- Prefer native `<dialog>` when you need real focus trapping

## Icons & a11y
- `<i class="bi bi-<name>" aria-hidden="true"></i>` (Bootstrap Icons font is global)
- Icon-only buttons: `aria-label`; toggle buttons: `[attr.aria-pressed]`; loading: `spinner-border` + `visually-hidden` text
- Tables: `scope="col"`; sortable headers expose `aria-sort` (see `shared/components/data-table`)

## Done when
`ng build` shows no budget errors and `ng lint` (includes template a11y rules) is clean.
