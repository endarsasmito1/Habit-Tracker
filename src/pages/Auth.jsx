import { useState } from 'react';
import { signIn, signUp } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signIn.email({
                    email,
                    password,
                }, {
                    onSuccess: () => {
                        navigate('/dashboard');
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message);
                        setLoading(false);
                    }
                });
            } else {
                await signUp.email({
                    email,
                    password,
                    name,
                }, {
                    onSuccess: () => {
                        navigate('/dashboard');
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message);
                        setLoading(false);
                    }
                });
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1a2e23] rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-glow">
                            <span className="material-icons-round text-2xl">bolt</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
                        {isLogin ? 'Enter your details to access your habits.' : 'Start your journey to better habits.'}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800/30">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5 ml-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Your Name"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="hello@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all hover:translate-y-px mt-4 flex justify-center items-center gap-2"
                        >
                            {loading && <span className="material-icons-round animate-spin text-sm">refresh</span>}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 font-bold text-primary hover:text-primary-dark transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
