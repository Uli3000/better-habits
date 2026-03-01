import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Goal, DailyCheck } from '@/features/goals/types/goals';
import { getMonthDays, formatMonthYear, isSameMonthAs, isDayToday } from '@/features/calendar/utils/monthUtils';
import { cn } from '@/lib/utils';

interface MonthlyCalendarProps {
  goals: Goal[];
  checks: DailyCheck[];
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function MonthlyCalendar({ goals, checks, onDayClick }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = getMonthDays(currentMonth);
  
  const getDayProgress = (date: Date): { completed: number; total: number } => {
    const dateString = format(date, 'yyyy-MM-dd');
    const completed = goals.filter(goal => 
      checks.find(c => c.goalId === goal.id && c.date === dateString && c.completed)
    ).length;
    return { completed, total: goals.length };
  };

  const getProgressColor = (completed: number, total: number): string => {
    if (total === 0) return 'bg-secondary';
    const ratio = completed / total;
    if (ratio === 0) return 'bg-secondary';
    if (ratio < 0.5) return 'bg-destructive/40';
    if (ratio < 1) return 'bg-warning/40';
    return 'bg-success/60';
  };

  return (
    <div className="gradient-card rounded-2xl p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-foreground capitalize">{formatMonthYear(currentMonth)}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonthAs(date, currentMonth);
          const isToday = isDayToday(date);
          const { completed, total } = getDayProgress(date);
          const hasActivity = completed > 0;

          return (
            <button
              key={dateString}
              onClick={() => onDayClick(dateString)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative",
                isCurrentMonth ? "hover:ring-2 hover:ring-primary/50" : "opacity-30",
                isToday && "ring-2 ring-primary",
                hasActivity ? getProgressColor(completed, total) : "bg-secondary/50"
              )}
            >
              <span className={cn("text-sm font-medium", isCurrentMonth ? "text-foreground" : "text-muted-foreground")}>
                {format(date, 'd')}
              </span>
              {hasActivity && isCurrentMonth && (
                <span className="text-[10px] text-foreground/80">{completed}/{total}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-success/60" />
          <span className="text-xs text-muted-foreground">100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-warning/40" />
          <span className="text-xs text-muted-foreground">50-99%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-destructive/40" />
          <span className="text-xs text-muted-foreground">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
