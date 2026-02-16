import { z } from 'zod';

export const createHabitSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    category: z.string().nullish(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'weekdays', 'weekends']).nullish(), // Added weekdays/weekends too
    startDate: z.string().nullish(),
    targetTime: z.string().nullish(),
    durationMins: z.number().nullish(),
    color: z.string().nullish(),
    description: z.string().max(5000, 'Description too long (max 5000 chars)').nullish(),
    reminderEnabled: z.boolean().nullish(),
    stackedOnHabitId: z.string().uuid().nullish(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
    archived: z.boolean().optional(),
    paused: z.boolean().optional(),
});
