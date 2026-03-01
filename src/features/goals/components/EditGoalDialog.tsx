import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Goal } from '@/features/goals/types/goals';

interface EditGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: (id: string, title: string, emoji: string, weeklyTarget: number) => void;
}

const EMOJI_OPTIONS = ['🏃','💪','🧘','📚','✍️','🧠','🎯','⏳','🔥','⚡','🌱','🌿','💧','🍎','😴','📈','🗓️','🧹','💬','✨','💻','🖥️','⌨️','📝','📖','🎓','🌍','🗣️','🔤','📊'];

export function EditGoalDialog({ isOpen, onClose, goal, onSave }: EditGoalDialogProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [weeklyTarget, setWeeklyTarget] = useState(5);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setEmoji(goal.emoji);
      setWeeklyTarget(goal.weeklyTarget);
    }
  }, [goal]);

  const handleSubmit = () => {
    if (title.trim() && goal) {
      onSave(goal.id, title.trim(), emoji, weeklyTarget);
      onClose();
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-md rounded-2xl p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-foreground mb-6">Editar Meta</h3>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)} className={cn("w-11 h-11 rounded-xl text-2xl transition-all", emoji === e ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-secondary hover:bg-secondary/80")}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">¿Qué quieres lograr?</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Ejercicio, Leer, Meditar..." className={cn("w-full p-4 rounded-xl", "bg-secondary border-none text-foreground placeholder:text-muted-foreground", "focus:outline-none focus:ring-2 focus:ring-primary/50")} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Días por semana: <span className="text-primary font-bold">{weeklyTarget}</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button key={n} onClick={() => setWeeklyTarget(n)} className={cn("flex-1 py-3 rounded-xl font-semibold transition-all", weeklyTarget === n ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!title.trim()} className={cn("w-full mt-6 py-4 rounded-xl font-semibold transition-all", title.trim() ? "gradient-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed")}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
