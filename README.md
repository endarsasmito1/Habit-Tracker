# ⚡ The Action — Habit Tracker

A full-stack habit tracking application with built-in Pomodoro timer, streak tracking, and AI-powered insights. Built with React + Express + PostgreSQL.

## Overview

**The Action** helps you build consistent habits through focused deep work sessions. Select a habit, start a Pomodoro timer, and check in when you're done — or skip the timer and complete habits directly with a quick check-in.

### Key Features

- 🎯 **Dashboard** — Daily focus view with "Up Next" habits, Pomodoro timer, and quick check-in
- ⏱️ **Pomodoro Timer** — Customizable duration (supports seconds), pause/resume, floating mini-timer
- ✅ **Quick Check-in** — Complete habits directly from the dashboard without a timer session
- 📊 **Analytics** — Track streaks, total sessions, completion rates, and trends
- 📅 **Calendar** — Visual heatmap of daily habit completions
- 🤖 **AI Insights** — Personalized suggestions based on your habits and patterns
- 🔥 **Streaks** — Track consecutive days of habit completion
- 😊 **Mood Tracking** — Log how you feel after each session
- 🏷️ **Categories** — Organize habits by custom categories
- 🌙 **Dark Mode** — Full dark theme support

## Tech Stack

### Frontend
- **React 19** — UI framework
- **React Router v7** — Client-side routing
- **TailwindCSS 3** — Utility-first styling
- **Vite 7** — Build tool & dev server
- **clsx** — Conditional class names
- **better-auth** — Authentication client

### Backend
- **Express 5** — API server
- **PostgreSQL** — Database
- **Drizzle ORM** — Type-safe database queries
- **Zod** — Request validation
- **better-auth** — Authentication server
- **Helmet** — Security headers
- **sanitize-html** — Input sanitization

### Testing
- **Playwright** — End-to-end browser tests

## Project Structure

```
├── src/                    # Frontend (React)
│   ├── pages/
│   │   ├── Dashboard.jsx   # Main dashboard with Pomodoro timer
│   │   ├── Habits.jsx      # Habit management page
│   │   ├── HabitDetail.jsx # Individual habit details & history
│   │   ├── Calendar.jsx    # Calendar heatmap view
│   │   ├── Insights.jsx    # AI-powered insights
│   │   ├── Profile.jsx     # User profile & settings
│   │   └── Auth.jsx        # Login / Register
│   ├── components/
│   │   ├── Layout.jsx      # App shell with sidebar navigation
│   │   ├── FloatingTimer.jsx # Mini Pomodoro timer overlay
│   │   └── modals/         # Create, Check-in, Delete modals
│   ├── context/
│   │   └── PomodoroContext.jsx # Timer state management
│   └── lib/
│       └── api.js          # API client with auth headers
│
├── server/                 # Backend (Express)
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── auth.ts         # better-auth configuration
│       ├── db/
│       │   └── schema.ts   # Drizzle schema (users, habits, check-ins, sessions)
│       ├── routes/
│       │   ├── habit.routes.ts      # CRUD for habits
│       │   ├── checkin.routes.ts    # Check-in endpoints
│       │   ├── pomodoro.routes.ts   # Pomodoro session management
│       │   ├── category.routes.ts   # Category management
│       │   ├── analytics.routes.ts  # Dashboard stats & trends
│       │   └── auth.routes.ts       # Auth passthrough
│       ├── middleware/
│       │   └── validation.middleware.ts
│       └── schemas/
│           └── habit.schema.ts      # Zod validation schemas
│
└── tests/                  # Playwright e2e tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/endarsasmito1/Habit-Tracker.git
cd Habit-Tracker

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### Environment Setup

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker
BETTER_AUTH_SECRET=your-secret-key
```

### Database Setup

```bash
# Push schema to database
cd server && npx drizzle-kit push

# (Optional) Seed a test user
npx tsx seed-user.ts
```

### Running the App

```bash
# Start both frontend & backend concurrently
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4983`
- Drizzle Studio: `cd server && npm run studio`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List all habits |
| POST | `/api/habits` | Create a habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| POST | `/api/habits/:id/check-in` | Check in to a habit |
| GET | `/api/checkins` | List check-ins |
| POST | `/api/pomodoro/start` | Start a Pomodoro session |
| POST | `/api/pomodoro/pause` | Pause active session |
| POST | `/api/pomodoro/resume` | Resume paused session |
| POST | `/api/pomodoro/complete` | Complete session |
| GET | `/api/pomodoro/active` | Get active session |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/categories` | List categories |

## License

MIT
