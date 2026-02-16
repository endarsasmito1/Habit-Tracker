import { test, expect } from '@playwright/test';

test.describe('Suite 2: Navigation & Layout', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('1. Sidebar renders all nav items', async ({ page }) => {
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();
        // Check nav items exist in sidebar links
        for (const item of ['Dashboard', 'Calendar', 'Habits', 'Analytics', 'AI Insights']) {
            await expect(sidebar.locator(`a`, { hasText: item })).toBeVisible();
        }
    });

    test('2. Navigate to each page', async ({ page }) => {
        const pages = [
            { name: 'Calendar', url: '/calendar' },
            { name: 'Habits', url: '/habits' },
            { name: 'Dashboard', url: '/dashboard' },
        ];

        for (const p of pages) {
            await page.locator('aside a', { hasText: p.name }).click();
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(new RegExp(p.url));
        }
    });

    test('3. Active nav item highlighted', async ({ page }) => {
        await page.locator('aside a', { hasText: 'Habits' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/habits/);

        const habitsLink = page.locator('aside a', { hasText: 'Habits' });
        await expect(habitsLink).toHaveClass(/bg-primary/);
    });

    test('4. User profile in sidebar', async ({ page }) => {
        const sidebar = page.locator('aside');
        const profileSection = sidebar.locator('a[href="/profile"]');
        await expect(profileSection).toBeVisible();
    });

    test('5. New Habit button opens modal', async ({ page }) => {
        // The sidebar "New Habit" button
        await page.locator('aside button', { hasText: 'New Habit' }).click();
        await expect(page.getByText('Create New Habit')).toBeVisible({ timeout: 3000 });
    });

    test('6. Root redirects to /dashboard', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('7. Browser back/forward works', async ({ page }) => {
        await page.locator('aside a', { hasText: 'Habits' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/habits/);

        await page.goBack();
        await expect(page).toHaveURL(/\/dashboard/);

        await page.goForward();
        await expect(page).toHaveURL(/\/habits/);
    });

    test('8. Deep link works', async ({ page }) => {
        await page.goto('/habits');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/habits/);
    });
});
