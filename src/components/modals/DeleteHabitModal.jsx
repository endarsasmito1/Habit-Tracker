import { useEffect } from 'react';

export default function DeleteHabitModal({ isOpen, onClose, onConfirm, habitName }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-[#1a2e23] w-full max-w-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 transform transition-all scale-100"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-red-500">
                        <span className="material-icons-round text-2xl">warning</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Habit?</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">"{habitName}"</span>?
                            This action cannot be undone and all history will be lost.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95"
                        data-testid="confirm-delete-btn"
                    >
                        Delete Habit
                    </button>
                </div>
            </div>
        </div>
    );
}
