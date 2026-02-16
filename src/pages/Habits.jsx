import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api';
import { useOutletContext, useNavigate } from 'react-router-dom';
import DeleteHabitModal from '../components/modals/DeleteHabitModal';

// Icon/color map for categories
const categoryMeta = {
    'Health': { icon: 'favorite', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
    'Health & Wellness': { icon: 'water_drop', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-500' },
    'Personal Growth': { icon: 'menu_book', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500' },
    'Learning': { icon: 'school', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-500' },
    'Financial': { icon: 'payments', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600' },
    'Fitness': { icon: 'fitness_center', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-500' },
    'Routine': { icon: 'wb_sunny', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600' },
    'Mindfulness': { icon: 'self_improvement', bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-500' },
    'General': { icon: 'check_circle', bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-primary' },
};

function getCategoryMeta(category) {
    return categoryMeta[category] || categoryMeta['General'];
}

export default function Habits() {
    const { refreshTrigger, openCreateModal } = useOutletContext() || {};
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false); // Visual loading state
    const [editingHabit, setEditingHabit] = useState(null);
    const [deletingHabit, setDeletingHabit] = useState(null); // ID of habit to delete
    const [editForm, setEditForm] = useState({});

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+K or Ctrl+K to focus search (or open new habit if desired, user asked for New Habit shortcut)
            // Let's implement Cmd+K for New Habit as requested "Cmd+K / N"
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCreateModal?.();
            }
            if (e.key === 'n' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                openCreateModal?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openCreateModal]);

    // Value change with debounce visual effect
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 400); // Fake loading effect for UX
    };

    const fetchHabits = async () => {
        console.log('Fetching habits...');
        try {
            const data = await api.get('/habits');
            console.log('Fetched habits count:', data.length);
            setHabits(data);
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Refresh triggered:', refreshTrigger);
        fetchHabits();
    }, [refreshTrigger]);

    const filteredHabits = useMemo(() => {
        if (!searchQuery.trim()) return habits;
        const q = searchQuery.toLowerCase();
        return habits.filter(h =>
            h.name.toLowerCase().includes(q) ||
            (h.category && h.category.toLowerCase().includes(q)) ||
            (h.description && h.description.toLowerCase().includes(q))
        );
    }, [habits, searchQuery]);

    const stats = useMemo(() => ({
        totalActive: habits.length,
        avgCompletion: 84, // placeholder, would need logs data
        peakStreak: 18,    // placeholder, would need logs data
    }), [habits]);

    const handleDeleteClick = (habit) => {
        setDeletingHabit(habit);
    };

    const confirmDelete = async () => {
        if (!deletingHabit) return;
        try {
            await api.delete(`/habits/${deletingHabit.id}`);
            setHabits(prev => prev.filter(h => h.id !== deletingHabit.id));
            setDeletingHabit(null);
        } catch (error) {
            console.error('Failed to delete habit:', error);
        }
    };

    const handleEditStart = (habit) => {
        setEditingHabit(habit.id);
        setEditForm({
            name: habit.name,
            category: habit.category,
            description: habit.description || '',
            frequency: habit.frequency,
        });
    };

    const handleEditSave = async () => {
        try {
            const updated = await api.patch(`/habits/${editingHabit}`, editForm);
            setHabits(prev => prev.map(h => h.id === editingHabit ? { ...h, ...updated } : h));
            setEditingHabit(null);
        } catch (error) {
            console.error('Failed to update habit:', error);
        }
    };

    const handleCheckIn = async (habit, e) => {
        e.stopPropagation();
        try {
            await api.post(`/habits/${habit.id}/check-in`, { status: 'completed' });
            // Optimistic update or refetch? Refetch for now to get stats
            fetchHabits();
        } catch (error) {
            console.error('Failed to check in:', error);
        }
    };



    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark pb-10">
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">My Habits</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your daily routines effortlessly.</p>
                    </div>
                    <button
                        onClick={() => openCreateModal?.()}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-slate-900 font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <span className="material-icons-round text-[20px]">add</span>
                        Add New Habit
                    </button>
                </div>

                {/* Stats Quick View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-[#1a2e23] p-6 rounded-xl border border-primary/10 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-icons-round">bolt</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Active Habits</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalActive}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2e23] p-6 rounded-xl border border-primary/10 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-icons-round">trending_up</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg. Completion</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.avgCompletion}%</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1a2e23] p-6 rounded-xl border border-primary/10 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-icons-round">military_tech</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Peak Streak</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.peakStreak} Days</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2e23] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary transition-all outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                            placeholder="Search habits..."
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            data-testid="habits-search-input"
                        />
                        {isSearching && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white dark:bg-[#1a2e23] border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                            <span className="material-icons-round text-[18px]">filter_list</span>
                            Filter
                        </button>
                        <button className="bg-white dark:bg-[#1a2e23] border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                            Sort
                            <span className="material-icons-round text-[18px]">expand_more</span>
                        </button>
                    </div>
                </div>

                {/* Habits Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredHabits.map(habit => {
                        const meta = getCategoryMeta(habit.category);
                        const isEditing = editingHabit === habit.id;

                        return (
                            <div key={habit.id} className="group bg-white dark:bg-[#1a2e23] rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer" onClick={() => !isEditing && navigate(`/habits/${habit.id}`)} data-testid="habit-card">
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", meta.bg, meta.text)}>
                                        <span className="material-icons-round text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => isEditing ? handleEditSave() : handleEditStart(habit)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-primary transition-colors"
                                            title={isEditing ? 'Save' : 'Edit'}
                                        >
                                            <span className="material-icons-round text-[18px]">{isEditing ? 'check' : 'edit'}</span>
                                        </button>
                                        {isEditing ? (
                                            <button
                                                onClick={() => setEditingHabit(null)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                                title="Cancel"
                                            >
                                                <span className="material-icons-round text-[18px]">close</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(habit);
                                                }}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                                data-testid="delete-habit-btn"
                                            >
                                                <span className="material-icons-round text-[18px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="Habit name"
                                        />
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            placeholder="Category"
                                        />
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={editForm.frequency}
                                            onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="weekdays">Weekdays</option>
                                            <option value="weekends">Weekends</option>
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{habit.name}</h3>
                                            <button
                                                onClick={(e) => handleCheckIn(habit, e)}
                                                className="text-slate-300 hover:text-green-500 transition-colors"
                                                title="Check-in"
                                            >
                                                <span className="material-icons-round text-3xl hover:scale-110 transition-transform">check_circle_outline</span>
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                                            <span className="material-icons-round text-[14px]">category</span>
                                            {habit.category}
                                        </p>

                                        {/* Stats */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-2xl font-black text-primary">{habit.streak || 0}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Day Streak</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequency</span>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{habit.frequency}</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {/* Add New Habit Placeholder Card */}
                    <div
                        onClick={() => openCreateModal?.()}
                        className="bg-primary/5 dark:bg-primary/5 border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/10 transition-all group min-h-[200px]"
                        data-testid="add-new-habit-card"
                    >
                        <div className="w-12 h-12 bg-primary text-slate-900 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="material-icons-round">add</span>
                        </div>
                        <p className="font-bold text-primary">Add Another Habit</p>
                    </div>
                </div>

                {/* View Archived */}
                <div className="mt-12 flex justify-center">
                    <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                        View Archived Habits
                        <span className="material-icons-round text-[18px]">history</span>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteHabitModal
                isOpen={!!deletingHabit}
                onClose={() => setDeletingHabit(null)}
                onConfirm={confirmDelete}
                habitName={deletingHabit?.name}
            />
        </div>
    );
}
