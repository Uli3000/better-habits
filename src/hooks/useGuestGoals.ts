import { useState, useEffect } from 'react';
import type { Goal, DailyCheck, Mood } from '@/features/goals/types/goals';
import { v4Style } from '@/lib/guestUtils';

const GOALS_KEY = 'guest_goals';
const CHECKS_KEY = 'guest_checks';

function loadJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

export function useGuestGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => loadJSON<Goal[]>(GOALS_KEY, []));
  const [checks, setChecks] = useState<DailyCheck[]>(() => loadJSON<DailyCheck[]>(CHECKS_KEY, []));
  const loading = false;

  useEffect(() => { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem(CHECKS_KEY, JSON.stringify(checks)); }, [checks]);

  const addGoal = async (title: string, emoji: string, weeklyTarget: number) => {
    const goal: Goal = { id: v4Style(), title, emoji, weeklyTarget, createdAt: new Date() };
    setGoals(prev => [...prev, goal]);
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setChecks(prev => prev.filter(c => c.goalId !== id));
  };

  const updateGoal = async (id: string, title: string, emoji: string, weeklyTarget: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, title, emoji, weeklyTarget } : g));
  };

  const toggleCheck = async (goalId: string, date: string) => {
    const existing = checks.find(c => c.goalId === goalId && c.date === date);
    if (existing) {
      if (existing.completed) {
        setChecks(prev => prev.filter(c => c.id !== existing.id));
      } else {
        setChecks(prev => prev.map(c => c.id === existing.id ? { ...c, completed: true } : c));
      }
    } else {
      setChecks(prev => [...prev, { id: v4Style(), goalId, date, completed: true }]);
    }
  };

  const addNote = async (goalId: string, date: string, note: string) => {
    const existing = checks.find(c => c.goalId === goalId && c.date === date);
    if (existing) {
      setChecks(prev => prev.map(c => c.id === existing.id ? { ...c, note } : c));
    } else {
      setChecks(prev => [...prev, { id: v4Style(), goalId, date, completed: false, note }]);
    }
  };

  const updateCheckDetails = async (
    goalId: string, date: string,
    details: { note: string; mood?: Mood; satisfaction?: number; duration?: number }
  ) => {
    const existing = checks.find(c => c.goalId === goalId && c.date === date);
    if (existing) {
      setChecks(prev => prev.map(c => c.id === existing.id ? { ...c, ...details } : c));
    } else {
      setChecks(prev => [...prev, { id: v4Style(), goalId, date, completed: false, ...details }]);
    }
  };

  const getCheckForDay = (goalId: string, date: string) => checks.find(c => c.goalId === goalId && c.date === date);

  const getWeeklyProgress = (goalId: string, weekDays: string[]) =>
    weekDays.filter(day => checks.find(c => c.goalId === goalId && c.date === day && c.completed)).length;

  return { goals, checks, loading, addGoal, updateGoal, deleteGoal, toggleCheck, addNote, updateCheckDetails, getCheckForDay, getWeeklyProgress };
}
