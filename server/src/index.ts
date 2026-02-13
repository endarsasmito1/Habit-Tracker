import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/auth.routes';
import habitRoutes from './routes/habit.routes';
import checkinRoutes from './routes/checkin.routes';
import analyticsRoutes from './routes/analytics.routes';

app.use(authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('Habit Tracker API is running 🚀');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
