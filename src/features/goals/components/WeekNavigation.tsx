import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatWeekRange } from '@/features/goals/utils/dateUtils';
import { cn } from '@/lib/utils';

interface WeekNavigationProps {
  startDate: Date;
  endDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  isCurrentWeek: boolean;
}

export function WeekNavigation({ startDate, endDate, onPrevious, onNext, isCurrentWeek }: WeekNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button onClick={onPrevious} className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{formatWeekRange(startDate, endDate)}</p>
        {isCurrentWeek && <span className="text-xs text-primary font-medium">Esta semana</span>}
      </div>
      <button
        onClick={onNext}
        disabled={isCurrentWeek}
        className={cn(
          "p-2 rounded-xl transition-colors",
          isCurrentWeek 
            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed" 
            : "bg-secondary text-foreground hover:bg-secondary/80"
        )}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
