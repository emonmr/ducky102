import { defineConfig, devices } from '@playwright/test';

// The only Node global used here; avoids pulling in @types/node just for this.
declare const process: { env: Record<string, string | undefined> };

/**
 * End-to-end tests (Playwright). Unit tests stay in `src/**\/*.spec.ts` (Vitest via `ng test`);
 * e2e specs live in `e2e/` so the two runners never pick up each other's files.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Starts `ng serve` for the run, or reuses one you already have open locally.
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
