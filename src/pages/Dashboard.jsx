import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api';
import { useSession } from '../lib/auth-client';

export default function Dashboard() {
    const { data: session } = useSession();
    const [timerActive, setTimerActive] = useState(false);
    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState({ total_completed: 0, active_habits: 0, current_streak: 0, today_progress: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [habitsData, statsData] = await Promise.all([
                    api.get('/habits'),
                    api.get('/analytics/dashboard')
                ]);
                setHabits(habitsData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [session]);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    // Find the primary focus habit (e.g., first one or marked as stacked)
    const currentFocus = habits[0];

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark pb-10">
            {/* Top Header */}
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Focus</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                        <span className="material-icons-round text-base text-primary">local_fire_department</span>
                        {stats.current_streak} Day Streak • Keep the momentum going, {session?.user?.name}!
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
                        <span className="material-icons-round">notifications_none</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-background-light dark:border-background-dark"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Time</p>
                        <p className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </header>

            {/* Content Container */}
            <div className="px-8 py-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left Column: The Queue & History */}
                    <div className="xl:col-span-4 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Habits</h3>

                        <div className="space-y-4">
                            {habits.length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <p className="text-slate-500 text-sm">No habits yet.</p>
                                    <p className="text-primary text-sm font-bold mt-1">Create one to get started!</p>
                                </div>
                            ) : habits.map(habit => (
                                <div key={habit.id} className="bg-white/60 dark:bg-[#15281b]/60 rounded-xl p-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("w-2 h-10 rounded-full transition-colors", `bg-${habit.color || 'primary'}`)}></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{habit.name}</h4>
                                            <span className="text-xs text-slate-400">{habit.category} • {habit.durationMins || 0} min</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all">
                                        <span className="material-icons-round">play_circle</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center Stage: The Active Action */}
                    <div className="xl:col-span-8">
                        <div className="h-full flex flex-col">
                            {currentFocus ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                            Current Focus
                                        </h3>
                                    </div>

                                    {/* Active Card */}
                                    <div className="bg-white dark:bg-[#1a2e23] rounded-3xl p-8 lg:p-12 shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden flex-1 flex flex-col justify-center items-center text-center">
                                        {/* Decoration */}
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pastel-mint via-primary to-pastel-mint opacity-50"></div>
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pastel-mint rounded-full blur-3xl opacity-20 dark:opacity-5"></div>
                                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pastel-lavender rounded-full blur-3xl opacity-20 dark:opacity-5"></div>

                                        {/* Habit Category Tag */}
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pastel-mint dark:bg-green-900/30 rounded-full text-sm font-bold text-green-700 dark:text-green-300 mb-8">
                                            <span className="material-icons-round text-base">code</span>
                                            {currentFocus.category}
                                        </span>

                                        {/* Habit Title */}
                                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">{currentFocus.name}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">{currentFocus.description || "You got this!"}</p>

                                        {/* Timer Display */}
                                        <div className="mb-12 relative group cursor-pointer">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative z-10 text-8xl lg:text-9xl font-mono font-bold text-slate-800 dark:text-white tracking-tighter tabular-nums leading-none">
                                                {currentFocus.targetTime ? currentFocus.targetTime.slice(0, 5) : '00:00'}
                                            </div>
                                            <p className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-widest">Target Time</p>
                                        </div>

                                        {/* Primary Action Button */}
                                        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                                            <button
                                                onClick={() => setTimerActive(!timerActive)}
                                                className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                                            >
                                                <span className={clsx("material-icons-round text-2xl", timerActive && "animate-spin")}>
                                                    {timerActive ? 'pause' : 'play_arrow'}
                                                </span>
                                                {timerActive ? 'Pause Focus' : 'Start Session'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mini Stats for Active Habit */}
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="bg-white dark:bg-[#1a2e23] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                                                <span className="material-icons-round">history</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase">Total</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{stats.total_completed}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2e23] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                                                <span className="material-icons-round">local_fire_department</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase">Streak</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{stats.current_streak}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a2e23] p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                                                <span className="material-icons-round">trending_up</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase">Active</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{stats.active_habits}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#1a2e23] rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <span className="material-icons-round text-4xl text-slate-300">spa</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Active Focus</h2>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                                        Select a habit from the queue or create a new one to start your focus session.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
