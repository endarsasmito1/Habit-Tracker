import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 14: Auth Guards & Security', () => {
    test.describe('Unauthenticated API access', () => {
        // Use empty storage state for these tests
        test.use({ storageState: { cookies: [], origins: [] } });

        test('1. GET /api/habits rejects without auth', async ({ request }) => {
            const res = await request.get(`${API}/habits`);
            expect(res.status()).toBe(401);
        });

        test('2. POST /api/habits rejects without auth', async ({ request }) => {
            const res = await request.post(`${API}/habits`, {
                data: { name: 'Unauthorized', category: 'Test', frequency: 'daily' },
            });
            expect(res.status()).toBe(401);
        });

        test('3. GET /api/categories rejects without auth', async ({ request }) => {
            const res = await request.get(`${API}/categories`);
            expect(res.status()).toBe(401);
        });

        test('4. GET /api/analytics rejects without auth', async ({ request }) => {
            const res = await request.get(`${API}/analytics/dashboard`);
            expect(res.status()).toBe(401);
        });

        test('5. POST /api/pomodoro rejects without auth', async ({ request }) => {
            const res = await request.post(`${API}/pomodoro/start`, {
                data: { durationMins: 25 },
            });
            expect(res.status()).toBe(401);
        });

        test('6. POST /api/checkins rejects without auth', async ({ request }) => {
            const res = await request.post(`${API}/checkins`, {
                data: { habitId: 'fake', date: '2025-01-01', status: 'completed' },
            });
            expect(res.status()).toBe(401);
        });
    });

    test.describe('Cross-user data isolation', () => {
        // These tests use the authenticated state
        test('7. Cannot access non-existent habit (simulates other user)', async ({ request }) => {
            const res = await request.get(`${API}/habits/other-user-habit-id`);
            expect(res.status()).toBe(404);
        });

        test('8. Cannot PATCH non-existent habit', async ({ request }) => {
            const res = await request.patch(`${API}/habits/other-user-habit-id`, {
                data: { name: 'Hacked' },
            });
            expect(res.status()).toBe(404);
        });

        test('9. Cannot DELETE non-existent habit', async ({ request }) => {
            const res = await request.delete(`${API}/habits/other-user-habit-id`);
            expect(res.status()).toBe(404);
        });
    });
});
