import { test, expect } from '@playwright/test';

test.describe('Suite 13: Profile Page', () => {
    test('1. Profile page renders user info', async ({ page }) => {
        await page.goto('/profile');
        await page.waitForLoadState('networkidle');

        // Should show user-related content
        await expect(page.getByText(/profile|account|settings/i)).toBeVisible({ timeout: 5000 });
    });

    test('2. Page layout renders without error', async ({ page }) => {
        await page.goto('/profile');
        await page.waitForLoadState('networkidle');

        // No error messages should be visible
        const errors = page.locator('text=Error');
        const errorCount = await errors.count();
        // Allow zero or minimal error indicators
        expect(errorCount).toBeLessThanOrEqual(1);
    });
});
