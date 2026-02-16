import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 9: Pomodoro Timer API', () => {
    let sessionId: string;

    test('1. Start session', async ({ request }) => {
        const res = await request.post(`${API}/pomodoro/start`, {
            data: { durationMins: 25 },
        });
        expect(res.status()).toBe(201);
        const session = await res.json();
        expect(session.status).toBe('running');
        expect(session.durationMins).toBe(25);
        expect(session.remainingSeconds).toBe(1500);
        sessionId = session.id;
    });

    test('2. Start with custom duration', async ({ request }) => {
        const res = await request.post(`${API}/pomodoro/start`, {
            data: { durationMins: 15 },
        });
        expect(res.status()).toBe(201);
        const session = await res.json();
        expect(session.durationMins).toBe(15);
        expect(session.remainingSeconds).toBe(900);
        sessionId = session.id;
    });

    test('3. Start cancels previous session', async ({ request }) => {
        // Start first
        const first = await request.post(`${API}/pomodoro/start`, { data: { durationMins: 25 } });
        const firstSession = await first.json();

        // Start second
        const second = await request.post(`${API}/pomodoro/start`, { data: { durationMins: 10 } });
        expect(second.status()).toBe(201);

        // First should be cancelled (check via active — should only return the second)
        const active = await request.get(`${API}/pomodoro/active`);
        const activeSession = await active.json();
        expect(activeSession.id).not.toBe(firstSession.id);
        sessionId = activeSession.id;
    });

    test('4. Get active session', async ({ request }) => {
        // Start a fresh one
        const start = await request.post(`${API}/pomodoro/start`, { data: { durationMins: 25 } });
        const started = await start.json();

        const res = await request.get(`${API}/pomodoro/active`);
        expect(res.ok()).toBeTruthy();
        const session = await res.json();
        expect(session).toBeTruthy();
        expect(session.status).toMatch(/running|paused/);
        sessionId = started.id;
    });

    test('5. Pause session', async ({ request }) => {
        const res = await request.patch(`${API}/pomodoro/${sessionId}/pause`, {
            data: { remainingSeconds: 1200 },
        });
        expect(res.ok()).toBeTruthy();
        const session = await res.json();
        expect(session.status).toBe('paused');
        expect(session.remainingSeconds).toBe(1200);
    });

    test('6. Resume session', async ({ request }) => {
        const res = await request.patch(`${API}/pomodoro/${sessionId}/resume`);
        expect(res.ok()).toBeTruthy();
        const session = await res.json();
        expect(session.status).toBe('running');
    });

    test('7. Complete session', async ({ request }) => {
        const res = await request.patch(`${API}/pomodoro/${sessionId}/complete`);
        expect(res.ok()).toBeTruthy();
        const session = await res.json();
        expect(session.status).toBe('completed');
        expect(session.remainingSeconds).toBe(0);
        expect(session.completedAt).toBeTruthy();
    });

    test('8. No active session after complete', async ({ request }) => {
        const res = await request.get(`${API}/pomodoro/active`);
        const session = await res.json();
        expect(session).toBeFalsy();
    });

    test('9. Cancel session', async ({ request }) => {
        const start = await request.post(`${API}/pomodoro/start`, { data: { durationMins: 25 } });
        const s = await start.json();

        const res = await request.patch(`${API}/pomodoro/${s.id}/cancel`);
        expect(res.ok()).toBeTruthy();
        const session = await res.json();
        expect(session.status).toBe('cancelled');
    });

    test('10. 404 for invalid session ID', async ({ request }) => {
        const res = await request.patch(`${API}/pomodoro/fake-id/pause`, {
            data: { remainingSeconds: 100 },
        });
        expect(res.status()).toBe(404);
    });

    test('11. Full lifecycle: start → pause → resume → complete', async ({ request }) => {
        const start = await request.post(`${API}/pomodoro/start`, { data: { durationMins: 5 } });
        const s = await start.json();
        expect(s.status).toBe('running');

        const pause = await request.patch(`${API}/pomodoro/${s.id}/pause`, { data: { remainingSeconds: 250 } });
        expect((await pause.json()).status).toBe('paused');

        const resume = await request.patch(`${API}/pomodoro/${s.id}/resume`);
        expect((await resume.json()).status).toBe('running');

        const complete = await request.patch(`${API}/pomodoro/${s.id}/complete`);
        const final = await complete.json();
        expect(final.status).toBe('completed');
        expect(final.remainingSeconds).toBe(0);
    });

    test('12. Start linked to habit', async ({ request }) => {
        // Create a habit first
        const habitRes = await request.post(`${API}/habits`, {
            data: { name: `Pomo Habit ${Date.now()}`, category: 'Focus', frequency: 'daily' },
        });
        const habit = await habitRes.json();

        const res = await request.post(`${API}/pomodoro/start`, {
            data: { habitId: habit.id, durationMins: 25 },
        });
        const session = await res.json();
        expect(session.habitId).toBe(habit.id);
    });
});
