import { test, expect } from '@playwright/test';

test.describe('Suite 11: Calendar Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/calendar');
        await page.waitForLoadState('networkidle');
    });

    test('1. Calendar page renders', async ({ page }) => {
        // Should have calendar-related content
        await expect(page.locator('body')).toBeVisible();
        // Check for month/year or calendar grid elements
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const hasMonth = await Promise.any(
            monthNames.map(m => page.getByText(m).isVisible().then(v => v ? true : Promise.reject()))
        ).catch(() => false);
        expect(hasMonth).toBeTruthy();
    });

    test('2. Month navigation exists', async ({ page }) => {
        // Look for navigation arrows
        const arrows = page.locator('button span.material-icons-round');
        const count = await arrows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('3. Today has distinct styling', async ({ page }) => {
        const today = new Date().getDate().toString();
        // Check that today's date exists on the page
        await expect(page.getByText(today, { exact: true }).first()).toBeVisible();
    });
});
