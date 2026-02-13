import { useState } from 'react';
import clsx from 'clsx';

export default function CreateHabitModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden dark:text-white animate-fade-in-up bg-white/80 dark:bg-[#15281b]/90 border border-white/20 backdrop-blur-xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <span className="material-icons-round">close</span>
                </button>

                <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-mint dark:bg-primary/20 flex items-center justify-center mb-4 text-primary-dark dark:text-primary">
                        <span className="material-icons-round text-2xl">auto_fix_high</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create New Habit</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Build a routine that sticks with small steps.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Habit Name</label>
                        <input
                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400"
                            placeholder="e.g. Read 10 pages, Drink Water..."
                            type="text"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Frequency</label>
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Weekdays</option>
                                    <option>Weekends</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <span className="material-icons-round">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Color Tag</label>
                            <div className="flex gap-2 items-center h-[46px]">
                                <button type="button" className="w-8 h-8 rounded-full bg-pastel-mint border-2 border-primary ring-2 ring-offset-2 ring-primary/20 dark:ring-offset-[#1a2e23]"></button>
                                <button type="button" className="w-8 h-8 rounded-full bg-pastel-lavender hover:scale-110 transition-transform"></button>
                                <button type="button" className="w-8 h-8 rounded-full bg-pastel-peach hover:scale-110 transition-transform"></button>
                                <button type="button" className="w-8 h-8 rounded-full bg-blue-100 hover:scale-110 transition-transform"></button>
                                <button type="button" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:scale-110 transition-transform flex items-center justify-center text-slate-400">
                                    <span className="material-icons-round text-sm">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons-round text-indigo-500 text-sm">layers</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">Habit Stacking</span>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">After which existing habit?</label>
                        <div className="relative">
                            <select className="w-full bg-white dark:bg-slate-800/50 border border-indigo-200 dark:border-indigo-800/50 rounded-lg px-4 py-2.5 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none text-sm cursor-pointer">
                                <option>Select an existing habit...</option>
                                <option>After Morning Coffee</option>
                                <option>After Brushing Teeth</option>
                                <option>After Lunch Break</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <span className="material-icons-round text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="reminder-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-primary" />
                                <label htmlFor="reminder-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer transition-colors duration-200 ease-in-out peer-checked:bg-primary"></label>
                            </div>
                            <label htmlFor="reminder-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                Reminder Email
                            </label>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="flex-[2] bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:translate-y-px hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round">check</span>
                            Create Habit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
