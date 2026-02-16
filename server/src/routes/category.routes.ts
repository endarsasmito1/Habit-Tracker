import { Router } from 'express';
import { db } from '../db';
import { categories } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// GET /api/categories - List all categories for user
router.get('/', async (req, res) => {
    try {
        const userCategories = await db.select()
            .from(categories)
            .where(eq(categories.userId, req.user!.id))
            .orderBy(asc(categories.name));

        res.json(userCategories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
    const { name, color, icon } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    try {
        const [newCategory] = await db.insert(categories).values({
            userId: req.user!.id,
            name: name.trim(),
            color: color || '#30e86e',
            icon: icon || 'category',
        }).returning();

        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PATCH /api/categories/:id - Update category
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    try {
        const [updated] = await db.update(categories)
            .set({ name, color, icon })
            .where(and(eq(categories.id, id), eq(categories.userId, req.user!.id)))
            .returning();

        if (!updated) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await db.delete(categories)
            .where(and(eq(categories.id, id), eq(categories.userId, req.user!.id)))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

export default router;
