import { test, expect } from '@playwright/test';

test.describe('Suite 18: Responsive & Mobile', () => {
    test.describe('Mobile viewport (375px)', () => {
        test.use({ viewport: { width: 375, height: 812 } });

        test('1. Sidebar hidden on mobile', async ({ page }) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');

            const sidebar = page.locator('aside');
            await expect(sidebar).not.toBeVisible();
        });

        test('2. Mobile header visible', async ({ page }) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');

            // Mobile header has hamburger menu and is md:hidden
            const mobileHeader = page.locator('header.md\\:hidden').first();
            await expect(mobileHeader).toBeVisible();
        });

        test('3. Dashboard renders on mobile', async ({ page }) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toBeVisible();
        });

        test('4. Habits page renders on mobile', async ({ page }) => {
            await page.goto('/habits');
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toBeVisible();
        });

        test('5. Habit detail page renders on mobile', async ({ page, request }) => {
            const habit = await (await request.post('http://localhost:3000/api/habits', {
                data: { name: `Mobile ${Date.now()}`, category: 'General', frequency: 'daily' },
            })).json();

            await page.goto(`/habits/${habit.id}`);
            await page.waitForLoadState('networkidle');
            await expect(page.getByText(habit.name)).toBeVisible();
        });

        test('6. Calendar renders on mobile', async ({ page }) => {
            await page.goto('/calendar');
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toBeVisible();
        });
    });

    test.describe('Tablet viewport (768px)', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('7. Layout adapts to tablet', async ({ page }) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toBeVisible();
        });

        test('8. Habits page on tablet', async ({ page }) => {
            await page.goto('/habits');
            await page.waitForLoadState('networkidle');
            await expect(page.locator('main')).toBeVisible();
        });
    });
});
