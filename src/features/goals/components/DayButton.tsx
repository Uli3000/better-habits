import { useState, useRef } from 'react';
import { formatDayShort, formatDayNumber, isDateToday } from '@/features/goals/utils/dateUtils';
import { Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayButtonProps {
  date: string;
  isCompleted: boolean;
  hasNote: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}

export function DayButton({ date, isCompleted, hasNote, onToggle, onLongPress }: DayButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = isDateToday(date);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
        "min-w-[44px] relative",
        today && "ring-2 ring-primary/50",
        isCompleted 
          ? "bg-success/20 text-success" 
          : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="text-xs font-medium">{formatDayShort(date)}</span>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
        isCompleted 
          ? "gradient-success text-success-foreground" 
          : "bg-muted",
        isAnimating && isCompleted && "animate-check-bounce"
      )}>
        {isCompleted ? (
          <Check size={18} strokeWidth={3} />
        ) : (
          <span className="text-sm font-semibold">{formatDayNumber(date)}</span>
        )}
      </div>
      {hasNote && (
        <MessageCircle size={12} className="absolute -top-1 -right-1 text-primary fill-primary" />
      )}
    </button>
  );
}
