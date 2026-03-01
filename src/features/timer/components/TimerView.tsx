import { useState } from 'react';
import { Play, Pause, RotateCcw, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '../hooks/useTimer';
import type { Goal, Mood } from '@/features/goals/types/goals';
import { format } from 'date-fns';

interface TimerHook {
  seconds: number;
  isRunning: boolean;
  sessions: any[];
  start: () => void;
  pause: () => void;
  reset: () => void;
  saveSession: (label: string, goalId?: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

interface TimerViewProps {
  goals: Goal[];
  onUpdateCheckDetails?: (goalId: string, date: string, details: { note: string; mood?: Mood; satisfaction?: number; duration?: number }) => void;
  getCheckForDay?: (goalId: string, date: string) => { note?: string; mood?: Mood; satisfaction?: number; duration?: number; completed?: boolean } | undefined;
  timerHook?: TimerHook;
}

function formatTime(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  };
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function TimerView({ goals, onUpdateCheckDetails, getCheckForDay, timerHook }: TimerViewProps) {
  const defaultTimer = useTimer();
  const { seconds, isRunning, sessions, start, pause, reset, saveSession, deleteSession } = timerHook || defaultTimer;
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [label, setLabel] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const time = formatTime(seconds);

  const handleSave = () => {
    const finalLabel = label.trim() || (selectedGoalId ? goals.find(g => g.id === selectedGoalId)?.title || 'Actividad' : 'Actividad');
    saveSession(finalLabel, selectedGoalId || undefined);

    // Auto-register duration in the daily check for the associated goal
    if (selectedGoalId && onUpdateCheckDetails) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingCheck = getCheckForDay?.(selectedGoalId, today);
      const currentDuration = existingCheck?.duration || 0;
      const durationInMinutes = Math.max(1, Math.round(seconds / 60));
      onUpdateCheckDetails(selectedGoalId, today, {
        note: existingCheck?.note || '',
        mood: existingCheck?.mood,
        satisfaction: existingCheck?.satisfaction,
        duration: currentDuration + durationInMinutes,
      });
    }

    setLabel('');
    setSelectedGoalId('');
    setShowSaveForm(false);
  };

  const progress = Math.min((seconds % 60) / 60, 1);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          {/* Circular progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128" cy="128" r="120"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
            />
            <circle
              cx="128" cy="128" r="120"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-200"
            />
          </svg>

          {/* Time digits */}
          <div className="flex items-baseline gap-1 z-10">
            <span className="text-5xl font-extrabold text-foreground tabular-nums">{time.hours}</span>
            <span className={cn("text-3xl font-bold text-primary", isRunning && "animate-pulse")}>:</span>
            <span className="text-5xl font-extrabold text-foreground tabular-nums">{time.minutes}</span>
            <span className={cn("text-3xl font-bold text-primary", isRunning && "animate-pulse")}>:</span>
            <span className="text-5xl font-extrabold text-foreground tabular-nums">{time.seconds}</span>
          </div>
        </div>

        {/* Goal selector */}
        {goals.length > 0 && (
          <div className="w-full max-w-xs mb-4">
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="">Sin meta asociada</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.emoji} {g.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            disabled={seconds === 0 && !isRunning}
            className="p-4 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
          >
            <RotateCcw size={22} />
          </button>

          <button
            onClick={isRunning ? pause : start}
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-glow",
              isRunning
                ? "bg-warning text-warning-foreground"
                : "gradient-primary text-primary-foreground"
            )}
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button
            onClick={() => {
              if (seconds > 0) setShowSaveForm(true);
            }}
            disabled={seconds === 0}
            className="p-4 rounded-xl bg-secondary text-muted-foreground hover:text-accent transition-all disabled:opacity-30"
          >
            <Save size={22} />
          </button>
        </div>
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3 animate-slide-up">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nombre de la sesión (opcional)"
            className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowSaveForm(false)}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Guardar sesión
            </button>
          </div>
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">Sesiones recientes</h3>
          <div className="space-y-2">
            {sessions.slice(0, 20).map((session) => {
              const goal = goals.find(g => g.id === session.goalId);
              const sessionDate = session.completedAt
                ? new Date(session.completedAt)
                : new Date(session.startedAt);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                    {goal ? goal.emoji : '⏱️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{session.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {sessionDate.toLocaleDateString('es', { day: 'numeric', month: 'short' })} · {formatDuration(session.duration)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sessions.length === 0 && !isRunning && seconds === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">⏱️</div>
          <p className="text-muted-foreground text-sm">
            Inicia el temporizador para cronometrar tus actividades
          </p>
        </div>
      )}
    </div>
  );
}
