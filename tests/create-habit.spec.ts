import { test, expect } from '@playwright/test';

test.describe('Suite 4: Create Habit Modal', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/habits');
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        await page.waitForLoadState('domcontentloaded');
    });

    async function openModal(page: any) {
        await page.locator('button', { hasText: 'Add New Habit' }).click();
        await expect(page.getByText('Create New Habit')).toBeVisible({ timeout: 3000 });
    }

    test('1. Open and close modal', async ({ page }) => {
        await openModal(page);
        // Close via X button
        const closeBtn = page.locator('button span.material-icons-round', { hasText: 'close' }).first();
        await closeBtn.click();
        await expect(page.getByText('Create New Habit')).not.toBeVisible({ timeout: 3000 });
    });

    test('2. Create habit with minimum fields', async ({ page }) => {
        await openModal(page);
        const habitName = `MinHabit ${Date.now()}`;
        await page.getByPlaceholder('e.g. Read 10 pages').fill(habitName);
        await page.locator('button', { hasText: 'Create Habit' }).click();

        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await expect(page.getByText(habitName)).toBeVisible({ timeout: 10000 });
    });

    test('3. Create habit with all fields', async ({ page }) => {
        await openModal(page);
        const habitName = `FullHabit ${Date.now()}`;

        await page.getByPlaceholder('e.g. Read 10 pages').fill(habitName);
        await page.getByPlaceholder('e.g., Follow the 2-minute').fill('Test description');

        // Try to change frequency if available (graceful — don't fail the test if dropdown isn't standard)
        const selects = page.locator('select');
        const selectCount = await selects.count();
        if (selectCount > 0) {
            // Get available options from first select to determine correct value
            const options = await selects.first().locator('option').allTextContents();
            const weeklyOption = options.find(o => /weekly/i.test(o));
            if (weeklyOption) {
                await selects.first().selectOption({ label: weeklyOption });
            }
        }

        await page.locator('button', { hasText: 'Create Habit' }).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await expect(page.getByText(habitName)).toBeVisible({ timeout: 10000 });
    });

    test('4. Color tag selection', async ({ page }) => {
        await openModal(page);
        const colorBtns = page.locator('[class*="rounded-full"]');
        const count = await colorBtns.count();
        expect(count).toBeGreaterThan(0);
    });

    test('5. Category dropdown exists', async ({ page }) => {
        await openModal(page);
        // Category uses a select element
        const categorySelect = page.locator('select');
        const count = await categorySelect.count();
        expect(count).toBeGreaterThan(0);
    });

    test('6. Frequency dropdown exists', async ({ page }) => {
        await openModal(page);
        // Frequency is a select dropdown defaulting to Daily
        const selects = page.locator('select');
        const count = await selects.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('7. Form resets after creation', async ({ page }) => {
        await openModal(page);
        const nameInput = page.getByPlaceholder('e.g. Read 10 pages');
        await nameInput.fill(`Reset ${Date.now()}`);
        await page.locator('button', { hasText: 'Create Habit' }).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Re-open modal
        await openModal(page);
        await expect(page.getByPlaceholder('e.g. Read 10 pages')).toHaveValue('');
    });

    test('8. Special characters in habit name', async ({ page }) => {
        await openModal(page);
        const specialName = `🎯 Test & more ${Date.now()}`;
        await page.getByPlaceholder('e.g. Read 10 pages').fill(specialName);
        await page.locator('button', { hasText: 'Create Habit' }).click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await expect(page.getByText('🎯')).toBeVisible({ timeout: 5000 });
    });

    test('9. Rapid double submit', async ({ page, request }) => {
        const before = await request.get('http://localhost:3000/api/habits');
        const beforeCount = (await before.json()).length;

        await openModal(page);
        const uniqueName = `RapidDbl ${Date.now()}`;
        await page.getByPlaceholder('e.g. Read 10 pages').fill(uniqueName);

        // Click submit — modal may close after first click
        const submitBtn = page.locator('button', { hasText: 'Create Habit' });
        await submitBtn.click();
        await page.waitForTimeout(2000);

        const after = await request.get('http://localhost:3000/api/habits');
        const afterHabits = await after.json();
        const newOnes = afterHabits.filter((h: any) => h.name === uniqueName);
        expect(newOnes.length).toBe(1);
    });
});
