import { pgTable, uuid, text, boolean, timestamp, integer, pgEnum, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly', 'weekdays', 'weekends']);
export const logStatusEnum = pgEnum('log_status', ['completed', 'partial', 'skipped']);

// Users Table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    isPro: boolean('is_pro').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Habits Table
export const habits = pgTable('habits', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(), // 'Health', 'Learning', etc.
    description: text('description'),
    frequency: frequencyEnum('frequency').notNull(),
    targetTime: time('target_time'), // '08:00'
    durationMins: integer('duration_mins'), // 20
    color: text('color').default('mint'),
    stackedOnHabitId: uuid('stacked_on_habit_id'), // Self-reference will be handled in relations if needed, or just ID
    reminderEnabled: boolean('reminder_enabled').default(false),
    archived: boolean('archived').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Habit Logs (Check-ins)
export const habitLogs = pgTable('habit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    habitId: uuid('habit_id').references(() => habits.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(), // Denormalized for query speed
    completedAt: timestamp('completed_at').notNull(),
    status: logStatusEnum('status').notNull(),
    moodRating: text('mood_rating'),
    notes: text('notes'),
    imageUrl: text('image_url'), // For proof
    logDate: date('log_date').notNull(), // YYYY-MM-DD
});

// User Stats (Analytics Cache)
export const userStats = pgTable('user_stats', {
    userId: uuid('user_id').references(() => users.id).primaryKey(),
    currentStreak: integer('current_streak').default(0),
    consistencyScore: integer('consistency_score').default(0),
    totalFocusMinutes: integer('total_focus_minutes').default(0),
    habitsStackedCount: integer('habits_stacked_count').default(0),
    lastUpdatedAt: timestamp('last_updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
    habits: many(habits),
    logs: many(habitLogs),
    stats: one(userStats, {
        fields: [users.id],
        references: [userStats.userId],
    }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
    user: one(users, {
        fields: [habits.userId],
        references: [users.id],
    }),
    logs: many(habitLogs),
    stackedOn: one(habits, {
        fields: [habits.stackedOnHabitId],
        references: [habits.id],
        relationName: 'stack_parent'
    }),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
    habit: one(habits, {
        fields: [habitLogs.habitId],
        references: [habits.id],
    }),
    user: one(users, {
        fields: [habitLogs.userId],
        references: [users.id],
    }),
}));
