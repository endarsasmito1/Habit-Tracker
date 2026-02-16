import { usePomodoro } from '../context/PomodoroContext';

export default function FloatingTimer() {
    const { isRunning, isPaused, remainingSeconds, habitName, formatTime, pauseTimer, resumeTimer, resetTimer } = usePomodoro();

    // Only show when timer is active (running or paused)
    if (!isRunning && !isPaused) return null;

    return (
        <div className="fixed bottom-8 right-8 z-40 animate-fade-in">
            <div className="bg-white dark:bg-[#1a2e23] border border-primary/30 shadow-xl rounded-2xl p-3 flex items-center gap-4 group hover:shadow-2xl transition-shadow">
                {/* Timer Icon */}
                <div className="w-10 h-10 bg-pastel-mint dark:bg-green-900/30 rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-icons-round">timer</span>
                </div>

                {/* Timer Info */}
                <div className="pr-1">
                    {habitName && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate max-w-[120px]">
                            {habitName}
                        </p>
                    )}
                    <p className="text-xl font-mono font-bold text-slate-800 dark:text-white leading-none tabular-nums">
                        {formatTime(remainingSeconds)}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    {isRunning ? (
                        <button
                            onClick={pauseTimer}
                            className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full text-amber-500 transition-colors"
                            title="Pause"
                        >
                            <span className="material-icons-round text-sm">pause</span>
                        </button>
                    ) : (
                        <button
                            onClick={resumeTimer}
                            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full text-primary transition-colors"
                            title="Resume"
                        >
                            <span className="material-icons-round text-sm">play_arrow</span>
                        </button>
                    )}
                    <button
                        onClick={resetTimer}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                        title="Cancel"
                    >
                        <span className="material-icons-round text-sm">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
