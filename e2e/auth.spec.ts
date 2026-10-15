import { expect, Page, test } from '@playwright/test';

/*
 * Auth flows against the dev-only mock backend (src/app/core/http/mock-auth.interceptor.ts).
 * Its user list is in-memory, so every page load starts from the seeded demo account, and each
 * test gets a fresh browser context (empty localStorage) — tests don't depend on each other.
 */

const DEMO = { email: 'demo@ducky.dev', password: 'password123' };

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('sign in', () => {
  test('redirects anonymous visitors to login, then back after signing in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login?returnUrl=%2Fusers');

    await signIn(page, DEMO.email, DEMO.password);

    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('navigation').getByText('Demo User')).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.goto('/auth/login');

    await signIn(page, DEMO.email, 'not-the-password');

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
    await expect(page).toHaveURL('/auth/login');
  });

  test('validates fields before submitting', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });

  test('keeps the session across reloads and signs out', async ({ page }) => {
    await page.goto('/auth/login');
    await signIn(page, DEMO.email, DEMO.password);
    await expect(page).toHaveURL('/users');

    await page.reload();
    await expect(page).toHaveURL('/users');

    // Signed-in users can't reach the auth pages.
    await page.goto('/auth/login');
    await expect(page).toHaveURL('/users');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});

test.describe('register', () => {
  test('creates an account and signs the user in', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel('Name').fill('Grace Hopper');
    await page.getByLabel('Email').fill('grace@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('navigation').getByText('Grace Hopper')).toBeVisible();
  });

  test('rejects an email that is already registered', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel('Name').fill('Someone');
    await page.getByLabel('Email').fill(DEMO.email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('alert')).toHaveText('An account with this email already exists.');
  });

  test('flags mismatched passwords', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm password').fill('password999');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('Passwords do not match.')).toBeVisible();
    await expect(page).toHaveURL('/auth/register');
  });
});

test.describe('password reset', () => {
  test('requests a reset link', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/auth/forgot-password');

    await page.getByLabel('Email').fill(DEMO.email);
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByRole('status')).toContainText('a reset link is on its way');
  });

  test('sets a new password from a reset link, which then works for sign in', async ({ page }) => {
    await page.goto('/auth/reset-password?token=abc');

    await page.getByLabel('New password', { exact: true }).fill('brand-new-pass');
    await page.getByLabel('Confirm new password').fill('brand-new-pass');
    await page.getByRole('button', { name: 'Reset password' }).click();
    await expect(page.getByRole('status')).toHaveText('Your password has been reset.');

    // Client-side navigation keeps the mock's in-memory state, so the new password applies.
    await page.getByRole('main').getByRole('link', { name: 'Sign in', exact: true }).click();
    await signIn(page, DEMO.email, 'brand-new-pass');
    await expect(page).toHaveURL('/users');
  });

  test('explains when the reset link has no token', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await expect(page.getByRole('alert')).toContainText('invalid or incomplete');
  });
});
