# Ducky102

Angular 22 app (zoneless, standalone, OnPush by default) with NgRx SignalStore and Bootstrap 5.3, set up for Claude Code.

## Scripts
| Command | What it does |
|---|---|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Production build |
| `npm run test:ci` | Unit tests (Vitest), single run |
| `npm run lint` / `lint:fix` | ESLint (angular-eslint, incl. template a11y) |
| `npm run typecheck` | TypeScript, app + specs |
| `npm run format` | Prettier |
| `npm run verify` | All of the above — run before committing |

## Structure
```
src/app/
  core/       http/ (ApiService, interceptor), state/ (app-wide stores)
  shared/     presentational components (DataTable)
  features/   lazy-loaded features — users/ is the reference implementation
src/styles/   _variables.scss (Bootstrap overrides), _mixins.scss, styles.scss
```

## Claude Code setup
| File | Purpose |
|---|---|
| `CLAUDE.md` | Project context loaded every session (keep < 150 lines) |
| `CLAUDE.local.md` | Personal preferences (git-ignored) |
| `.claude/settings.json` | Permissions (allow / ask / deny) and hooks |
| `.claude/hooks/` | Protect files · ESLint+Prettier after each edit · type-check (incl. templates) on stop |
| `.claude/skills/` | `/new-feature`, `/signal-store`, `/angular-component`, `/bootstrap-layout` (project-specific) and `/angular-developer` (official, vendored from [angular/skills](https://github.com/angular/skills) @ `92e5aa8`) |
| `.mcp.json` | Angular CLI MCP (docs, best practices), Playwright MCP, GitHub MCP (needs `GITHUB_PERSONAL_ACCESS_TOKEN` env var) |

Tips: plan before big features (Shift+Tab → Plan mode), `/clear` between unrelated tasks, `/compact` around half context,
reference files with `@path` instead of describing them.
