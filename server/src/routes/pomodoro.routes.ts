import { Router } from 'express';
import { db } from '../db';
import { pomodoroSessions } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// POST /api/pomodoro/start - Start a new pomodoro session
router.post('/start', async (req, res) => {
    const { habitId, durationMins, totalSeconds } = req.body;
    // If totalSeconds is provided, use it directly (supports sub-minute timers)
    const seconds = totalSeconds != null ? totalSeconds : (durationMins ?? 25) * 60;
    const storedDurationMins = Math.max(1, Math.ceil(seconds / 60));

    try {
        // Cancel any existing running/paused sessions
        await db.update(pomodoroSessions)
            .set({ status: 'cancelled' })
            .where(and(
                eq(pomodoroSessions.userId, req.user!.id),
                or(
                    eq(pomodoroSessions.status, 'running'),
                    eq(pomodoroSessions.status, 'paused')
                )
            ));

        const [session] = await db.insert(pomodoroSessions).values({
            habitId: habitId || null,
            userId: req.user!.id,
            durationMins: storedDurationMins,
            remainingSeconds: seconds,
            status: 'running',
            startedAt: new Date(),
        }).returning();


        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start pomodoro session' });
    }
});

// GET /api/pomodoro/active - Get the current running or paused session
router.get('/active', async (req, res) => {
    try {
        const [session] = await db.select()
            .from(pomodoroSessions)
            .where(and(
                eq(pomodoroSessions.userId, req.user!.id),
                or(
                    eq(pomodoroSessions.status, 'running'),
                    eq(pomodoroSessions.status, 'paused')
                )
            ))
            .limit(1);

        res.json(session || null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get active session' });
    }
});

// PATCH /api/pomodoro/:id/pause - Pause a running session
router.patch('/:id/pause', async (req, res) => {
    const { id } = req.params;
    const { remainingSeconds } = req.body;

    try {
        const [session] = await db.update(pomodoroSessions)
            .set({ status: 'paused', remainingSeconds })
            .where(and(
                eq(pomodoroSessions.id, id),
                eq(pomodoroSessions.userId, req.user!.id)
            ))
            .returning();

        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to pause session' });
    }
});

// PATCH /api/pomodoro/:id/resume - Resume a paused session
router.patch('/:id/resume', async (req, res) => {
    const { id } = req.params;

    try {
        const [session] = await db.update(pomodoroSessions)
            .set({ status: 'running' })
            .where(and(
                eq(pomodoroSessions.id, id),
                eq(pomodoroSessions.userId, req.user!.id)
            ))
            .returning();

        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to resume session' });
    }
});

// PATCH /api/pomodoro/:id/complete - Mark session as completed
router.patch('/:id/complete', async (req, res) => {
    const { id } = req.params;

    try {
        const [session] = await db.update(pomodoroSessions)
            .set({ status: 'completed', remainingSeconds: 0, completedAt: new Date() })
            .where(and(
                eq(pomodoroSessions.id, id),
                eq(pomodoroSessions.userId, req.user!.id)
            ))
            .returning();

        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete session' });
    }
});

// PATCH /api/pomodoro/:id/cancel - Cancel a session
router.patch('/:id/cancel', async (req, res) => {
    const { id } = req.params;

    try {
        const [session] = await db.update(pomodoroSessions)
            .set({ status: 'cancelled' })
            .where(and(
                eq(pomodoroSessions.id, id),
                eq(pomodoroSessions.userId, req.user!.id)
            ))
            .returning();

        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel session' });
    }
});

export default router;
