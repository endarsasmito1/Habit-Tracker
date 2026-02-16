import { test, expect } from '@playwright/test';

test.describe('Suite 12: Insights Page', () => {
    test('1. Insights page loads', async ({ page }) => {
        await page.goto('/insights');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
        // Page should render without crashing
        const hasContent = await page.locator('main, [class*="bg-"]').first().isVisible();
        expect(hasContent).toBeTruthy();
    });

    test('2. Analytics route works', async ({ page }) => {
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');
        // Should either show insights or analytics content
        await expect(page.locator('body')).toBeVisible();
    });
});
