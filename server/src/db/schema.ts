import { pgTable, text, boolean, timestamp, integer, pgEnum, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly', 'weekdays', 'weekends']);
export const logStatusEnum = pgEnum('log_status', ['completed', 'partial', 'skipped']);
export const pomodoroStatusEnum = pgEnum('pomodoro_status', ['running', 'paused', 'completed', 'cancelled']);

// Users Table (Better Auth Compatible)
export const users = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    isPro: boolean('is_pro').default(false),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// Habits Table
export const habits = pgTable('habits', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(), // 'Health', 'Learning', etc.
    description: text('description'),
    frequency: frequencyEnum('frequency').notNull(),
    startDate: date('start_date'), // When the habit starts
    targetTime: time('target_time'), // '08:00'
    durationMins: integer('duration_mins'), // 20
    color: text('color').default('mint'),
    stackedOnHabitId: text('stacked_on_habit_id'),
    reminderEnabled: boolean('reminder_enabled').default(false),
    paused: boolean('paused').default(false),
    archived: boolean('archived').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Habit Logs (Check-ins)
export const habitLogs = pgTable('habit_logs', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    habitId: text('habit_id').references(() => habits.id).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    completedAt: timestamp('completed_at').notNull(),
    status: logStatusEnum('status').notNull(),
    moodRating: text('mood_rating'),
    notes: text('notes'),
    imageUrl: text('image_url'), // For proof
    logDate: date('log_date').notNull(), // YYYY-MM-DD
});

// User Stats (Analytics Cache)
export const userStats = pgTable('user_stats', {
    userId: text('user_id').references(() => users.id).primaryKey(),
    currentStreak: integer('current_streak').default(0),
    consistencyScore: integer('consistency_score').default(0),
    totalFocusMinutes: integer('total_focus_minutes').default(0),
    habitsStackedCount: integer('habits_stacked_count').default(0),
    lastUpdatedAt: timestamp('last_updated_at').defaultNow(),
});

// Categories Table
export const categories = pgTable('categories', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    color: text('color').default('#30e86e'),
    icon: text('icon').default('category'),
    createdAt: timestamp('created_at').defaultNow(),
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

// Pomodoro Sessions Table
export const pomodoroSessions = pgTable('pomodoro_sessions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    habitId: text('habit_id').references(() => habits.id),
    userId: text('user_id').references(() => users.id).notNull(),
    durationMins: integer('duration_mins').notNull().default(25),
    remainingSeconds: integer('remaining_seconds').notNull(),
    status: pomodoroStatusEnum('status').notNull().default('running'),
    startedAt: timestamp('started_at').defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
    habit: one(habits, {
        fields: [pomodoroSessions.habitId],
        references: [habits.id],
    }),
    user: one(users, {
        fields: [pomodoroSessions.userId],
        references: [users.id],
    }),
}));
