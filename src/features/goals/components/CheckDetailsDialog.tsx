import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mood } from '@/features/goals/types/goals';

const MOODS: { emoji: Mood; label: string }[] = [
  { emoji: '😊', label: 'Genial' },
  { emoji: '😌', label: 'Bien' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😓', label: 'Difícil' },
  { emoji: '😤', label: 'Frustrante' },
];

const DURATIONS = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 h' },
  { value: 120, label: '2+ h' },
];

interface CheckDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  goalEmoji: string;
  date: string;
  currentNote?: string;
  currentMood?: Mood;
  currentSatisfaction?: number;
  currentDuration?: number;
  onSave: (data: { note: string; mood?: Mood; satisfaction?: number; duration?: number }) => void;
}

export function CheckDetailsDialog({ 
  isOpen, onClose, goalTitle, goalEmoji, date, 
  currentNote, currentMood, currentSatisfaction, currentDuration, onSave 
}: CheckDetailsDialogProps) {
  const [note, setNote] = useState(currentNote || '');
  const [mood, setMood] = useState<Mood | undefined>(currentMood);
  const [satisfaction, setSatisfaction] = useState<number | undefined>(currentSatisfaction);
  const [duration, setDuration] = useState<number | undefined>(currentDuration);

  useEffect(() => {
    setNote(currentNote || '');
    setMood(currentMood);
    setSatisfaction(currentSatisfaction);
    setDuration(currentDuration);
  }, [currentNote, currentMood, currentSatisfaction, currentDuration, isOpen]);

  if (!isOpen) return null;

  const formattedDate = date ? format(new Date(date), "EEEE d 'de' MMMM", { locale: es }) : '';

  const handleSave = () => {
    onSave({ note, mood, satisfaction, duration });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="glass relative w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{goalEmoji}</span>
          <h3 className="text-xl font-bold text-foreground">{goalTitle}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 capitalize">{formattedDate}</p>

        {/* Mood selector */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 block">
            ¿Cómo te sentiste? <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.emoji}
                onClick={() => setMood(mood === m.emoji ? undefined : m.emoji)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                  mood === m.emoji 
                    ? "bg-primary/20 border-2 border-primary" 
                    : "bg-secondary border-2 border-transparent hover:border-border"
                )}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Satisfaction rating */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Star size={16} className="text-warning" />
            Satisfacción <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setSatisfaction(satisfaction === value ? undefined : value)}
                className={cn(
                  "flex-1 py-3 rounded-xl transition-all text-lg",
                  satisfaction && satisfaction >= value
                    ? "bg-warning/20 text-warning"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                ★
              </button>
            ))}
          </div>
          {satisfaction && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {satisfaction === 1 && 'Poco satisfecho'}
              {satisfaction === 2 && 'Algo satisfecho'}
              {satisfaction === 3 && 'Satisfecho'}
              {satisfaction === 4 && 'Muy satisfecho'}
              {satisfaction === 5 && '¡Excelente!'}
            </p>
          )}
        </div>

        {/* Duration selector */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Duración <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(duration === d.value ? undefined : d.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  duration === d.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Notas <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="¿Cómo te fue? ¿Qué aprendiste?"
            maxLength={500}
            className={cn(
              "w-full h-24 p-4 rounded-xl resize-none",
              "bg-secondary border-none text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{note.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-3 px-4 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
