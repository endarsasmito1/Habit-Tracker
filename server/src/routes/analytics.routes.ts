import { Router } from 'express';
import { db } from '../db';
import { habitLogs, habits, userStats } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Calculate basic stats on the fly or fetch from userStats if cached
        // For now, let's do a simple aggregation

        const totalCompleted = await db.select({ count: sql<number>`count(*)` })
            .from(habitLogs)
            .where(and(eq(habitLogs.userId, req.user!.id), eq(habitLogs.status, 'completed')));

        const activeHabits = await db.select({ count: sql<number>`count(*)` })
            .from(habits)
            .where(and(eq(habits.userId, req.user!.id), eq(habits.archived, false)));

        // Mocking streak calculation for now (would need complex query or robust service logic)
        const currentStreak = 5;

        res.json({
            total_completed: Number(totalCompleted[0].count),
            active_habits: Number(activeHabits[0].count),
            current_streak: currentStreak,
            today_progress: 66 // Mock
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
