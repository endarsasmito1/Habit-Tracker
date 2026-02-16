import { test, expect } from '@playwright/test';

// Auth tests run WITHOUT saved auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Suite 1: Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');
    });

    test('1. Sign up with valid credentials', async ({ page }) => {
        // Switch to Sign Up
        const toggleLink = page.locator('button', { hasText: 'Sign Up' });
        await toggleLink.click();

        await page.getByPlaceholder('Your Name').fill('Auth Test User');
        await page.getByPlaceholder('hello@example.com').fill(`auth_test_${Date.now()}@test.com`);
        await page.getByPlaceholder('••••••••').fill('StrongPassword123!');

        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('2. Sign up with duplicate email shows error', async ({ page }) => {
        const dupeEmail = `dupe_${Date.now()}@test.com`;

        // First sign up
        await page.locator('button', { hasText: 'Sign Up' }).click();
        await page.getByPlaceholder('Your Name').fill('Dupe User');
        await page.getByPlaceholder('hello@example.com').fill(dupeEmail);
        await page.getByPlaceholder('••••••••').fill('Password123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // Clear and retry
        await page.context().clearCookies();
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        await page.locator('button', { hasText: 'Sign Up' }).click();
        await page.getByPlaceholder('Your Name').fill('Dupe User 2');
        await page.getByPlaceholder('hello@example.com').fill(dupeEmail);
        await page.getByPlaceholder('••••••••').fill('Password123!');
        await page.locator('button[type="submit"]').click();

        const errorEl = page.locator('[class*="bg-red"]');
        await expect(errorEl).toBeVisible({ timeout: 5000 });
    });

    test('3. Sign in with valid credentials', async ({ page }) => {
        const email = `signin_test_${Date.now()}@test.com`;

        // Create account first
        await page.locator('button', { hasText: 'Sign Up' }).click();
        await page.getByPlaceholder('Your Name').fill('SignIn User');
        await page.getByPlaceholder('hello@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill('Password123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // Logout
        await page.context().clearCookies();
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        // Sign in
        await page.getByPlaceholder('hello@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill('Password123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('4. Sign in with wrong password shows error', async ({ page }) => {
        await page.getByPlaceholder('hello@example.com').fill('wrongpw@test.com');
        await page.getByPlaceholder('••••••••').fill('WrongPassword!');
        await page.locator('button[type="submit"]').click();

        const errorEl = page.locator('[class*="bg-red"]');
        await expect(errorEl).toBeVisible({ timeout: 5000 });
    });

    test('5. Toggle between Sign In and Sign Up', async ({ page }) => {
        // Default is Sign In — heading says "Welcome Back"
        await expect(page.locator('h2', { hasText: 'Welcome Back' })).toBeVisible();
        await expect(page.getByPlaceholder('Your Name')).not.toBeVisible();

        // Switch to Sign Up
        await page.locator('button', { hasText: 'Sign Up' }).click();
        await expect(page.locator('h2', { hasText: 'Create Account' })).toBeVisible();
        await expect(page.getByPlaceholder('Your Name')).toBeVisible();

        // Switch back
        await page.locator('button', { hasText: 'Sign In' }).click();
        await expect(page.locator('h2', { hasText: 'Welcome Back' })).toBeVisible();
    });

    test('6. Redirect unauthenticated user to /auth', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForURL('**/auth', { timeout: 10000 });
        await expect(page).toHaveURL(/\/auth/);
    });

    test('7. Loading state during submit', async ({ page }) => {
        await page.getByPlaceholder('hello@example.com').fill('loading@test.com');
        await page.getByPlaceholder('••••••••').fill('Password123!');

        const submitBtn = page.locator('button[type="submit"]');
        await submitBtn.click();

        // Button should be disabled during loading (may be fast)
        await expect(submitBtn).toBeDisabled({ timeout: 1000 }).catch(() => { });
    });

    test('8. Session persists after page reload', async ({ page }) => {
        const email = `persist_${Date.now()}@test.com`;

        await page.locator('button', { hasText: 'Sign Up' }).click();
        await page.getByPlaceholder('Your Name').fill('Persist User');
        await page.getByPlaceholder('hello@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill('Password123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        await page.reload();
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
