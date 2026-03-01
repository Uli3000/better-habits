import type { Goal, DailyCheck } from '@/features/goals/types/goals';
import { TrendingUp, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  goals: Goal[];
  checks: DailyCheck[];
  weekDays: string[];
}

export function StatsCard({ goals, checks, weekDays }: StatsCardProps) {
  const totalPossible = goals.reduce((sum, g) => sum + g.weeklyTarget, 0);
  const totalCompleted = goals.reduce((sum, goal) => {
    return sum + weekDays.filter(day => 
      checks.find(c => c.goalId === goal.id && c.date === day && c.completed)
    ).length;
  }, 0);

  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  
  const goalsAchieved = goals.filter(goal => {
    const progress = weekDays.filter(day => 
      checks.find(c => c.goalId === goal.id && c.date === day && c.completed)
    ).length;
    return progress >= goal.weeklyTarget;
  }).length;

  const todayIndex = weekDays.findIndex(day => {
    const d = new Date(day);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  
  let streak = 0;
  for (let i = todayIndex; i >= 0; i--) {
    const dayHasAllCompleted = goals.every(goal => 
      checks.find(c => c.goalId === goal.id && c.date === weekDays[i] && c.completed)
    );
    if (dayHasAllCompleted && goals.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <div className="gradient-card rounded-2xl p-5 shadow-card mb-6 animate-slide-up">
      <h3 className="text-lg font-bold text-foreground mb-4">Resumen Semanal</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className={cn(
            "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2",
            completionRate >= 80 ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
          )}>
            <TrendingUp size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">Cumplimiento</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-2">
            <Target size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">{goalsAchieved}/{goals.length}</p>
          <p className="text-xs text-muted-foreground">Metas logradas</p>
        </div>
        <div className="text-center">
          <div className={cn(
            "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2",
            streak > 0 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"
          )}>
            <Flame size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">Días racha</p>
        </div>
      </div>
    </div>
  );
}
