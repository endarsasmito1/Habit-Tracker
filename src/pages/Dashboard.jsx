import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api';
import { useSession } from '../lib/auth-client';
import { useOutletContext } from 'react-router-dom';
import { usePomodoro } from '../context/PomodoroContext';

const MOOD_OPTIONS = [
    { emoji: '😫', value: '1', label: 'Struggled' },
    { emoji: '😐', value: '2', label: 'Neutral' },
    { emoji: '😊', value: '3', label: 'Good' },
    { emoji: '🔥', value: '4', label: 'Great' },
    { emoji: '✨', value: '5', label: 'Amazing' },
];

export default function Dashboard() {
    const { data: session } = useSession();
    const { refreshTrigger, openCreateModal } = useOutletContext() || {};
    const pomodoro = usePomodoro();

    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState({ total_completed: 0, active_habits: 0, current_streak: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedHabitId, setSelectedHabitId] = useState(null);

    // Check-in form state (post-Pomodoro)
    const [sessionNote, setSessionNote] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Quick check-in state (per habit, from Up Next cards)
    const [quickCheckinNotes, setQuickCheckinNotes] = useState({});
    const [quickCheckinSubmitting, setQuickCheckinSubmitting] = useState(null);

    // Editable timer (before starting)
    const [editableMinutes, setEditableMinutes] = useState('25');
    const [editableSeconds, setEditableSeconds] = useState('00');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [habitsData, statsData] = await Promise.all([
                    api.get('/habits'),
                    api.get('/analytics/dashboard')
                ]);
                setHabits(habitsData);
                setStats(statsData);
                // Auto-select first uncompleted habit
                const today = new Date().toISOString().split('T')[0];
                const firstUncompleted = habitsData.find(h => {
                    const todayLogs = (h.logs || []).filter(l => l.logDate === today);
                    return todayLogs.length === 0;
                });
                if (firstUncompleted && !selectedHabitId) {
                    setSelectedHabitId(firstUncompleted.id);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchData();
    }, [session, refreshTrigger]);

    // Split habits into Completed Today + Up Next
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    const completedToday = useMemo(() =>
        habits.filter(h => (h.logs || []).some(l => l.logDate === today)),
        [habits, today]
    );

    const upNext = useMemo(() =>
        habits.filter(h => !(h.logs || []).some(l => l.logDate === today)),
        [habits, today]
    );

    const selectedHabit = useMemo(() =>
        habits.find(h => h.id === selectedHabitId) || null,
        [habits, selectedHabitId]
    );

    const timerActive = pomodoro.isRunning || pomodoro.isPaused;
    const hasHabits = habits.length > 0;

    // Select a habit and link to Pomodoro
    const handleSelectHabit = (habit) => {
        if (timerActive) return; // Don't switch while timer is running
        setSelectedHabitId(habit.id);
        pomodoro.setHabitId(habit.id);
        pomodoro.setHabitName(habit.name);
        // Set timer to habit duration if available
        if (habit.durationMins) {
            setEditableMinutes(String(habit.durationMins));
            setEditableSeconds('00');
        }
    };

    const handleStartPomodoro = () => {
        const mins = parseInt(editableMinutes);
        const secs = parseInt(editableSeconds);
        const validMins = isNaN(mins) ? 25 : mins;
        const validSecs = isNaN(secs) ? 0 : secs;
        const totalSecs = validMins * 60 + validSecs;
        if (totalSecs <= 0) return; // Don't start a 0-second timer
        pomodoro.startTimer(
            totalSecs,
            selectedHabit?.id || null,
            selectedHabit?.name || 'Focus Session'
        );
    };

    const handleTimerEdit = (value) => {
        const cleaned = value.replace(/[^0-9:]/g, '');
        const parts = cleaned.split(':');
        if (parts.length === 2) {
            setEditableMinutes(parts[0].slice(0, 2) || '0');
            setEditableSeconds(parts[1].slice(0, 2) || '0');
        } else if (parts.length === 1) {
            setEditableMinutes(parts[0].slice(0, 2) || '0');
        }
    };

    // Guard: normalize empty timer values on blur
    const handleTimerBlur = () => {
        setIsEditing(false);
        if (!editableMinutes && !editableSeconds) {
            setEditableMinutes('25');
            setEditableSeconds('00');
        } else {
            setEditableMinutes(prev => prev || '0');
            setEditableSeconds(prev => prev || '00');
        }
    };

    // Quick check-in (without Pomodoro)
    const handleQuickCheckin = async (habit) => {
        setQuickCheckinSubmitting(habit.id);
        try {
            await api.post(`/habits/${habit.id}/check-in`, {
                notes: quickCheckinNotes[habit.id] || null,
                mood: null,
            });
            // Refetch habits
            const habitsData = await api.get('/habits');
            setHabits(habitsData);
            // Clear note for this habit
            setQuickCheckinNotes(prev => { const copy = { ...prev }; delete copy[habit.id]; return copy; });
            // Auto-select next uncompleted habit
            const nextUncompleted = habitsData.find(h => {
                const todayLogs = (h.logs || []).filter(l => l.logDate === today);
                return todayLogs.length === 0;
            });
            setSelectedHabitId(nextUncompleted?.id || null);
        } catch (error) {
            console.error('Quick check-in failed:', error);
        } finally {
            setQuickCheckinSubmitting(null);
        }
    };

    const getEstFinish = () => {
        const mins = parseInt(editableMinutes);
        const secs = parseInt(editableSeconds);
        const validMins = isNaN(mins) ? 25 : mins;
        const validSecs = isNaN(secs) ? 0 : secs;
        const finishDate = new Date(Date.now() + (validMins * 60 + validSecs) * 1000);
        return finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Complete habit check-in
    const handleCompleteHabit = async () => {
        if (!selectedHabit) {
            // No habit linked — just reset timer
            pomodoro.resetTimer();
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post(`/habits/${selectedHabit.id}/check-in`, {
                notes: sessionNote || null,
                mood: selectedMood || null,
            });
            // Refetch habits to update completed/up-next lists
            const habitsData = await api.get('/habits');
            setHabits(habitsData);
            // Auto-select next uncompleted habit
            const nextUncompleted = habitsData.find(h => {
                const todayLogs = (h.logs || []).filter(l => l.logDate === today);
                return todayLogs.length === 0;
            });
            setSelectedHabitId(nextUncompleted?.id || null);
            // Reset form
            setSessionNote('');
            setSelectedMood(null);
            pomodoro.resetTimer();
        } catch (error) {
            console.error("Failed to check in:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark pb-10">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Daily Focus</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                        <span className="material-icons-round text-base text-primary">local_fire_department</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">{stats.current_streak} Day Streak</span> • Keep the momentum going!
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-400">
                        <span className="material-icons-round">notifications_none</span>
                    </button>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex items-center gap-4 bg-pastel-mint/30 dark:bg-green-900/10 px-5 py-2.5 rounded-2xl border border-pastel-mint dark:border-green-900/30">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-green-600/60 dark:text-green-400/60 uppercase tracking-widest mb-0.5">Today</p>
                            <p className="text-sm font-bold text-green-900 dark:text-green-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="h-8 w-px bg-green-200 dark:bg-green-800/30"></div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-green-600/60 dark:text-green-400/60 uppercase tracking-widest mb-0.5">Time</p>
                            <p className="text-sm font-bold font-mono text-green-800 dark:text-green-200">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-8 py-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* ==================== LEFT COLUMN ==================== */}
                    <div className="xl:col-span-4 space-y-8">

                        {/* --- Completed Today --- */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 ml-1">Completed Today</h3>
                            {completedToday.length > 0 ? (
                                <div className="space-y-4">
                                    {completedToday.map(habit => {
                                        const todayLog = (habit.logs || []).find(l => l.logDate === today);
                                        return (
                                            <div key={habit.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft transition-all group hover:border-primary/30">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-pastel-mint text-green-600 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                            <span className="material-icons-round">check</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{habit.name}</h4>
                                                            <span className="inline-block px-2.5 py-1 bg-primary/10 rounded-lg text-xs font-bold text-green-700 dark:text-green-400 mt-1">{habit.category}</span>
                                                        </div>
                                                    </div>
                                                    {todayLog && (
                                                        <span className="text-xs font-mono text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30">
                                                            {new Date(todayLog.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {todayLog?.notes && (
                                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Check-in Note</label>
                                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{todayLog.notes}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Empty state: No habits completed yet */
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-pastel-mint/30 flex items-center justify-center text-primary mb-6">
                                        <span className="material-icons-round text-5xl">task_alt</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">No habits completed yet</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-[200px]">Start your day by finishing your first task!</p>
                                    {!hasHabits && (
                                        <button
                                            onClick={openCreateModal}
                                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-slate-900 font-bold py-3 px-6 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                        >
                                            <span className="material-icons-round text-lg">add</span>
                                            <span>Create New Habit</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- Up Next --- */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 ml-1">Up Next</h3>
                            {upNext.length > 0 ? (
                                <div className="space-y-4">
                                    {upNext.map(habit => {
                                        const isSelected = habit.id === selectedHabitId;
                                        const isQuickSubmitting = quickCheckinSubmitting === habit.id;
                                        return (
                                            <div
                                                key={habit.id}
                                                onClick={() => handleSelectHabit(habit)}
                                                className={clsx(
                                                    "bg-white dark:bg-slate-900 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md",
                                                    isSelected
                                                        ? "ring-2 ring-primary border-primary/30 bg-pastel-mint/10 dark:bg-green-900/10"
                                                        : "border-slate-100 dark:border-slate-800 hover:border-primary/30"
                                                )}
                                            >
                                                {/* Habit header row */}
                                                <div className="p-5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={clsx(
                                                            "w-1.5 h-8 rounded-full transition-colors",
                                                            isSelected ? "bg-primary" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/60"
                                                        )}></div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{habit.name}</h4>
                                                            <span className="text-xs font-medium text-slate-400 mt-0.5 block">{habit.category} • {habit.durationMins || 25} min</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                                                        <span className="material-icons-round text-lg">auto_stories</span>
                                                    </div>
                                                </div>

                                                {/* Quick check-in form (expanded when selected) */}
                                                {isSelected && (
                                                    <div className="px-5 pb-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Check-in Note</label>
                                                        <textarea
                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all h-20 resize-none"
                                                            placeholder="Any thoughts for today?"
                                                            value={quickCheckinNotes[habit.id] || ''}
                                                            onChange={(e) => setQuickCheckinNotes(prev => ({ ...prev, [habit.id]: e.target.value }))}
                                                        />
                                                        <button
                                                            onClick={() => handleQuickCheckin(habit)}
                                                            disabled={isQuickSubmitting}
                                                            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="material-icons-round text-lg">check_circle</span>
                                                            <span>{isQuickSubmitting ? 'Saving...' : 'Complete Habit'}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : hasHabits ? (
                                /* All habits completed */
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-pastel-mint/30 flex items-center justify-center text-primary mb-6">
                                        <span className="material-icons-round text-5xl">celebration</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">All done for today! 🎉</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Great work! You've completed all your habits.</p>
                                </div>
                            ) : (
                                /* Empty state: No habits at all */
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-pastel-mint/30 flex items-center justify-center text-primary mb-6">
                                        <span className="material-icons-round text-5xl">event_busy</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">Schedule is empty</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-[200px]">Plan your next moves to stay on track.</p>
                                    <button
                                        onClick={openCreateModal}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-slate-900 font-bold py-3 px-6 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                    >
                                        <span className="material-icons-round text-lg">add</span>
                                        <span>Create New Habit</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ==================== RIGHT COLUMN — POMODORO ==================== */}
                    <div className="xl:col-span-8">
                        <div className="h-full flex flex-col">

                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-5 px-1">
                                <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className={clsx("w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(74,222,128,0.6)]", timerActive && "animate-pulse")}></span>
                                    Current Focus
                                </h3>
                                {selectedHabit && !pomodoro.isComplete && (
                                    <button className="text-slate-400 hover:text-red-400 transition-colors text-xs font-bold flex items-center gap-1.5 group bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                        <span className="material-icons-round text-sm group-hover:scale-110 transition-transform">ac_unit</span>
                                        Freeze / Skip Habit
                                    </button>
                                )}
                            </div>

                            {/* Main Pomodoro Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-12 shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden flex-1 flex flex-col justify-center items-center text-center">
                                {/* Decorations */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
                                <div className="absolute -top-32 -right-32 w-80 h-80 bg-pastel-mint/40 rounded-full blur-[80px] pointer-events-none"></div>
                                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

                                {selectedHabit ? (
                                    <>
                                        {/* Category badge */}
                                        <span className="inline-flex items-center gap-2 px-5 py-2 bg-pastel-mint/50 dark:bg-green-900/30 rounded-full text-sm font-bold text-green-700 dark:text-green-300 mb-8 border border-pastel-mint dark:border-green-800/30 backdrop-blur-sm">
                                            <span className="material-icons-round text-lg">auto_stories</span>
                                            {selectedHabit.category}
                                        </span>

                                        {/* Habit title */}
                                        <h2 className="text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
                                            {selectedHabit.name}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                                            {selectedHabit.description || 'Deep work session. Focus on practical takeaways.'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        {/* Empty/generic title */}
                                        <h2 className="text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">POMODORO SESSION</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                                            Select a habit or start a quick focus session to stay productive.
                                        </p>
                                    </>
                                )}

                                {/* Timer Display */}
                                <div className="mb-14 relative group cursor-pointer select-none">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    {timerActive ? (
                                        <div className="relative z-10">
                                            <div className="text-8xl lg:text-[10rem] font-mono font-bold text-slate-800 dark:text-white tracking-tighter tabular-nums leading-none">
                                                {pomodoro.formatTime(pomodoro.remainingSeconds)}
                                            </div>
                                            {pomodoro.isPaused && (
                                                <p className="text-amber-500 text-sm mt-4 font-bold uppercase tracking-[0.2em] animate-pulse">Paused</p>
                                            )}
                                            {pomodoro.isRunning && (
                                                <p className="text-green-600/70 dark:text-green-400/70 text-sm mt-4 font-bold uppercase tracking-[0.2em]">Pomodoro Session</p>
                                            )}
                                        </div>
                                    ) : pomodoro.isComplete ? (
                                        <div className="relative z-10">
                                            <div className="text-8xl lg:text-[10rem] font-mono font-bold text-slate-800 dark:text-white tracking-tighter tabular-nums leading-none">
                                                00:00
                                            </div>
                                            <p className="text-green-600/70 dark:text-green-400/70 text-sm mt-4 font-bold uppercase tracking-[0.2em]">Session Complete!</p>
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    className="bg-transparent border-b-2 border-dashed border-slate-200 dark:border-slate-700 focus:border-primary focus:outline-none text-center tabular-nums cursor-text text-8xl lg:text-[10rem] font-mono font-bold text-slate-800 dark:text-white tracking-tighter leading-none"
                                                    style={{ width: '2.8em', fontFamily: 'inherit' }}
                                                    type="text"
                                                    value={`${editableMinutes}:${editableSeconds}`}
                                                    onChange={(e) => handleTimerEdit(e.target.value)}
                                                    onFocus={() => setIsEditing(true)}
                                                    onBlur={handleTimerBlur}
                                                />
                                                {!isEditing && (
                                                    <span className="material-icons-round text-slate-300 dark:text-slate-600 text-3xl lg:text-4xl">edit</span>
                                                )}
                                            </div>
                                            <p className="text-green-600/70 dark:text-green-400/70 text-sm mt-4 font-bold uppercase tracking-[0.2em]">
                                                {selectedHabit ? 'Pomodoro Session' : 'Focus Timer'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* === UI 2: Completion Check-in Form === */}
                                {pomodoro.isComplete && selectedHabit ? (
                                    <div className="w-full max-w-md space-y-6">
                                        <div className="text-left">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Session Note</label>
                                            <textarea
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-24 text-slate-700 dark:text-slate-200"
                                                placeholder="How did it go? Capture your progress..."
                                                value={sessionNote}
                                                onChange={(e) => setSessionNote(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-wider text-center">How do you feel?</label>
                                            <div className="flex justify-center gap-4">
                                                {MOOD_OPTIONS.map(m => (
                                                    <button
                                                        key={m.value}
                                                        onClick={() => setSelectedMood(m.value)}
                                                        className={clsx(
                                                            "text-3xl hover:scale-125 transition-transform",
                                                            selectedMood === m.value
                                                                ? "ring-2 ring-primary rounded-full p-1 bg-pastel-mint/30 grayscale-0 scale-110"
                                                                : "grayscale hover:grayscale-0"
                                                        )}
                                                        title={m.label}
                                                    >
                                                        {m.emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCompleteHabit}
                                            disabled={isSubmitting}
                                            className="w-full bg-primary hover:bg-primary-dark text-slate-900 text-xl font-bold py-5 px-8 rounded-3xl shadow-glow hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-icons-round text-3xl">done_all</span>
                                            <span>{isSubmitting ? 'Saving...' : 'Complete Habit'}</span>
                                        </button>
                                    </div>
                                ) : pomodoro.isComplete && !selectedHabit ? (
                                    /* Complete but no habit linked → just reset */
                                    <button
                                        onClick={() => pomodoro.resetTimer()}
                                        className="w-full max-w-sm bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <span className="material-icons-round text-2xl">refresh</span>
                                        New Session
                                    </button>
                                ) : (
                                    /* === Normal Controls: Start / Pause / Resume / Cancel === */
                                    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
                                        {timerActive ? (
                                            <div className="flex gap-3 w-full">
                                                <button
                                                    onClick={pomodoro.isRunning ? pomodoro.pauseTimer : pomodoro.resumeTimer}
                                                    className={clsx(
                                                        "flex-1 text-white text-lg font-bold py-4 px-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3",
                                                        pomodoro.isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary-dark"
                                                    )}
                                                >
                                                    <span className="material-icons-round text-2xl">{pomodoro.isRunning ? 'pause' : 'play_arrow'}</span>
                                                    {pomodoro.isRunning ? 'Pause' : 'Resume'}
                                                </button>
                                                <button
                                                    onClick={pomodoro.resetTimer}
                                                    className="px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-200 transition-all"
                                                    title="Cancel"
                                                >
                                                    <span className="material-icons-round text-2xl">stop</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleStartPomodoro}
                                                    className="w-full bg-gradient-to-b from-primary/80 to-primary hover:to-primary-dark text-slate-900 text-xl font-bold py-5 px-8 rounded-3xl shadow-glow hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <span className="material-icons-round text-3xl">play_arrow</span>
                                                    <span>Start Pomodoro</span>
                                                </button>
                                                <div className="w-full flex justify-between text-xs font-semibold text-slate-400 px-4">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Est. Finish: {getEstFinish()}</span>
                                                    <span className="text-green-600 dark:text-green-400">+5 XP</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-primary/30 transition-colors shadow-sm">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-green-600">
                                        <span className="material-icons-round">history</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Time</p>
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.total_completed} sessions</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-primary/30 transition-colors shadow-sm">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-green-600">
                                        <span className="material-icons-round">local_fire_department</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Streak</p>
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.current_streak} Days</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-primary/30 transition-colors shadow-sm">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-green-600">
                                        <span className="material-icons-round">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</p>
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.active_habits} Habits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
