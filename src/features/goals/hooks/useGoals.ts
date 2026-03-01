import { useState, useEffect, useCallback } from 'react';
import type { Goal, DailyCheck, Mood } from '@/features/goals/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) { setGoals([]); setChecks([]); setLoading(false); return; }
    
    const [goalsRes, checksRes] = await Promise.all([
      supabase.from('goals').select('*').order('created_at', { ascending: true }),
      supabase.from('daily_checks').select('*'),
    ]);

    if (goalsRes.data) {
      setGoals(goalsRes.data.map(g => ({
        id: g.id,
        title: g.title,
        emoji: g.emoji,
        weeklyTarget: g.weekly_target,
        createdAt: new Date(g.created_at),
      })));
    }

    if (checksRes.data) {
      setChecks(checksRes.data.map(c => ({
        id: c.id,
        goalId: c.goal_id,
        date: c.date,
        completed: c.completed,
        note: c.note ?? undefined,
        mood: (c.mood as Mood) ?? undefined,
        satisfaction: c.satisfaction ?? undefined,
        duration: c.duration ?? undefined,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = async (title: string, emoji: string, weeklyTarget: number) => {
    if (!user) return;
    const { data } = await supabase.from('goals').insert({
      user_id: user.id, title, emoji, weekly_target: weeklyTarget,
    }).select().single();
    if (data) {
      setGoals(prev => [...prev, { id: data.id, title: data.title, emoji: data.emoji, weeklyTarget: data.weekly_target, createdAt: new Date(data.created_at) }]);
    }
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
    setChecks(prev => prev.filter(c => c.goalId !== id));
  };

  const updateGoal = async (id: string, title: string, emoji: string, weeklyTarget: number) => {
    await supabase.from('goals').update({ title, emoji, weekly_target: weeklyTarget }).eq('id', id);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, title, emoji, weeklyTarget } : g));
  };

  const toggleCheck = async (goalId: string, date: string) => {
    if (!user) return;
    const existing = checks.find(c => c.goalId === goalId && c.date === date);

    if (existing) {
      if (existing.completed) {
        await supabase.from('daily_checks').delete().eq('id', existing.id);
        setChecks(prev => prev.filter(c => c.id !== existing.id));
      } else {
        await supabase.from('daily_checks').update({ completed: true }).eq('id', existing.id);
        setChecks(prev => prev.map(c => c.id === existing.id ? { ...c, completed: true } : c));
      }
    } else {
      const { data } = await supabase.from('daily_checks').insert({
        user_id: user.id, goal_id: goalId, date, completed: true,
      }).select().single();
      if (data) {
        setChecks(prev => [...prev, { id: data.id, goalId: data.goal_id, date: data.date, completed: data.completed }]);
      }
    }
  };

  const addNote = async (goalId: string, date: string, note: string) => {
    if (!user) return;
    const existing = checks.find(c => c.goalId === goalId && c.date === date);

    if (existing) {
      await supabase.from('daily_checks').update({ note }).eq('id', existing.id);
      setChecks(prev => prev.map(c => c.id === existing.id ? { ...c, note } : c));
    } else {
      const { data } = await supabase.from('daily_checks').insert({
        user_id: user.id, goal_id: goalId, date, completed: false, note,
      }).select().single();
      if (data) {
        setChecks(prev => [...prev, { id: data.id, goalId: data.goal_id, date: data.date, completed: false, note }]);
      }
    }
  };

  const updateCheckDetails = async (
    goalId: string,
    date: string,
    details: { note: string; mood?: Mood; satisfaction?: number; duration?: number }
  ) => {
    if (!user) return;
    const existing = checks.find(c => c.goalId === goalId && c.date === date);

    const payload = {
      note: details.note || null,
      mood: details.mood || null,
      satisfaction: details.satisfaction ?? null,
      duration: details.duration ?? null,
    };

    if (existing) {
      await supabase.from('daily_checks').update(payload).eq('id', existing.id);
      setChecks(prev => prev.map(c =>
        c.id === existing.id ? { ...c, ...details } : c
      ));
    } else {
      const { data } = await supabase.from('daily_checks').insert({
        user_id: user.id, goal_id: goalId, date, completed: false, ...payload,
      }).select().single();
      if (data) {
        setChecks(prev => [...prev, {
          id: data.id, goalId: data.goal_id, date: data.date, completed: false, ...details,
        }]);
      }
    }
  };

  const getCheckForDay = (goalId: string, date: string): DailyCheck | undefined => {
    return checks.find(c => c.goalId === goalId && c.date === date);
  };

  const getWeeklyProgress = (goalId: string, weekDays: string[]): number => {
    return weekDays.filter(day =>
      checks.find(c => c.goalId === goalId && c.date === day && c.completed)
    ).length;
  };

  return {
    goals, checks, loading, addGoal, updateGoal, deleteGoal,
    toggleCheck, addNote, updateCheckDetails, getCheckForDay, getWeeklyProgress,
  };
}
