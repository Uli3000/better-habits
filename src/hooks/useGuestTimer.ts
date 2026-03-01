import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerSession } from '@/features/timer/types/timer';
import { v4Style } from '@/lib/guestUtils';

const KEY = 'guest_timer_sessions';

function loadJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

export function useGuestTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<TimerSession[]>(() => loadJSON<TimerSession[]>(KEY, []));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(sessions)); }, [sessions]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - seconds * 1000;
      intervalRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setIsRunning(false); setSeconds(0); }, []);

  const saveSession = useCallback(async (label: string, goalId?: string) => {
    if (seconds < 1) return;
    const session: TimerSession = {
      id: v4Style(), goalId, label, duration: seconds,
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev]);
    setIsRunning(false);
    setSeconds(0);
  }, [seconds]);

  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  return { seconds, isRunning, sessions, start, pause, reset, saveSession, deleteSession };
}
