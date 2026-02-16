import { Router } from 'express';
import { db } from '../db';
import { habits, habitLogs } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createHabitSchema, updateHabitSchema } from '../schemas/habit.schema';

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

        // Fetch logs for these habits to calculate streak
        const logs = await db.select()
            .from(habitLogs)
            .where(eq(habitLogs.userId, req.user!.id));

        const habitsWithStats = userHabits.map(habit => {
            const habitLogsList = logs.filter(l => l.habitId === habit.id);
            // Simple streak calculation: total completions for now
            // Detailed streak would require date math
            return {
                ...habit,
                streak: habitLogsList.length,
                logs: habitLogsList
            };
        });

        res.json(habitsWithStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// GET /api/habits/:id - Get single habit with logs
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [habit] = await db.select()
            .from(habits)
            .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)));

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Get logs for this habit, last 30
        const logs = await db.select()
            .from(habitLogs)
            .where(and(eq(habitLogs.habitId, id), eq(habitLogs.userId, req.user!.id)))
            .orderBy(desc(habitLogs.completedAt))
            .limit(30);

        res.json({ ...habit, logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch habit' });
    }
});

// POST /api/habits - Create new habit
router.post('/', validateRequest(createHabitSchema), async (req, res) => {
    // req.body is already validated and sanitized
    const { name, category, frequency, startDate, targetTime, durationMins, color, description, reminderEnabled, stackedOnHabitId } = req.body;

    try {
        const [newHabit] = await db.insert(habits).values({
            userId: req.user!.id,
            name,
            category: category || 'General',
            frequency: frequency || 'daily',
            startDate: startDate || null,
            targetTime: targetTime || null,
            durationMins: durationMins || null,
            color,
            description,
            stackedOnHabitId: stackedOnHabitId || null,
            reminderEnabled: reminderEnabled || false
        }).returning();

        res.status(201).json(newHabit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// PATCH /api/habits/:id - Update habit
router.patch('/:id', validateRequest(updateHabitSchema), async (req, res) => {
    const { id } = req.params;
    const { name, category, frequency, targetTime, durationMins, color, archived, reminderEnabled, paused, description } = req.body;

    try {
        const updateData: Partial<typeof habits.$inferInsert> = {};
        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (frequency !== undefined) updateData.frequency = frequency as any; // Cast if enum mismatch
        if (targetTime !== undefined) updateData.targetTime = targetTime;
        if (durationMins !== undefined) updateData.durationMins = durationMins;
        if (color !== undefined) updateData.color = color;
        if (archived !== undefined) updateData.archived = archived;
        if (reminderEnabled !== undefined) updateData.reminderEnabled = reminderEnabled;
        if (paused !== undefined) updateData.paused = paused;
        if (description !== undefined) updateData.description = description;

        // Ensure user owns habit
        const [updatedHabit] = await db.update(habits)
            .set(updateData as any)
            .where(and(eq(habits.id, id as string), eq(habits.userId, req.user!.id)))
            .returning();

        if (!updatedHabit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json(updatedHabit);
    } catch (error) {
        console.error(error);
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

// POST /api/habits/:id/check-in - Record a completion
router.post('/:id/check-in', async (req, res) => {
    const { id } = req.params;
    const { notes, mood } = req.body;

    try {
        // Verify habit ownership
        const [habit] = await db.select()
            .from(habits)
            .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)));

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Create log entry
        const [log] = await db.insert(habitLogs).values({
            habitId: id,
            userId: req.user!.id,
            completedAt: new Date(),
            notes: notes || null,
            moodRating: mood || null,
            status: 'completed',
            logDate: new Date().toISOString().split('T')[0] // Required logDate
        }).returning();

        res.status(201).json(log);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check in' });
    }
});

export default router;
