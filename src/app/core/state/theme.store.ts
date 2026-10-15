import { DOCUMENT, effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

export type ColorMode = 'light' | 'dark';

interface ThemeState {
  mode: ColorMode;
}

const STORAGE_KEY = 'color-mode';

function readStoredMode(): ColorMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** App-wide color mode, applied through Bootstrap 5.3's `data-bs-theme` attribute. */
export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<ThemeState>(() => ({ mode: readStoredMode() })),
  withMethods((store) => ({
    toggle(): void {
      patchState(store, { mode: store.mode() === 'light' ? 'dark' : 'light' });
    },
  })),
  withHooks({
    onInit(store, document = inject(DOCUMENT)) {
      effect(() => {
        const mode = store.mode();
        document.documentElement.setAttribute('data-bs-theme', mode);
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch {
          // Storage unavailable (private mode) — the theme still applies for this session.
        }
      });
    },
  }),
);
