import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 7: Check-ins API', () => {
    let habitId: string;

    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API}/habits`, {
            data: { name: `Checkin Habit ${Date.now()}`, category: 'Health', frequency: 'daily' },
        });
        const habit = await res.json();
        habitId = habit.id;
    });

    test('1. Check in (completed)', async ({ request }) => {
        const res = await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-01-15', status: 'completed' },
        });
        expect(res.ok()).toBeTruthy();
        const log = await res.json();
        expect(log.status).toBe('completed');
        expect(log.habitId).toBe(habitId);
    });

    test('2. Check in (skipped)', async ({ request }) => {
        const res = await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-01-16', status: 'skipped' },
        });
        expect(res.ok()).toBeTruthy();
        const log = await res.json();
        expect(log.status).toBe('skipped');
    });

    test('3. Check in with notes and mood', async ({ request }) => {
        const res = await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-01-17', status: 'completed', notes: 'Felt great!', moodRating: '5' },
        });
        expect(res.ok()).toBeTruthy();
        const log = await res.json();
        expect(log.notes).toBe('Felt great!');
        expect(log.moodRating).toBe('5');
    });

    test('4. Upsert same date updates instead of duplicating', async ({ request }) => {
        await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-01-18', status: 'completed', notes: 'First' },
        });

        const res = await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-01-18', status: 'skipped', notes: 'Updated' },
        });
        expect(res.ok()).toBeTruthy();
        const log = await res.json();
        expect(log.notes).toBe('Updated');
        expect(log.status).toBe('skipped');
    });

    test('5. Check-in history with date range', async ({ request }) => {
        const res = await request.get(`${API}/checkins/history?habitId=${habitId}&start_date=2025-01-01&end_date=2025-12-31`);
        expect(res.ok()).toBeTruthy();
        const logs = await res.json();
        expect(Array.isArray(logs)).toBeTruthy();
        expect(logs.length).toBeGreaterThan(0);
    });

    test('6. History requires date params', async ({ request }) => {
        const res = await request.get(`${API}/checkins/history?habitId=${habitId}`);
        expect(res.status()).toBe(400);
    });

    test('7. History empty range returns empty', async ({ request }) => {
        const res = await request.get(`${API}/checkins/history?habitId=${habitId}&start_date=2030-01-01&end_date=2030-12-31`);
        expect(res.ok()).toBeTruthy();
        const logs = await res.json();
        expect(logs.length).toBe(0);
    });

    test('8. Delete check-in', async ({ request }) => {
        const create = await request.post(`${API}/checkins`, {
            data: { habitId, date: '2025-02-01', status: 'completed' },
        });
        const log = await create.json();

        const del = await request.delete(`${API}/checkins/${log.id}`);
        expect(del.ok()).toBeTruthy();
    });

    test('9. Delete non-existent check-in returns 404', async ({ request }) => {
        const res = await request.delete(`${API}/checkins/nonexistent-id`);
        expect(res.status()).toBe(404);
    });

    test('10. Multiple check-ins different dates', async ({ request }) => {
        const dates = ['2025-03-01', '2025-03-02', '2025-03-03'];
        for (const date of dates) {
            const res = await request.post(`${API}/checkins`, {
                data: { habitId, date, status: 'completed' },
            });
            expect(res.ok()).toBeTruthy();
        }

        const history = await request.get(`${API}/checkins/history?habitId=${habitId}&start_date=2025-03-01&end_date=2025-03-31`);
        const logs = await history.json();
        expect(logs.length).toBe(3);
    });
});
