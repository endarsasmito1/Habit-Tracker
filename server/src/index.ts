import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import { sanitizeInput } from './middleware/validation.middleware';

// Middleware
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(sanitizeInput);

// Routes
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import checkinRoutes from './routes/checkin.routes';
import analyticsRoutes from './routes/analytics.routes';
import pomodoroRoutes from './routes/pomodoro.routes';
import categoryRoutes from './routes/category.routes';

app.use(authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/categories', categoryRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('Habit Tracker API is running 🚀');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
