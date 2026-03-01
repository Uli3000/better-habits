import { useState } from 'react';
import type { Goal, DailyCheck, Mood } from '@/features/goals/types/goals';
import { DayButton } from './DayButton';
import { CheckDetailsDialog } from './CheckDetailsDialog';
import { Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  weekDays: string[];
  getCheckForDay: (goalId: string, date: string) => DailyCheck | undefined;
  onToggleCheck: (goalId: string, date: string) => void;
  onUpdateDetails: (goalId: string, date: string, details: { note: string; mood?: Mood; satisfaction?: number; duration?: number }) => void;
  weeklyProgress: number;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}

export function GoalCard({
  goal, weekDays, getCheckForDay, onToggleCheck, onUpdateDetails,
  weeklyProgress, onDelete, onEdit,
}: GoalCardProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const progressPercent = Math.min((weeklyProgress / goal.weeklyTarget) * 100, 100);
  const isComplete = weeklyProgress >= goal.weeklyTarget;
  const selectedCheck = selectedDay ? getCheckForDay(goal.id, selectedDay) : undefined;

  return (
    <>
      <div className={cn(
        "gradient-card rounded-2xl p-5 shadow-card animate-slide-up",
        "border border-border/50 transition-all duration-300",
        isComplete && "border-success/30 shadow-glow"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{goal.emoji}</span>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">
                {weeklyProgress}/{goal.weeklyTarget} esta semana
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(goal)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
              <Pencil size={18} />
            </button>
            <button onClick={() => onDelete(goal.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", isComplete ? "gradient-success" : "gradient-primary")}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between gap-1">
          {weekDays.map((day) => {
            const check = getCheckForDay(goal.id, day);
            const hasDetails = !!(check?.note || check?.mood || check?.satisfaction || check?.duration);
            return (
              <DayButton
                key={day}
                date={day}
                isCompleted={check?.completed ?? false}
                hasNote={hasDetails}
                onToggle={() => onToggleCheck(goal.id, day)}
                onLongPress={() => setSelectedDay(day)}
              />
            );
          })}
        </div>
      </div>

      <CheckDetailsDialog
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        goalTitle={goal.title}
        goalEmoji={goal.emoji}
        date={selectedDay || ''}
        currentNote={selectedCheck?.note}
        currentMood={selectedCheck?.mood}
        currentSatisfaction={selectedCheck?.satisfaction}
        currentDuration={selectedCheck?.duration}
        onSave={(details) => {
          if (selectedDay) {
            onUpdateDetails(goal.id, selectedDay, details);
          }
          setSelectedDay(null);
        }}
      />
    </>
  );
}
