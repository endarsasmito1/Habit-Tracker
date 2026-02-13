import { Router } from 'express';
import { db } from '../db';
import { habits } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/habits - List all active habits
router.get('/', async (req, res) => {
    try {
        const userHabits = await db.select()
            .from(habits)
            .where(and(
                eq(habits.userId, req.user!.id),
                eq(habits.archived, false)
            ))
            .orderBy(desc(habits.createdAt));

        res.json(userHabits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST /api/habits - Create new habit
router.post('/', async (req, res) => {
    const { name, category, frequency, targetTime, durationMins, color, description } = req.body;

    try {
        const [newHabit] = await db.insert(habits).values({
            userId: req.user!.id,
            name,
            category: category || 'General',
            frequency: frequency || 'daily',
            targetTime,
            durationMins,
            color,
            description
        }).returning();

        res.status(201).json(newHabit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// PATCH /api/habits/:id - Update habit
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, frequency, targetTime, durationMins, color, archived, reminderEnabled } = req.body;

    try {
        const [updatedHabit] = await db.update(habits)
            .set({
                name, category, frequency, targetTime, durationMins, color, archived, reminderEnabled,
                updatedAt: new Date()
            })
            .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)))
            .returning();

        if (!updatedHabit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json(updatedHabit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// DELETE /api/habits/:id - Hard delete (use with caution, prefer archive)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db.delete(habits)
            .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

export default router;
