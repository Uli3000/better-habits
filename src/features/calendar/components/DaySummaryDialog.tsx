import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Check, X as XIcon, MessageCircle, Clock, Star } from 'lucide-react';
import type { Goal, DailyCheck } from '@/features/goals/types/goals';
import { cn } from '@/lib/utils';

interface DaySummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  goals: Goal[];
  checks: DailyCheck[];
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export function DaySummaryDialog({ isOpen, onClose, date, goals, checks }: DaySummaryDialogProps) {
  if (!isOpen || !date) return null;

  const formattedDate = format(new Date(date), "EEEE d 'de' MMMM, yyyy", { locale: es });
  
  const getCheckForGoal = (goalId: string): DailyCheck | undefined => {
    return checks.find(c => c.goalId === goalId && c.date === date);
  };

  const completedCount = goals.filter(g => getCheckForGoal(g.id)?.completed).length;
  const completionRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const checksWithSatisfaction = goals.map(g => getCheckForGoal(g.id)).filter(c => c?.satisfaction);
  const avgSatisfaction = checksWithSatisfaction.length > 0
    ? checksWithSatisfaction.reduce((sum, c) => sum + (c?.satisfaction || 0), 0) / checksWithSatisfaction.length
    : 0;

  const totalDuration = goals.map(g => getCheckForGoal(g.id)).filter(c => c?.duration).reduce((sum, c) => sum + (c?.duration || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-foreground mb-1 capitalize">{formattedDate}</h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-sm font-semibold",
            completionRate === 100 ? "bg-success/20 text-success" :
            completionRate >= 50 ? "bg-warning/20 text-warning" :
            "bg-destructive/20 text-destructive"
          )}>
            {completionRate}% completado
          </div>
          <span className="text-sm text-muted-foreground">{completedCount} de {goals.length} metas</span>
        </div>

        {(avgSatisfaction > 0 || totalDuration > 0) && (
          <div className="flex gap-4 mb-4 p-3 rounded-xl bg-secondary/50">
            {avgSatisfaction > 0 && (
              <div className="flex items-center gap-2">
                <Star size={16} className="text-warning" />
                <span className="text-sm text-foreground">{avgSatisfaction.toFixed(1)} promedio</span>
              </div>
            )}
            {totalDuration > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="text-sm text-foreground">{formatDuration(totalDuration)} total</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay metas registradas</p>
          ) : (
            goals.map((goal) => {
              const check = getCheckForGoal(goal.id);
              const isCompleted = check?.completed ?? false;
              const hasNote = !!check?.note;
              const hasMood = !!check?.mood;
              const hasSatisfaction = !!check?.satisfaction;
              const hasDuration = !!check?.duration;
              const hasDetails = hasNote || hasMood || hasSatisfaction || hasDuration;

              return (
                <div key={goal.id} className={cn("p-4 rounded-xl transition-all", isCompleted ? "bg-success/10 border border-success/20" : "bg-secondary")}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{goal.title}</span>
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-success-foreground" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <XIcon size={12} className="text-muted-foreground" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      {hasDetails && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {hasMood && <span className="text-lg" title="Estado de ánimo">{check?.mood}</span>}
                          {hasSatisfaction && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20" title="Satisfacción">
                              <Star size={12} className="text-warning" />
                              <span className="text-xs font-medium text-warning">{check?.satisfaction}</span>
                            </div>
                          )}
                          {hasDuration && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20" title="Duración">
                              <Clock size={12} className="text-primary" />
                              <span className="text-xs font-medium text-primary">{formatDuration(check?.duration || 0)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {hasNote && (
                        <div className="mt-2 flex items-start gap-2">
                          <MessageCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground break-words">{check?.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {goals.length > 0 && !goals.some(g => {
          const check = getCheckForGoal(g.id);
          return check?.note || check?.mood || check?.satisfaction || check?.duration;
        }) && (
          <p className="text-sm text-muted-foreground text-center mt-4 pt-4 border-t border-border/50">
            No hay detalles adicionales para este día
          </p>
        )}
      </div>
    </div>
  );
}
