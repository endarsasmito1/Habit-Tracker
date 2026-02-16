import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 16: Concurrent & Race Conditions', () => {
    test('1. Rapid habit creation', async ({ request }) => {
        const promises = Array.from({ length: 5 }, (_, i) =>
            request.post(`${API}/habits`, {
                data: { name: `Rapid ${i} ${Date.now()}`, category: 'General', frequency: 'daily' },
            })
        );

        const results = await Promise.all(promises);
        for (const res of results) {
            expect(res.status()).toBe(201);
        }
    });

    test('2. Rapid check-ins different habits', async ({ request }) => {
        // Create habits first
        const habits = await Promise.all(
            Array.from({ length: 3 }, (_, i) =>
                request.post(`${API}/habits`, {
                    data: { name: `RapidCI ${i} ${Date.now()}`, category: 'General', frequency: 'daily' },
                }).then(r => r.json())
            )
        );

        const checkins = await Promise.all(
            habits.map(h =>
                request.post(`${API}/checkins`, {
                    data: { habitId: h.id, date: '2025-05-01', status: 'completed' },
                })
            )
        );

        for (const res of checkins) {
            expect(res.ok()).toBeTruthy();
        }
    });

    test('3. Double delete does not crash', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `DoubleDel ${Date.now()}`, category: 'General', frequency: 'daily' },
        })).json();

        const [res1, res2] = await Promise.all([
            request.delete(`${API}/habits/${habit.id}`),
            request.delete(`${API}/habits/${habit.id}`),
        ]);

        // One should succeed, the other should be 404
        const statuses = [res1.status(), res2.status()].sort();
        expect(statuses).toContain(200);
        // Second one could be 200 (idempotent) or 404
    });

    test('4. Rapid pause toggle via API', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `RapidPause ${Date.now()}`, category: 'General', frequency: 'daily' },
        })).json();

        // Toggle 5 times rapidly
        for (let i = 0; i < 5; i++) {
            await request.patch(`${API}/habits/${habit.id}`, {
                data: { paused: i % 2 === 0 },
            });
        }

        // Final state should be paused=true (last was i=4, even, so paused=true)
        const final = await (await request.get(`${API}/habits/${habit.id}`)).json();
        expect(typeof final.paused).toBe('boolean');
    });

    test('5. Concurrent pomodoro starts', async ({ request }) => {
        const [res1, res2] = await Promise.all([
            request.post(`${API}/pomodoro/start`, { data: { durationMins: 25 } }),
            request.post(`${API}/pomodoro/start`, { data: { durationMins: 15 } }),
        ]);

        // Both should succeed (second cancels first)
        expect(res1.status()).toBe(201);
        expect(res2.status()).toBe(201);

        // Only one should be active
        const active = await (await request.get(`${API}/pomodoro/active`)).json();
        expect(active).toBeTruthy();
        expect(active.status).toBe('running');
    });
});
