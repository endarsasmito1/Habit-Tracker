import { useState } from 'react';
import clsx from 'clsx';
import EditHabitModal from '../components/modals/EditHabitModal';
import DeleteHabitModal from '../components/modals/DeleteHabitModal';
import CheckInModal from '../components/modals/CheckInModal';

export default function Calendar() {
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(25);
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 8 }, (_, i) => 2020 + i);

    // Mock data for days grid
    const daysInMonth = 31;
    const startDayOffset = 0; // Sunday
    const calendarSafeDays = Array.from({ length: 42 }, (_, i) => {
        const day = i - startDayOffset + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    return (
        <div className="h-full flex flex-col md:flex-row bg-background-light dark:bg-background-dark overflow-hidden">

            {/* Modals */}
            <EditHabitModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
            <DeleteHabitModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
            <CheckInModal
                isOpen={isCheckInModalOpen}
                onClose={() => setIsCheckInModalOpen(false)}
            />

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="px-8 py-5 flex justify-between items-center bg-white dark:bg-[#15281b] border-b border-slate-100 dark:border-slate-800 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button
                                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                                className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white hover:text-primary dark:hover:text-primary transition-colors rounded-lg py-1 px-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <span>October 2023</span>
                                <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">expand_more</span>
                            </button>

                            {/* Dropdown would go here - simplified for brevity */}
                            {isMonthPickerOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1a2e23] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-50 animate-fade-in-up">
                                    <div className="grid grid-cols-2 gap-2 h-64">
                                        <div className="flex flex-col h-full border-r border-slate-100 dark:border-slate-700 pr-2">
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest pl-2">Month</div>
                                            <div className="year-scroll overflow-y-auto pr-1 space-y-1">
                                                {months.map(m => (
                                                    <button key={m} className={clsx("w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors", m === 'October' ? "bg-pastel-mint text-primary-dark font-bold shadow-sm ring-1 ring-primary/20" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50")}>{m}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col h-full pl-2">
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest pl-2">Year</div>
                                            <div className="year-scroll overflow-y-auto pr-1 space-y-1">
                                                {years.map(y => (
                                                    <button key={y} className={clsx("w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors", y === 2023 ? "bg-pastel-mint text-primary-dark font-bold shadow-sm ring-1 ring-primary/20" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50")}>{y}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex bg-pastel-mint dark:bg-primary/10 rounded-lg p-1">
                            <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm text-primary-dark dark:text-primary transition-colors">
                                <span className="material-icons-round text-lg">chevron_left</span>
                            </button>
                            <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm text-primary-dark dark:text-primary transition-colors">
                                <span className="material-icons-round text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Wednesday, Oct {selectedDay}, 2023</p>
                    </div>
                </header>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-background-dark p-4 lg:p-8">
                    <div className="bg-white dark:bg-[#1a2e23] rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 h-full flex flex-col overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="p-4 text-center text-sm font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-slate-100 dark:divide-slate-800/50 overflow-y-auto">
                            {calendarSafeDays.map((d, i) => {
                                if (!d) return <div key={i} className="bg-slate-50/50 dark:bg-slate-800/20"></div>;
                                const isSelected = d === selectedDay;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDay(d)}
                                        className={clsx(
                                            "p-2 min-h-[100px] relative group transition-colors cursor-pointer",
                                            isSelected ? "bg-primary/5 dark:bg-primary/10 ring-2 ring-inset ring-primary z-10" : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                                        )}
                                    >
                                        <span className={clsx("text-sm font-medium p-1 block", isSelected ? "text-primary font-bold" : "text-slate-400")}>{d}</span>

                                        {d === 2 && (
                                            <div className="mt-1 space-y-1">
                                                <div className="bg-pastel-mint px-2 py-1 rounded-md text-xs font-semibold text-green-800 dark:text-green-900 truncate">Morning Jog</div>
                                            </div>
                                        )}
                                        {d === 3 && (
                                            <div className="mt-1 space-y-1">
                                                <div className="bg-pastel-lavender px-2 py-1 rounded-md text-xs font-semibold text-purple-800 dark:text-purple-900 truncate">Reading</div>
                                                <div className="bg-pastel-peach px-2 py-1 rounded-md text-xs font-semibold text-orange-800 dark:text-orange-900 truncate">Meditation</div>
                                            </div>
                                        )}
                                        {d === 5 && (
                                            <div className="mt-1 space-y-1">
                                                <div className="bg-pastel-mint px-2 py-1 rounded-md text-xs font-semibold text-green-800 dark:text-green-900 truncate">Coding</div>
                                            </div>
                                        )}
                                        {d === 25 && (
                                            <div className="mt-1 space-y-1">
                                                <div className="bg-pastel-mint shadow-sm px-2 py-1 rounded-md text-xs font-semibold text-green-800 dark:text-green-900 truncate border border-green-200">Morning Jog</div>
                                                <div className="bg-pastel-lavender shadow-sm px-2 py-1 rounded-md text-xs font-semibold text-purple-800 dark:text-purple-900 truncate border border-purple-200">Reading</div>
                                                <div className="bg-pastel-peach shadow-sm px-2 py-1 rounded-md text-xs font-semibold text-orange-800 dark:text-orange-900 truncate border border-orange-200">Journal</div>
                                            </div>
                                        )}

                                        <button className="absolute top-2 right-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-full p-1">
                                            <span className="material-icons-round text-sm">add</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Daily Details */}
            <aside className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#15281b] border-l border-slate-100 dark:border-slate-800 p-6 overflow-y-auto flex flex-col shadow-xl z-20 shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Oct {selectedDay}, 2023</h2>
                        <p className="text-sm text-slate-400 font-medium">Wednesday</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="mb-8 bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Daily Completion</span>
                        <span className="text-xl font-bold text-primary">66%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-2/3 shadow-[0_0_10px_rgba(48,232,110,0.5)]"></div>
                    </div>
                </div>

                {/* Habits List */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Habits & Tasks</h3>

                    {/* Habit Items */}
                    <div className="group bg-white dark:bg-[#1a2e23] border border-primary/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCheckInModalOpen(true)}>
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                    <span className="material-icons-round text-sm">check</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 line-through decoration-slate-400 decoration-2 text-opacity-60">Morning Jog</h4>
                                    <span className="text-xs text-slate-400">07:00 AM • Health</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => setIsEditModalOpen(true)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200"><span className="material-icons-round text-lg">edit</span></button>
                                <button onClick={() => setIsDeleteModalOpen(true)} className="text-slate-300 hover:text-red-400"><span className="material-icons-round text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white dark:bg-[#1a2e23] border border-primary/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCheckInModalOpen(true)}>
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                    <span className="material-icons-round text-sm">check</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 line-through decoration-slate-400 decoration-2 text-opacity-60">Reading</h4>
                                    <span className="text-xs text-slate-400">08:30 AM • 20 mins</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => setIsEditModalOpen(true)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200"><span className="material-icons-round text-lg">edit</span></button>
                                <button onClick={() => setIsDeleteModalOpen(true)} className="text-slate-300 hover:text-red-400"><span className="material-icons-round text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white dark:bg-[#1a2e23] border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/50">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCheckInModalOpen(true)}>
                                <button className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/10 transition-colors"></button>
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Journal</h4>
                                    <span className="text-xs text-slate-400">09:00 PM • Mindfulness</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => setIsEditModalOpen(true)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200"><span className="material-icons-round text-lg">edit</span></button>
                                <button onClick={() => setIsDeleteModalOpen(true)} className="text-slate-300 hover:text-red-400"><span className="material-icons-round text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-semibold">
                        <span className="material-icons-round">add</span>
                        Add Habit for Today
                    </button>
                </div>

                {/* Coach Tip */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-pastel-lavender/50 dark:bg-purple-900/10 p-4 rounded-xl flex gap-3 items-start">
                        <span className="material-icons-round text-purple-500 mt-0.5">auto_awesome</span>
                        <div>
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1">Coach Tip</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">You've missed "Journal" twice this week. Try moving it to the morning?</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
