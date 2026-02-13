import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import CreateHabitModal from './modals/CreateHabitModal';

export default function Layout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { name: 'Calendar', path: '/calendar', icon: 'calendar_today' },
        { name: 'Analytics', path: '/analytics', icon: 'bar_chart' },
        { name: 'AI Insights', path: '/insights', icon: 'psychology' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen font-display overflow-hidden selection:bg-primary selection:text-white">

            <CreateHabitModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Sidebar Navigation */}
            <aside className="w-20 lg:w-64 h-screen bg-white dark:bg-[#15281b] border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-20 shrink-0 hidden md:flex">
                {/* Logo & Top Menu */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-glow">
                            <span className="material-icons-round text-xl">bolt</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden lg:block text-slate-800 dark:text-white">The Action</span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group",
                                    isActive(item.path)
                                        ? "bg-primary/10 text-primary dark:text-primary font-semibold"
                                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <span className={clsx("material-icons-round transition-colors", !isActive(item.path) && "group-hover:text-primary")}>
                                    {item.icon}
                                </span>
                                <span className="hidden lg:block">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User Profile & Settings */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="mb-6">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full flex items-center justify-center lg:justify-start gap-2 bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-icons-round">add</span>
                            <span className="hidden lg:block font-medium">New Habit</span>
                        </button>
                    </div>

                    <Link to="/profile" className="flex items-center gap-3 group">
                        <img
                            alt="User avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpWjNlvbfpraMUacBYsEPEBoLh7YTXxgXdYP8g5Vf3ba5i0ZK13HOeB2R0jPu7ZW_nYcCMiWD9Gvdnh9jdzMVmITarhxT50RKjn_9Dp8c9hGK1YZ4vw3JCYPCoj1uSMqB99zlau6yNj1GEyweG1jSd356qwDcgfBZZCYHm1i5wUzehP1Dj2O5kYAXjtoTLEVlYqf1PuXH0Zq31et4fgEohpeYQCJTIrMB4wqGLrt1Tr4e0vL5n-QpbSetk026WGQZdVsHY4iiE"
                        />
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-800 dark:text-white">Sarah Jenkins</p>
                            <p className="text-xs text-slate-400 truncate">Pro Member</p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-hidden relative flex flex-col bg-background-light dark:bg-background-dark">
                {/* Mobile Header (Visible on small screens) */}
                <header className="md:hidden sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-glow">
                            <span className="material-icons-round text-xl">bolt</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">The Action</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">
                        <span className="material-icons-round">menu</span>
                    </button>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation (optional, or Sidebar overlay) */}
            {/* For simplicity we use the sidebar hidden on mobile but here we might need a bottom nav or drawer. 
           The user request for UI 1 has a sidebar. I added a basic mobile header above. */}
        </div>
    );
}
