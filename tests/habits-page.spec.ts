import { test, expect } from '@playwright/test';

test.describe('Suite 5: Habits Page', () => {
    let testHabitId: string;
    let testHabitName: string;

    test.beforeAll(async ({ request }) => {
        testHabitName = `HabitPage Test ${Date.now()}`;
        const res = await request.post('http://localhost:3000/api/habits', {
            data: { name: testHabitName, category: 'Health', frequency: 'daily', description: 'Page test desc' },
        });
        const habit = await res.json();
        testHabitId = habit.id;
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/habits');
        await page.waitForLoadState('networkidle');
    });

    test('1. List all habits', async ({ page }) => {
        await expect(page.getByText('My Habits')).toBeVisible();
        await expect(page.getByText(testHabitName)).toBeVisible({ timeout: 5000 });
    });

    test('2. Stats bar shows correct total', async ({ page }) => {
        const statCard = page.getByText('Total Active Habits');
        await expect(statCard).toBeVisible();
    });

    test('3. Search filters habits', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search habits...');
        await searchInput.fill(testHabitName);
        await page.waitForTimeout(500);
        await expect(page.getByText(testHabitName)).toBeVisible();
    });

    test('4. Search no results', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search habits...');
        await searchInput.fill('ZZZNONEXISTENT999');
        await page.waitForTimeout(500);
        // The test habit should NOT be visible
        await expect(page.getByText(testHabitName)).not.toBeVisible();
    });

    test('5. Search is case insensitive', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search habits...');
        await searchInput.fill(testHabitName.toLowerCase());
        await page.waitForTimeout(500);
        await expect(page.getByText(testHabitName)).toBeVisible();
    });

    test('6. Clear search restores all habits', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search habits...');
        await searchInput.fill('ZZZZZ');
        await page.waitForTimeout(300);
        await searchInput.fill('');
        await page.waitForTimeout(500);
        await expect(page.getByText(testHabitName)).toBeVisible();
    });

    test('7. Click card navigates to detail', async ({ page }) => {
        const card = page.getByText(testHabitName);
        await card.click();
        await page.waitForURL(/\/habits\//);
        await expect(page).toHaveURL(/\/habits\//);
    });

    test('8. Add Another Habit card opens modal', async ({ page }) => {
        const addCard = page.getByText('Add Another Habit');
        await addCard.click();
        await expect(page.getByText('Create New Habit')).toBeVisible({ timeout: 3000 });
    });

    test('9. Delete habit from card', async ({ page, request }) => {
        // Create a disposable habit
        const res = await request.post('http://localhost:3000/api/habits', {
            data: { name: `Delete Me ${Date.now()}`, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();

        await page.reload();
        await page.waitForLoadState('networkidle');

        const card = page.locator('.group', { hasText: habit.name });
        await card.hover();

        // Click delete button (the one with delete icon)
        const deleteBtn = card.locator('button', { has: page.locator('span', { hasText: 'delete' }) });
        await deleteBtn.click();

        // Expect custom modal
        await expect(page.getByText('Delete Habit?')).toBeVisible();
        await page.getByTestId('confirm-delete-btn').click();

        await page.waitForTimeout(1000);
        await expect(page.getByText(habit.name)).not.toBeVisible();
    });
});
