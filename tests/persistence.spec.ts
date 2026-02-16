import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 15: Data Persistence & Refresh', () => {
    test('1. Habit persists after full page reload', async ({ page, request }) => {
        const name = `Persist ${Date.now()}`;
        await request.post(`${API}/habits`, {
            data: { name, category: 'General', frequency: 'daily' },
        });

        await page.goto('/habits');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(name)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(name)).toBeVisible();
    });

    test('2. Edit persists after reload', async ({ page, request }) => {
        const res = await request.post(`${API}/habits`, {
            data: { name: `EditPersist ${Date.now()}`, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();

        const newName = `Edited ${Date.now()}`;
        await request.patch(`${API}/habits/${habit.id}`, {
            data: { name: newName },
        });

        await page.goto(`/habits/${habit.id}`);
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(newName)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(newName)).toBeVisible();
    });

    test('3. Delete is permanent', async ({ page, request }) => {
        const res = await request.post(`${API}/habits`, {
            data: { name: `DeletePerm ${Date.now()}`, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();

        await request.delete(`${API}/habits/${habit.id}`);

        await page.goto('/habits');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(habit.name)).not.toBeVisible();

        await page.reload();
        await expect(page.getByText(habit.name)).not.toBeVisible();
    });

    test('4. Check-in persists after reload', async ({ page, request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `CheckPersist ${Date.now()}`, category: 'General', frequency: 'daily' },
        })).json();

        await request.post(`${API}/checkins`, {
            data: { habitId: habit.id, date: '2025-04-01', status: 'completed', notes: 'Persist test' },
        });

        await page.goto(`/habits/${habit.id}`);
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Persist test')).toBeVisible({ timeout: 5000 });

        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Persist test')).toBeVisible({ timeout: 5000 });
    });

    test('5. Category persists after reload', async ({ request }) => {
        const name = `CatPersist ${Date.now()}`;
        await request.post(`${API}/categories`, { data: { name } });

        const first = await request.get(`${API}/categories`);
        const cats1 = await first.json();
        expect(cats1.find((c: any) => c.name === name)).toBeTruthy();

        // Fetch again to simulate "reload"
        const second = await request.get(`${API}/categories`);
        const cats2 = await second.json();
        expect(cats2.find((c: any) => c.name === name)).toBeTruthy();
    });

    test('6. Dashboard data in sync after CRUD', async ({ page, request }) => {
        const before = await (await request.get(`${API}/analytics/dashboard`)).json();

        await request.post(`${API}/habits`, {
            data: { name: `Sync ${Date.now()}`, category: 'General', frequency: 'daily' },
        });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const after = await (await request.get(`${API}/analytics/dashboard`)).json();
        expect(Number(after.active_habits)).toBeGreaterThanOrEqual(Number(before.active_habits) + 1);
    });

    test('7. Habits page refreshes on return from detail', async ({ page, request }) => {
        const res = await request.post(`${API}/habits`, {
            data: { name: `ReturnSync ${Date.now()}`, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();

        await page.goto(`/habits/${habit.id}`);
        await page.waitForLoadState('networkidle');

        // Edit via API
        const updatedName = `Updated ${Date.now()}`;
        await request.patch(`${API}/habits/${habit.id}`, { data: { name: updatedName } });

        // Go back to habits list
        await page.goto('/habits');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 });
    });
});
