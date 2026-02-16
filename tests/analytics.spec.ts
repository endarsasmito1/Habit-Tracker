import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 10: Analytics API', () => {
    test('1. Dashboard analytics returns all fields', async ({ request }) => {
        const res = await request.get(`${API}/analytics/dashboard`);
        expect(res.ok()).toBeTruthy();
        const data = await res.json();
        expect(data).toHaveProperty('total_completed');
        expect(data).toHaveProperty('active_habits');
        expect(data).toHaveProperty('current_streak');
        expect(data).toHaveProperty('today_progress');
    });

    test('2. Active habits count changes after creation', async ({ request }) => {
        const before = await (await request.get(`${API}/analytics/dashboard`)).json();
        const initial = Number(before.active_habits);

        await request.post(`${API}/habits`, {
            data: { name: `AnalyTest ${Date.now()}`, category: 'General', frequency: 'daily' },
        });

        const after = await (await request.get(`${API}/analytics/dashboard`)).json();
        expect(Number(after.active_habits)).toBeGreaterThanOrEqual(initial + 1);
    });

    test('3. Completed count increases after check-in', async ({ request }) => {
        const before = await (await request.get(`${API}/analytics/dashboard`)).json();
        const initial = Number(before.total_completed);

        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `AnalyCI ${Date.now()}`, category: 'General', frequency: 'daily' },
        })).json();

        await request.post(`${API}/checkins`, {
            data: { habitId: habit.id, date: '2025-06-15', status: 'completed' },
        });

        const after = await (await request.get(`${API}/analytics/dashboard`)).json();
        expect(Number(after.total_completed)).toBeGreaterThanOrEqual(initial + 1);
    });
});
