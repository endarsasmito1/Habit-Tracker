export default function Insights() {
    const days = Array.from({ length: 14 }, (_, i) => i + 1);

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Weekly Insights</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review your AI-generated growth analysis.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                            <span className="material-icons-round text-sm">arrow_back_ios</span>
                        </button>
                        <div className="flex items-center gap-2 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <span className="material-icons-round text-primary text-base">calendar_month</span>
                            Oct 22 - Oct 29, 2023
                        </div>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                            <span className="material-icons-round text-sm">arrow_forward_ios</span>
                        </button>
                    </div>
                </header>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Primary AI Insight Card (Hero) */}
                    <div className="col-span-1 md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                        {/* Decorative background elements */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-icons-round text-sm">auto_awesome</span> AI Reflection
                                </div>
                                <span className="text-slate-400 text-sm">Generated just now</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                                You're crushing your mornings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Alex!</span>
                            </h2>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Your consistency score is up <span className="text-primary font-bold bg-primary/10 px-1 rounded">+15%</span> this week. I've analyzed your check-in patterns and noticed you are <strong className="text-slate-900 dark:text-white decoration-primary decoration-2 underline-offset-2 underline">most productive in the morning</strong>, specifically between 8 AM and 10 AM.
                                </p>
                                <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
                                    Suggestion: Let's try stacking your new <em>Reading</em> habit right after your morning coffee next week to leverage this peak flow state.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-95 flex items-center gap-2">
                                    Accept Suggestion
                                    <span className="material-icons-round text-sm">check</span>
                                </button>
                                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors">
                                    View Analysis
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card 1: Consistency Score */}
                    <div className="col-span-1 md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Consistency Score</p>
                                <h3 className="text-5xl font-bold mt-2 font-display">92<span className="text-2xl text-primary">%</span></h3>
                            </div>
                            <div className="bg-slate-700/50 p-2 rounded-lg">
                                <span className="material-icons-round text-primary">trending_up</span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {/* Simple Chart Representation */}
                            <div className="flex items-end gap-1 h-16 mt-4">
                                <div className="w-1/6 bg-slate-600 rounded-t-sm h-3/6"></div>
                                <div className="w-1/6 bg-slate-600 rounded-t-sm h-4/6"></div>
                                <div className="w-1/6 bg-slate-600 rounded-t-sm h-2/6"></div>
                                <div className="w-1/6 bg-slate-500 rounded-t-sm h-5/6"></div>
                                <div className="w-1/6 bg-primary/50 rounded-t-sm h-4/6"></div>
                                <div className="w-1/6 bg-primary rounded-t-sm h-full shadow-[0_0_15px_rgba(48,232,110,0.5)]"></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">Top 5% of users this week</p>
                        </div>
                    </div>

                    {/* Stats Card 2: Current Streak */}
                    <div className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 flex-shrink-0">
                            <span className="material-icons-round text-3xl">local_fire_department</span>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Current Streak</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">12 Days</p>
                        </div>
                    </div>

                    {/* Stats Card 3: Habits Stacked */}
                    <div className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 flex-shrink-0">
                            <span className="material-icons-round text-3xl">layers</span>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Habits Stacked</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">4 Active</p>
                        </div>
                    </div>

                    {/* Stats Card 4: Focus Time */}
                    <div className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 flex-shrink-0">
                            <span className="material-icons-round text-3xl">hourglass_top</span>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Focus Time</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">14h 20m</p>
                        </div>
                    </div>

                    {/* Calendar / History Section */}
                    <div className="col-span-1 md:col-span-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm mt-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons-round text-slate-400">history</span> Persistent History
                            </h3>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Complete</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-orange-300"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Partial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Skipped</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="w-full overflow-x-auto pb-4">
                            <div className="min-w-[800px]">
                                {/* Days Header */}
                                <div className="grid grid-cols-7 mb-4">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <div key={d} className={`text-center text-sm font-medium uppercase tracking-wider ${['Sat', 'Sun'].includes(d) ? 'text-primary' : 'text-slate-400'}`}>{d}</div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-4">
                                    {/* Previous Month Days (Faded) */}
                                    {[28, 29, 30].map(d => (
                                        <div key={d} className="aspect-square p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between opacity-40">
                                            <span className="text-slate-400 font-semibold">{d}</span>
                                        </div>
                                    ))}

                                    {/* Current Month */}
                                    {days.map(d => {
                                        const isDay6 = d === 6;
                                        return (
                                            <div
                                                key={d}
                                                className={`aspect-square p-3 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative group ${isDay6
                                                        ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/20 z-20'
                                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-transparent'
                                                    }`}
                                            >
                                                <span className={`font-semibold ${isDay6 ? 'text-primary-dark dark:text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{d}</span>
                                                <div className="w-full flex justify-center gap-1">
                                                    {isDay6 && (
                                                        <>
                                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                        </>
                                                    )}
                                                    {!isDay6 && d % 2 === 0 && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                                    {!isDay6 && d % 3 === 0 && <div className="w-2 h-2 rounded-full bg-orange-300"></div>}
                                                </div>

                                                {/* Popover Example for Day 6 */}
                                                {isDay6 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-primary uppercase">Oct {d}th</span>
                                                            <span className="text-xs text-slate-400">08:30 AM</span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">Early Gym Session</p>
                                                        <p className="text-xs text-slate-500 italic">"Felt tired but pushed through the run. Great energy afterwards."</p>
                                                        <div className="w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
