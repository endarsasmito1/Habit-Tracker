import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';

const categoryMeta = {
    'Health': { icon: 'favorite', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
    'Health & Wellness': { icon: 'water_drop', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-500' },
    'Personal Growth': { icon: 'menu_book', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500' },
    'Learning': { icon: 'school', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-500' },
    'Learning & Mind': { icon: 'menu_book', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-500' },
    'Financial': { icon: 'payments', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600' },
    'Fitness': { icon: 'fitness_center', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-500' },
    'Routine': { icon: 'wb_sunny', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600' },
    'Mindfulness': { icon: 'self_improvement', bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-500' },
    'Productivity': { icon: 'rocket_launch', bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-500' },
    'General': { icon: 'check_circle', bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-primary' },
};

function getCatMeta(category) {
    return categoryMeta[category] || categoryMeta['General'];
}

function formatFrequency(f) {
    const map = { daily: 'Every Day', weekly: 'Every Week', weekdays: 'Weekdays', weekends: 'Weekends' };
    return map[f] || f;
}

function formatLogDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const logDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today - logDay) / (1000 * 60 * 60 * 24));

    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

export default function HabitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [habit, setHabit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchHabit = async () => {
            try {
                const data = await api.get(`/habits/${id}`);
                setHabit(data);
            } catch (error) {
                console.error('Failed to fetch habit:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabit();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) return;
        try {
            await api.delete(`/habits/${id}`);
            navigate('/habits');
        } catch (error) {
            console.error('Failed to delete habit:', error);
        }
    };

    const handleTogglePause = async () => {
        try {
            const updated = await api.patch(`/habits/${id}`, { paused: !habit.paused });
            setHabit(prev => ({ ...prev, ...updated }));
        } catch (error) {
            console.error('Failed to toggle pause:', error);
        }
    };

    const handleEditStart = () => {
        setEditing(true);
        setEditForm({
            name: habit.name,
            description: habit.description || '',
            category: habit.category,
            frequency: habit.frequency,
            targetTime: habit.targetTime || '',
        });
    };

    const handleEditSave = async () => {
        try {
            const updated = await api.patch(`/habits/${id}`, editForm);
            setHabit(prev => ({ ...prev, ...updated }));
            setEditing(false);
        } catch (error) {
            console.error('Failed to update habit:', error);
        }
    };

    // Calculate stats from logs
    const stats = useMemo(() => {
        if (!habit?.logs) return { streak: 0, consistency: 0, total: 0 };
        const completed = habit.logs.filter(l => l.status === 'completed').length;
        const total = habit.logs.length;
        const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Simple streak calc: count consecutive completed from most recent
        let streak = 0;
        const sorted = [...(habit.logs || [])].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        for (const log of sorted) {
            if (log.status === 'completed') streak++;
            else break;
        }

        return { streak, consistency, total };
    }, [habit?.logs]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!habit) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <span className="material-icons-round text-6xl text-slate-300">search_off</span>
                <p className="text-slate-500 font-semibold">Habit not found</p>
                <button onClick={() => navigate('/habits')} className="text-primary font-bold hover:underline">← Back to Habits</button>
            </div>
        );
    }

    const catMeta = getCatMeta(habit.category);

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark pb-10">
            <div className="max-w-6xl mx-auto p-8 lg:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/habits')}
                            className="mt-1 flex items-center justify-center size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                            <span className="material-icons-round">arrow_back</span>
                        </button>
                        <div>
                            {editing ? (
                                <input
                                    className="text-3xl font-extrabold tracking-tight bg-transparent border-b-2 border-primary focus:outline-none text-slate-800 dark:text-white w-full"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    autoFocus
                                />
                            ) : (
                                <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">{habit.name}</h2>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                                <span className="material-icons-round text-sm">alarm</span>
                                <span className="text-sm font-medium">
                                    {formatFrequency(habit.frequency)}{habit.targetTime ? ` at ${habit.targetTime}` : ''}
                                </span>
                                {habit.paused && (
                                    <span className="ml-2 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded-full">PAUSED</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleEditSave}
                                    className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons-round text-[18px]">check</span>
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEditStart}
                                    className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons-round text-[18px]">edit</span>
                                    Edit Habit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                                >
                                    <span className="material-icons-round text-xl">delete</span>
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Description & Logs */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Description */}
                        <section className="bg-white dark:bg-[#1a2e23] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">About this Habit</h3>
                            {editing ? (
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Add a description for this habit..."
                                />
                            ) : (
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {habit.description || 'No description added yet.'}
                                </p>
                            )}
                        </section>

                        {/* Edit fields: category, frequency, time */}
                        {editing && (
                            <section className="bg-white dark:bg-[#1a2e23] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editForm.frequency}
                                        onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="weekdays">Weekdays</option>
                                        <option value="weekends">Weekends</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editForm.targetTime}
                                        onChange={(e) => setEditForm({ ...editForm, targetTime: e.target.value })}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Past Logs */}
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                    <span className="material-icons-round text-primary">history</span>
                                    Past Logs
                                </h3>
                                <span className="text-xs font-semibold text-slate-400 py-1 px-3 bg-slate-100 dark:bg-slate-800 rounded-full">Last 30 Days</span>
                            </div>

                            <div className="space-y-4">
                                {(!habit.logs || habit.logs.length === 0) ? (
                                    <div className="bg-white dark:bg-[#1a2e23] p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 text-center">
                                        <span className="material-icons-round text-4xl text-slate-300 dark:text-slate-600 mb-2">event_busy</span>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No logs recorded yet. Start checking in!</p>
                                    </div>
                                ) : (
                                    habit.logs.map((log) => {
                                        const isCompleted = log.status === 'completed';
                                        const isSkipped = log.status === 'skipped';
                                        return (
                                            <div key={log.id} className="group relative bg-white dark:bg-[#1a2e23] p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 hover:border-primary/30 transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex gap-4">
                                                        <div className={clsx(
                                                            "flex-shrink-0 size-12 rounded-full flex items-center justify-center",
                                                            isCompleted ? "bg-primary/10 text-primary" :
                                                                isSkipped ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" :
                                                                    "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                                                        )}>
                                                            <span className="material-icons-round">
                                                                {isCompleted ? 'check_circle' : isSkipped ? 'remove_circle' : 'radio_button_checked'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800 dark:text-white capitalize">{log.status}</p>
                                                                <span className="text-xs text-slate-400">•</span>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatLogDate(log.completedAt)}</p>
                                                            </div>
                                                            {log.notes ? (
                                                                <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm italic">"{log.notes}"</p>
                                                            ) : (
                                                                <p className="mt-2 text-slate-400 dark:text-slate-500 text-sm">No notes provided for this session.</p>
                                                            )}
                                                            {log.moodRating && (
                                                                <span className="inline-block mt-2 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                    Mood: {log.moodRating}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Details & Management */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Habit Details Card */}
                        <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 dark:border-primary/5">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Habit Details</h3>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("size-10 rounded-xl flex items-center justify-center", catMeta.bg, catMeta.text)}>
                                        <span className="material-icons-round">{catMeta.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Category</p>
                                        <p className="font-semibold text-slate-800 dark:text-white">{habit.category || 'General'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-icons-round">calendar_today</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Frequency</p>
                                        <p className="font-semibold text-slate-800 dark:text-white">{formatFrequency(habit.frequency)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                        <span className="material-icons-round">auto_graph</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Streak</p>
                                        <p className="font-semibold text-slate-800 dark:text-white">{stats.streak} Days</p>
                                    </div>
                                </div>
                                {habit.targetTime && (
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <span className="material-icons-round">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Time</p>
                                            <p className="font-semibold text-slate-800 dark:text-white">{habit.targetTime}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manage Habit / Pause Card */}
                        <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Manage Habit</h3>
                                <button
                                    onClick={handleTogglePause}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        habit.paused ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={clsx(
                                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm border border-gray-200",
                                        habit.paused ? "translate-x-[22px]" : "translate-x-[2px]"
                                    )} />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <span className="material-icons-round text-slate-400 flex-shrink-0 mt-0.5">pause_circle</span>
                                <div>
                                    <p className="text-sm font-bold mb-1 text-slate-800 dark:text-white">Pause Habit</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Stop tracking without deleting data. Your streak will be frozen and won't reset if you miss a day.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Score */}
                        <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 p-6">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                                <span className="material-icons-round text-primary text-[18px]">workspace_premium</span>
                                Progress Score
                            </h3>
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                                        Consistency
                                    </span>
                                    <span className="text-xs font-bold inline-block text-primary">
                                        {stats.consistency}%
                                    </span>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-primary/20">
                                    <div
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                                        style={{ width: `${stats.consistency}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                {stats.consistency >= 80 ? "Amazing consistency! Keep it up! 🎉" :
                                    stats.consistency >= 50 ? "Good progress! Stay focused. 💪" :
                                        stats.total > 0 ? "Getting started — every day counts! 🌱" :
                                            "Start logging to see your progress!"}
                            </p>
                        </div>

                        {/* Color tag if set */}
                        {habit.color && (
                            <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 dark:border-slate-800 p-6">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Color Tag</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-700" style={{ backgroundColor: habit.color }}></div>
                                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{habit.color}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
