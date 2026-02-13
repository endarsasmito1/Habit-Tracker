import React from 'react';

export default function DeleteHabitModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-700 transform transition-all scale-100 opacity-100 animate-zoom-in">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto flex items-center justify-center mb-4">
                        <span className="material-icons-round text-coral-soft text-2xl">delete_outline</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Habit?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to delete this habit? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors w-full"
                        >
                            Cancel
                        </button>
                        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-coral-soft hover:bg-rose-500 shadow-md shadow-rose-200 dark:shadow-none transition-colors w-full">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
