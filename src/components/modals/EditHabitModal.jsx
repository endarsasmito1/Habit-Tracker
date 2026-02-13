import React from 'react';

export default function EditHabitModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a2e23] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 transform scale-100 transition-all animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary">edit_calendar</span>
                        Edit Habit
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Habit Name</label>
                        <div className="relative">
                            <input
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                placeholder="e.g. Morning Jog"
                                type="text"
                                defaultValue="Reading"
                            />
                            <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">book</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                            <div className="relative">
                                <select className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none font-medium" defaultValue="Learning">
                                    <option>Health</option>
                                    <option>Learning</option>
                                    <option>Mindfulness</option>
                                    <option>Fitness</option>
                                </select>
                                <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">category</span>
                                <span className="material-icons-round absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Time</label>
                            <div className="relative">
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                    type="time"
                                    defaultValue="08:30"
                                />
                                <span className="material-icons-round absolute left-3 top-2.5 text-slate-400">schedule</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Frequency</label>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-pastel-mint text-primary-dark border border-primary/20 shadow-sm">Daily</button>
                            <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">Weekly</button>
                            <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">Monthly</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                <span className="material-icons-round">pause_circle</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Pause Habit</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stop tracking without deleting data</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex items-center gap-2">
                        <span className="material-icons-round text-lg">save</span>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
