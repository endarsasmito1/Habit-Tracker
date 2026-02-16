import { test, expect } from '@playwright/test';

test.describe('Suite 6: Habit Detail Page', () => {
    let habitId: string;
    let habitName: string;

    test.beforeAll(async ({ request }) => {
        habitName = `Detail Test ${Date.now()}`;
        const res = await request.post('http://localhost:3000/api/habits', {
            data: {
                name: habitName,
                category: 'Fitness',
                frequency: 'daily',
                description: 'A test habit for detail page',
                targetTime: '08:30',
                color: '#dcfce7',
            },
        });
        const habit = await res.json();
        habitId = habit.id;
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(`/habits/${habitId}`);
        await page.waitForLoadState('networkidle');
    });

    test('1. Page loads with correct data', async ({ page }) => {
        await expect(page.getByText(habitName)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Every Day', { exact: true })).toBeVisible();
        await expect(page.getByText('Fitness', { exact: true })).toBeVisible();
    });

    test('2. Back button navigates to list', async ({ page }) => {
        await page.locator('button', { has: page.locator('span', { hasText: 'arrow_back' }) }).click();
        await expect(page).toHaveURL(/\/habits$/);
    });

    test('3. Description displays', async ({ page }) => {
        await expect(page.getByText('ABOUT THIS HABIT')).toBeVisible();
        await expect(page.getByText('A test habit for detail page')).toBeVisible();
    });

    test('4. Habit Details sidebar', async ({ page }) => {
        await expect(page.getByText('Habit Details')).toBeVisible();
        await expect(page.getByText('CATEGORY')).toBeVisible();
        await expect(page.getByText('FREQUENCY')).toBeVisible();
        await expect(page.getByText('CURRENT STREAK')).toBeVisible();
    });

    test('5. Target time shows when set', async ({ page }) => {
        await expect(page.getByText(/TARGET TIME|target time/i)).toBeVisible();
        await expect(page.getByText('08:30:00', { exact: true })).toBeVisible();
    });

    test('6. Color tag shows', async ({ page }) => {
        await expect(page.getByText(/color/i).first()).toBeVisible();
    });

    test('7. Edit mode: toggle on and save name', async ({ page }) => {
        await page.getByRole('button', { name: 'Edit Habit' }).click();

        const nameInput = page.locator('input.text-3xl');
        await expect(nameInput).toBeVisible();

        const newName = `Edited ${Date.now()}`;
        await nameInput.fill(newName);
        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });
        // Update habitName for subsequent tests
        habitName = newName;
    });

    test('8. Edit mode: change description', async ({ page }) => {
        await page.getByRole('button', { name: 'Edit Habit' }).click();

        const descTextarea = page.locator('textarea');
        await descTextarea.fill('Updated description');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(page.getByText('Updated description')).toBeVisible({ timeout: 5000 });
    });

    test('9. Edit mode: cancel restores original', async ({ page }) => {
        const originalText = await page.locator('h2').first().textContent();

        await page.getByRole('button', { name: 'Edit Habit' }).click();
        const nameInput = page.locator('input.text-3xl');
        await nameInput.fill('Should Not Save');
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Original name should be back
        const currentText = await page.locator('h2').first().textContent();
        expect(currentText).toBe(originalText);
    });

    test('10. Pause habit toggle', async ({ page }) => {
        // Find the toggle
        const toggle = page.locator('button.rounded-full.inline-flex');
        await toggle.click();
        await page.waitForTimeout(500);

        // PAUSED badge should appear
        await expect(page.getByText('PAUSED')).toBeVisible();

        // Toggle off
        await toggle.click();
        await page.waitForTimeout(500);
        await expect(page.getByText('PAUSED')).not.toBeVisible();
    });

    test('11. Pause persists after reload', async ({ page }) => {
        const toggle = page.locator('button.rounded-full.inline-flex');
        await toggle.click();
        await page.waitForTimeout(500);
        await expect(page.getByText('PAUSED')).toBeVisible();

        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('PAUSED')).toBeVisible();

        // Clean up: unpause
        const toggle2 = page.locator('button.rounded-full.inline-flex');
        await toggle2.click();
    });

    test('12. Progress Score bar visible', async ({ page }) => {
        await expect(page.getByText('Progress Score')).toBeVisible();
        await expect(page.getByText('CONSISTENCY')).toBeVisible();
    });

    test('13. Past Logs empty state', async ({ page }) => {
        await expect(page.getByText('Past Logs')).toBeVisible();
        await expect(page.getByText('No logs recorded yet')).toBeVisible();
    });

    test('14. Past Logs with data', async ({ page, request }) => {
        // Create a check-in
        await request.post('http://localhost:3000/api/checkins', {
            data: {
                habitId,
                date: new Date().toISOString().split('T')[0],
                status: 'completed',
                notes: 'E2E test log',
                moodRating: '4',
            },
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Completed')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('E2E test log')).toBeVisible();
    });

    test('15. 404 for invalid habit ID', async ({ page }) => {
        await page.goto('/habits/nonexistent-uuid-here');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Habit not found')).toBeVisible({ timeout: 5000 });
    });

    test('16. Delete habit redirects to list', async ({ page, request }) => {
        // Create a disposable habit
        const res = await request.post('http://localhost:3000/api/habits', {
            data: { name: `Delete Detail ${Date.now()}`, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();

        await page.goto(`/habits/${habit.id}`);
        await page.waitForLoadState('networkidle');

        page.on('dialog', async dialog => await dialog.accept());
        await page.locator('button', { has: page.locator('span', { hasText: 'delete' }) }).last().click();

        await page.waitForURL(/\/habits$/, { timeout: 5000 });
        await expect(page).toHaveURL(/\/habits$/);
    });
});
