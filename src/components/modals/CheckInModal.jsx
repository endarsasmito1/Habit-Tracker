import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function CheckInModal({ isOpen, onClose, habit, initialTimeSpent = 0, onSuccess }) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'completed' | 'skipped'

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setNotes('');
            setStatus(null);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen || !habit) return null;

    const handleSubmit = async (actionStatus) => {
        setLoading(true);
        setStatus(actionStatus);

        try {
            await api.post('/checkins', {
                habitId: habit.id,
                date: new Date().toISOString().split('T')[0],
                status: actionStatus, // 'completed' or 'skipped'
                notes: notes,
                timeSpent: initialTimeSpent, // in minutes? The schema calls for 'integer'. Let's assume minutes or handle in backend. 
                // schema says 'time_spent' integer. Let's send minutes.
                moodRating: null // Optional
            });

            if (onSuccess) onSuccess();
            // Close after brief delay or immediately?
            // UX: Maybe show success state? The design shows "Done" button. 
            // I'll close immediately for now.
            onClose();
        } catch (error) {
            console.error('Check-in failed:', error);
            // Handle error (maybe show alert)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112116]/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[520px] bg-white dark:bg-[#1a2e23] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#111813] dark:text-white">{habit.name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                <span className="material-icons-round text-[14px]">local_fire_department</span>
                                Streak: {habit.streak || 0} Days
                            </span>
                            <span className="text-xs font-medium text-neutral-gray/70 dark:text-slate-400 flex items-center gap-1">
                                <span className="material-icons-round text-[14px]">schedule</span>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-gray dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-8 py-4 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSubmit('completed')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && status === 'completed' ? (
                                <span className="material-icons-round animate-spin">refresh</span>
                            ) : (
                                <span className="material-icons-round">done_all</span>
                            )}
                            Done
                        </button>
                        <button
                            onClick={() => handleSubmit('skipped')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#FF8B8B] hover:bg-[#FF8B8B]/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-[#FF8B8B]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && status === 'skipped' ? (
                                <span className="material-icons-round animate-spin">refresh</span>
                            ) : (
                                <span className="material-icons-round">fast_forward</span>
                            )}
                            Skip
                        </button>
                    </div>

                    {/* Notes & Reflections */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-neutral-gray dark:text-slate-300">Notes & Reflections</label>
                            <span className="text-[10px] text-neutral-gray/50 dark:text-slate-500 font-medium italic">Optional</span>
                        </div>
                        <textarea
                            className="w-full min-h-[160px] p-4 rounded-lg border border-neutral-border dark:border-slate-700 bg-[#f6f8f6]/30 dark:bg-slate-800/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-base text-slate-800 dark:text-slate-200 placeholder:text-neutral-gray/40 dark:placeholder:text-slate-600 transition-colors resize-none"
                            placeholder="How did you feel today? Any breakthroughs or distractions during your practice?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 pb-8 pt-2">
                    <div className="flex items-center justify-between p-4 bg-[#f6f8f6] dark:bg-slate-800/50 rounded-lg border border-neutral-border dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                                <span className="material-icons-round text-primary">award_star</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#111813] dark:text-white">Next Milestone</p>
                                <p className="text-[10px] text-neutral-gray dark:text-slate-400">3 days until 15-day badge</p>
                            </div>
                        </div>
                        <div className="w-24 bg-white dark:bg-slate-700 h-2 rounded-full overflow-hidden border border-neutral-border dark:border-slate-600">
                            <div className="bg-primary h-full w-[80%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
