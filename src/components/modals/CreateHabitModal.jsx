import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { api } from '../../lib/api';

const DEFAULT_COLORS = [
    { label: 'Mint', value: '#dcfce7', bg: 'bg-[#dcfce7]' },
    { label: 'Lavender', value: '#f3e8ff', bg: 'bg-[#f3e8ff]' },
    { label: 'Peach', value: '#ffedd5', bg: 'bg-[#ffedd5]' },
    { label: 'Sky', value: '#dbeafe', bg: 'bg-[#dbeafe]' },
    { label: 'Rose', value: '#ffe4e6', bg: 'bg-[#ffe4e6]' },
    { label: 'Amber', value: '#fef3c7', bg: 'bg-[#fef3c7]' },
];

const DEFAULT_CATEGORIES = [
    'Health', 'Mindfulness', 'Productivity', 'Learning', 'Fitness', 'Financial', 'Routine',
];

export default function CreateHabitModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customColor, setCustomColor] = useState('#30e86e');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        frequency: 'daily',
        category: '',
        color: '#dcfce7',
        targetTime: '',
        reminderEnabled: false,
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch categories
            api.get('/categories').then(cats => {
                setCategories(cats);
            }).catch(() => { });

            // Reset form
            setFormData({
                name: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                frequency: 'daily',
                category: '',
                color: '#dcfce7',
                targetTime: '',

                reminderEnabled: false,
            });
            setShowAddCategory(false);
            setEditingCategory(null);
            setShowColorPicker(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/habits', {
                name: formData.name,
                description: formData.description || null,
                startDate: formData.startDate,
                frequency: formData.frequency,
                category: formData.category || 'General',
                color: formData.color,
                targetTime: formData.targetTime || null,

                reminderEnabled: formData.reminderEnabled,
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create habit:", error);
            alert("Failed to create habit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Category CRUD
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const cat = await api.post('/categories', { name: newCategoryName.trim() });
            setCategories(prev => [...prev, cat]);
            setFormData(prev => ({ ...prev, category: cat.name }));
            setNewCategoryName('');
            setShowAddCategory(false);
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleEditCategory = async (cat) => {
        if (!editCategoryName.trim()) return;
        try {
            const updated = await api.patch(`/categories/${cat.id}`, { name: editCategoryName.trim() });
            setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
            if (formData.category === cat.name) {
                setFormData(prev => ({ ...prev, category: updated.name }));
            }
            setEditingCategory(null);
            setEditCategoryName('');
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!confirm(`Delete category "${cat.name}"?`)) return;
        try {
            await api.delete(`/categories/${cat.id}`);
            setCategories(prev => prev.filter(c => c.id !== cat.id));
            if (formData.category === cat.name) {
                setFormData(prev => ({ ...prev, category: '' }));
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };



    const handleAddCustomColor = () => {
        setFormData(prev => ({ ...prev, color: customColor }));
        setShowColorPicker(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/5 dark:bg-slate-900/20 backdrop-blur-[1px]">
            <div className="w-full max-w-lg rounded-3xl shadow-super-soft p-8 relative overflow-hidden dark:text-white bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <span className="material-icons-round">close</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] dark:bg-primary/20 flex items-center justify-center mb-4 text-green-700 dark:text-primary">
                        <span className="material-icons-round text-2xl">auto_fix_high</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create New Habit</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Build a routine that sticks with small steps.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Habit Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Habit Name</label>
                        <input
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 focus:bg-white"
                            placeholder="e.g. Read 10 pages, Drink Water..."
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            data-testid="habit-name-input"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Description</label>
                        <input
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 focus:bg-white"
                            placeholder="e.g., Follow the 2-minute rule"
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            data-testid="habit-description-input"
                        />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Start Date</label>
                        <div className="relative group">
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer font-medium focus:bg-white"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <div className="w-6 h-6 bg-[#dcfce7] rounded-full flex items-center justify-center">
                                    <span className="material-icons-round text-green-700 text-sm">calendar_today</span>
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-icons-round text-xl">event</span>
                            </div>
                        </div>
                    </div>

                    {/* Time (24h format) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Time <span className="text-slate-400 font-normal text-xs">(24h format, optional)</span></label>
                        <div className="relative group">
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium focus:bg-white"
                                type="time"
                                value={formData.targetTime}
                                onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                                step="60"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <div className="w-6 h-6 bg-[#dbeafe] rounded-full flex items-center justify-center">
                                    <span className="material-icons-round text-blue-600 text-sm">schedule</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category with Add/Edit/Delete */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Category</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer focus:bg-white"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    data-testid="habit-category-select"
                                >
                                    <option value="">Select category...</option>
                                    {DEFAULT_CATEGORIES.map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                    {categories.length > 0 && (
                                        <optgroup label="Your Categories">
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <span className="material-icons-round">expand_more</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(!showAddCategory)}
                                className="p-3 bg-[#dcfce7] dark:bg-primary/20 text-green-700 dark:text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center"
                                title="Manage Categories"
                            >
                                <span className="material-icons-round text-xl">{showAddCategory ? 'close' : 'add'}</span>
                            </button>
                        </div>

                        {/* Category Management Panel */}
                        {showAddCategory && (
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                                {/* Add new category */}
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                        placeholder="New category name..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        disabled={!newCategoryName.trim()}
                                        className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Existing user categories */}
                                {categories.length > 0 && (
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your categories</p>
                                        {categories.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-2 group">
                                                {editingCategory === cat.id ? (
                                                    <>
                                                        <input
                                                            className="flex-1 bg-white dark:bg-slate-800 border border-primary/50 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white focus:outline-none"
                                                            value={editCategoryName}
                                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleEditCategory(cat))}
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={() => handleEditCategory(cat)} className="p-1 text-primary hover:bg-primary/10 rounded">
                                                            <span className="material-icons-round text-[16px]">check</span>
                                                        </button>
                                                        <button type="button" onClick={() => setEditingCategory(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                                            <span className="material-icons-round text-[16px]">close</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{cat.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEditingCategory(cat.id); setEditCategoryName(cat.name); }}
                                                            className="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="material-icons-round text-[16px]">edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCategory(cat)}
                                                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="material-icons-round text-[16px]">delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Frequency + Color Tag */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Frequency</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer focus:bg-white"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    data-testid="habit-frequency-select"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="weekdays">Weekdays</option>
                                    <option value="weekends">Weekends</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <span className="material-icons-round">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Color Tag</label>
                            <div className="flex gap-2 items-center h-[46px] flex-wrap">
                                {DEFAULT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={clsx(
                                            "w-8 h-8 rounded-full transition-transform hover:scale-110",
                                            formData.color === color.value
                                                ? "border-2 border-primary ring-2 ring-offset-2 ring-primary/20 dark:ring-offset-slate-900"
                                                : ""
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        title={color.label}
                                    />
                                ))}
                                {/* Custom color button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                        className={clsx(
                                            "w-8 h-8 rounded-full hover:scale-110 transition-transform flex items-center justify-center",
                                            !DEFAULT_COLORS.find(c => c.value === formData.color)
                                                ? "ring-2 ring-offset-2 ring-primary/20 dark:ring-offset-slate-900 border-2 border-primary"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                        )}
                                        style={!DEFAULT_COLORS.find(c => c.value === formData.color) ? { backgroundColor: formData.color } : {}}
                                    >
                                        {DEFAULT_COLORS.find(c => c.value === formData.color) && (
                                            <span className="material-icons-round text-sm">add</span>
                                        )}
                                    </button>
                                    {showColorPicker && (
                                        <div className="absolute bottom-10 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 z-10 w-48">
                                            <p className="text-xs font-bold text-slate-500 mb-2">Custom Color</p>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-700 dark:text-white"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddCustomColor}
                                                className="mt-2 w-full bg-primary text-white text-xs font-bold py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Reminder Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="toggle"
                                    id="reminder-toggle"
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-primary"
                                    checked={formData.reminderEnabled}
                                    onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                                />
                                <label htmlFor="reminder-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer transition-colors duration-200 ease-in-out"></label>
                            </div>
                            <label htmlFor="reminder-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                Reminder Email
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-primary hover:bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:translate-y-px hover:shadow-md flex items-center justify-center gap-2"
                            data-testid="create-habit-submit-btn"
                        >
                            {loading ? (
                                <span className="material-icons-round animate-spin">refresh</span>
                            ) : (
                                <>
                                    <span className="material-icons-round">check</span>
                                    Create Habit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
