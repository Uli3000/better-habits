import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerSession } from '../types/timer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useTimer() {
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const fetchSessions = useCallback(async () => {
    if (!user) { setSessions([]); return; }
    const { data } = await supabase.from('timer_sessions').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) {
      setSessions(data.map(s => ({
        id: s.id,
        goalId: s.goal_id ?? undefined,
        label: s.label,
        duration: s.duration,
        startedAt: s.started_at,
        completedAt: s.completed_at ?? undefined,
      })));
    }
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

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
    if (seconds < 1 || !user) return;
    const session: TimerSession = {
      id: '',
      goalId,
      label,
      duration: seconds,
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
    };

    const { data } = await supabase.from('timer_sessions').insert({
      user_id: user.id,
      goal_id: goalId || null,
      label,
      duration: seconds,
      started_at: session.startedAt,
      completed_at: session.completedAt,
    }).select().single();

    if (data) {
      setSessions(prev => [{
        id: data.id, goalId: data.goal_id ?? undefined, label: data.label,
        duration: data.duration, startedAt: data.started_at, completedAt: data.completed_at ?? undefined,
      }, ...prev]);
    }

    setIsRunning(false);
    setSeconds(0);
  }, [seconds, user]);

  const deleteSession = useCallback(async (id: string) => {
    await supabase.from('timer_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  return { seconds, isRunning, sessions, start, pause, reset, saveSession, deleteSession };
}
