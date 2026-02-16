import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

const PomodoroContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePomodoro() {
    const ctx = useContext(PomodoroContext);
    if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider');
    return ctx;
}

export function PomodoroProvider({ children }) {
    const [sessionId, setSessionId] = useState(null);
    const [habitId, setHabitId] = useState(null);
    const [habitName, setHabitName] = useState('');
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    // Create audio element for notification
    useEffect(() => {
        // Use Web Audio API to generate a pleasant chime
        audioRef.current = {
            play: () => {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const playNote = (freq, startTime, duration) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sine';
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.3, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                        osc.start(startTime);
                        osc.stop(startTime + duration);
                    };
                    // Pleasant chime sequence
                    playNote(523.25, ctx.currentTime, 0.3);        // C5
                    playNote(659.25, ctx.currentTime + 0.15, 0.3); // E5
                    playNote(783.99, ctx.currentTime + 0.3, 0.5);  // G5
                    playNote(1046.50, ctx.currentTime + 0.5, 0.8); // C6
                } catch {
                    console.warn('Audio notification failed');
                }
            }
        };
    }, []);

    // Fetch active session on mount
    useEffect(() => {
        const fetchActive = async () => {
            try {
                const session = await api.get('/pomodoro/active');
                if (session) {
                    setSessionId(session.id);
                    setHabitId(session.habitId);
                    setTotalSeconds(session.durationMins * 60);
                    setRemainingSeconds(session.remainingSeconds);
                    if (session.status === 'running') {
                        setIsRunning(true);
                        setIsPaused(false);
                    } else if (session.status === 'paused') {
                        setIsRunning(false);
                        setIsPaused(true);
                    }
                }
            } catch {
                // No active session, that's fine
            }
        };
        fetchActive();
    }, []);

    // Countdown interval
    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        // Timer complete!
                        setIsRunning(false);
                        setIsComplete(true);
                        // Play sound
                        audioRef.current?.play();
                        // Send browser notification
                        if (Notification.permission === 'granted') {
                            new Notification('🍅 Pomodoro Complete!', {
                                body: habitName ? `"${habitName}" session finished!` : 'Your focus session is done!',
                                icon: '/favicon.ico'
                            });
                        }
                        // Mark complete on server
                        if (sessionId) {
                            api.patch(`/pomodoro/${sessionId}/complete`).catch(() => { });
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, isPaused, sessionId, habitName]);

    const startTimer = useCallback(async (totalSeconds, hId = null, hName = '') => {
        try {
            const session = await api.post('/pomodoro/start', {
                habitId: hId,
                totalSeconds,
            });
            setSessionId(session.id);
            setHabitId(hId);
            setHabitName(hName);
            setTotalSeconds(totalSeconds);
            setRemainingSeconds(totalSeconds);
            setIsRunning(true);
            setIsPaused(false);
            setIsComplete(false);
            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (e) {
            console.error('Failed to start pomodoro:', e);
        }
    }, []);

    const pauseTimer = useCallback(async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsPaused(true);
        if (sessionId) {
            await api.patch(`/pomodoro/${sessionId}/pause`, { remainingSeconds }).catch(() => { });
        }
    }, [sessionId, remainingSeconds]);

    const resumeTimer = useCallback(async () => {
        setIsRunning(true);
        setIsPaused(false);
        if (sessionId) {
            await api.patch(`/pomodoro/${sessionId}/resume`).catch(() => { });
        }
    }, [sessionId]);

    const resetTimer = useCallback(async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (sessionId) {
            await api.patch(`/pomodoro/${sessionId}/cancel`).catch(() => { });
        }
        setSessionId(null);
        setHabitId(null);
        setHabitName('');
        setTotalSeconds(25 * 60);
        setRemainingSeconds(25 * 60);
        setIsRunning(false);
        setIsPaused(false);
        setIsComplete(false);
    }, [sessionId]);

    const formatTime = useCallback((secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, []);

    const value = {
        sessionId, habitId, habitName, totalSeconds, remainingSeconds,
        isRunning, isPaused, isComplete,
        startTimer, pauseTimer, resumeTimer, resetTimer, formatTime,
        setHabitName, setHabitId,
    };

    return (
        <PomodoroContext.Provider value={value}>
            {children}
        </PomodoroContext.Provider>
    );
}
