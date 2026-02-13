import { Router } from 'express';
import { db } from '../db';
import { habitLogs } from '../db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// POST /api/checkins - Log a completion
router.post('/', async (req, res) => {
    const { habitId, date, status, moodRating, notes, imageUrl } = req.body;

    try {
        // Upsert log for that habit and date
        // Note: Drizzle upsert helper or check existence first
        // For simplicity, we'll check if exists
        const logDate = new Date(date);

        const existingLogs = await db.select()
            .from(habitLogs)
            .where(and(
                eq(habitLogs.habitId, habitId),
                eq(habitLogs.logDate, date), // Assuming date string matches DB date type
                eq(habitLogs.userId, req.user!.id)
            ));

        let result;
        if (existingLogs.length > 0) {
            // Update
            const [updated] = await db.update(habitLogs)
                .set({ status, moodRating, notes, imageUrl, completedAt: new Date() })
                .where(eq(habitLogs.id, existingLogs[0].id))
                .returning();
            result = updated;
        } else {
            // Insert
            const [inserted] = await db.insert(habitLogs).values({
                userId: req.user!.id,
                habitId,
                logDate: date,
                status: status || 'completed',
                moodRating,
                notes,
                imageUrl,
                completedAt: new Date()
            }).returning();
            result = inserted;
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log check-in' });
    }
});

// GET /api/checkins/history - Get logs for a range
router.get('/history', async (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start and end date required' });
    }

    try {
        const logs = await db.select()
            .from(habitLogs)
            .where(and(
                eq(habitLogs.userId, req.user!.id),
                gte(habitLogs.logDate, start_date as string),
                lte(habitLogs.logDate, end_date as string)
            ));

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch check-in history' });
    }
});

// DELETE /api/checkins/:id - Remove a check-in
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db.delete(habitLogs)
            .where(and(eq(habitLogs.id, id), eq(habitLogs.userId, req.user!.id)))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json({ message: 'Check-in removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete check-in' });
    }
});

export default router;
