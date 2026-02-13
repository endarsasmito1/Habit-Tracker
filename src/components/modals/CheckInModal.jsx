import React from 'react';

export default function CheckInModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a2e23] w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-zoom-in">
                <div className="relative bg-gradient-to-br from-pastel-mint to-white dark:from-[#204a2e] dark:to-[#1a2e23] p-8 pb-12 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white dark:bg-[#1a2e23] rounded-full flex items-center justify-center shadow-lg mb-6 ring-4 ring-white/50 dark:ring-white/5">
                            <span className="material-icons-round text-5xl text-primary animate-bounce">check_circle</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">Morning Jog Completed!</h2>
                        <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-black/20 px-4 py-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-sm">
                            <span className="material-icons-round text-slate-500 text-sm">schedule</span>
                            <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">07:15:20</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 -mt-6 bg-white dark:bg-[#1a2e23] rounded-t-3xl relative z-20">
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">How did it feel?</label>
                        <div className="flex justify-center gap-4">
                            <button className="group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-red-50 group-hover:border-red-100 dark:group-hover:border-red-900/30 transition-colors">
                                    😫
                                </div>
                            </button>
                            <button className="group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-orange-50 group-hover:border-orange-100 dark:group-hover:border-orange-900/30 transition-colors">
                                    😐
                                </div>
                            </button>
                            <button className="group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-blue-50 group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-colors">
                                    🙂
                                </div>
                            </button>
                            <button className="group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none">
                                <div className="w-12 h-12 rounded-2xl bg-pastel-mint dark:bg-primary/20 flex items-center justify-center text-2xl shadow-md border-2 border-primary ring-2 ring-primary/20 transition-colors">
                                    😁
                                </div>
                            </button>
                            <button className="group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-purple-50 group-hover:border-purple-100 dark:group-hover:border-purple-900/30 transition-colors">
                                    🤩
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label htmlFor="reflection" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Reflection</label>
                        <div className="relative">
                            <textarea
                                id="reflection"
                                className="w-full bg-slate-50 dark:bg-[#15281b] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm leading-relaxed"
                                placeholder="What went well? Any obstacles overcome?"
                                rows="4"
                                defaultValue="Felt great today! Beat my personal best time by 2 minutes. The weather was perfect for a run."
                            ></textarea>
                            <div className="absolute bottom-3 right-3 flex gap-1">
                                <button className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-icons-round text-lg">mic</span>
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-icons-round text-lg">image</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
                            <span className="material-icons-round">check</span>
                            Finish
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium py-2 text-sm transition-colors"
                        >
                            Edit details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
