import { useEffect, useRef } from 'react';

export default function Profile() {
    const heatmapRef = useRef(null);

    useEffect(() => {
        if (heatmapRef.current) {
            heatmapRef.current.innerHTML = '';
            for (let i = 0; i < 364; i++) {
                let opacity = Math.random();
                let colorClass = 'bg-slate-100 dark:bg-slate-800'; // Default empty

                // Creating a fake "habit pattern"
                if (opacity > 0.85) colorClass = 'bg-primary';
                else if (opacity > 0.6) colorClass = 'bg-primary/70';
                else if (opacity > 0.4) colorClass = 'bg-primary/40';
                else if (opacity > 0.2) colorClass = 'bg-primary/20';

                const div = document.createElement('div');
                div.className = `heatmap-cell ${colorClass}`;
                heatmapRef.current.appendChild(div);
            }
        }
    }, []);

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 flex flex-col pb-10">
            {/* Navbar / Top Bar (Minimalist) */}
            <nav className="w-full px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background-dark font-bold text-lg">H</div>
                    <span className="font-bold text-xl tracking-tight dark:text-white">HabitSync</span>
                </div>
                <div className="flex gap-4 items-center">
                    <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Log In</a>
                    <a href="#" className="text-sm font-medium bg-primary/20 text-primary-darker px-4 py-2 rounded-full hover:bg-primary/30 transition-colors dark:text-primary">Join Now</a>
                </div>
            </nav>

            <div className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
                {/* Profile Header Section */}
                <header className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Decorative Pastel Background Gradient */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-blue-50/50 dark:from-primary/20 dark:to-slate-800/50"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-md object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFPjzENhUYZyr7pnCLJqMeCumC7KOOWQwb2AMe1WGb1sREjDP_e38JtldcTCHJD9Woc__9tAeVe_6Q8xhs-fMM3VL9oHX8vzyYgbewVy7qAjjEN9Xt8s9QFJH5K1nR9_aQrLuGhD6khHpHeH0KVMX0RCW4lEIyktWskm_kyexaMrN-LTqWznM29v9cbT25V9xnN6qdea6CwntY6s2Hb37Cyg04FK-LyorSQMhokBgKS44Z0sNUNbHFnQahVV3anbY3x-zD5Kbr"
                            />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Verified Account">
                                <span className="material-icons-round text-background-dark text-[14px]">check</span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-grow text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Elena Rostova</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Building better habits, one day at a time.</p>
                        </div>

                        {/* Streak Badge */}
                        <div className="flex-shrink-0 mb-4 md:mb-2">
                            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                                <span className="text-2xl">🔥</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</span>
                                    <span className="text-xl font-bold text-slate-900 dark:text-primary">30 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Chips */}
                    <div className="relative mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Learning
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span> Health
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span> Creativity
                        </span>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Heatmap & Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Consistency Heatmap */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons-round text-primary">calendar_view_month</span>
                                    Consistency Map
                                </h2>
                                <div className="text-xs text-slate-400 font-medium">Last 365 Days</div>
                            </div>

                            {/* Heatmap Visual */}
                            <div className="w-full overflow-x-auto pb-2">
                                <div className="min-w-[600px]">
                                    {/* Month Labels */}
                                    <div className="flex justify-between text-xs text-slate-400 mb-2 px-1">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                    </div>
                                    {/* The Grid */}
                                    <div ref={heatmapRef} className="heatmap-grid" id="heatmap">
                                        {/* Populated by useEffect */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
                                <span>Less</span>
                                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                                <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
                                <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                                <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
                                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                                <span>More</span>
                            </div>
                        </section>

                        {/* Streak History Graph */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons-round text-primary">show_chart</span>
                                    Focus Trends
                                </h2>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button className="px-3 py-1 text-xs font-semibold rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">30D</button>
                                    <button className="px-3 py-1 text-xs font-semibold rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">60D</button>
                                    <button className="px-3 py-1 text-xs font-semibold rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">90D</button>
                                </div>
                            </div>

                            <div className="relative h-64 w-full">
                                {/* Y-Axis Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-300 dark:text-slate-700 pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="border-b border-dashed border-slate-100 dark:border-slate-800 h-0 w-full"></div>
                                    ))}
                                </div>

                                {/* Graph SVG */}
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                                    <defs>
                                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#30e86e" stopOpacity="0.3"></stop>
                                            <stop offset="100%" stopColor="#30e86e" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 L0,35 Q10,25 20,30 T40,20 T60,15 T80,10 T100,5 L100,50 Z" fill="url(#gradient)"></path>
                                    <path className="chart-path" d="M0,35 Q10,25 20,30 T40,20 T60,15 T80,10 T100,5" fill="none" stroke="#30e86e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8"></path>
                                </svg>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Stats & Breakdown */}
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Focus Areas</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Health & Fitness', pct: 45, color: 'bg-primary' },
                                    { label: 'Professional Learning', pct: 30, color: 'bg-blue-400' },
                                    { label: 'Mindfulness', pct: 15, color: 'bg-orange-400' },
                                    { label: 'Other', pct: 10, color: 'bg-slate-400' }
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                            <span className={`font-bold ${item.color.replace('bg-', 'text-')}`}>{item.pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                            <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl text-primary">
                                        <span className="material-icons-round">emoji_events</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Completed</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">1,248 <span className="text-sm font-normal text-slate-400">tasks</span></p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-center text-white relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Inspired by Elena?</h3>
                            <p className="text-slate-300 text-sm mb-6 relative z-10">Start your own journey of consistency today. Track habits, build streaks, and share your progress.</p>
                            <button className="w-full py-3 bg-primary hover:bg-green-400 text-background-dark font-bold rounded-lg transition-colors relative z-10">
                                Create Free Profile
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
