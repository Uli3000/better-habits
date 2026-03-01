import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  date: string;
  currentNote?: string;
  onSave: (note: string) => void;
}

export function NoteDialog({ isOpen, onClose, goalTitle, date, currentNote, onSave }: NoteDialogProps) {
  const [note, setNote] = useState(currentNote || '');

  useEffect(() => {
    setNote(currentNote || '');
  }, [currentNote, isOpen]);

  if (!isOpen) return null;

  const formattedDate = date ? format(new Date(date), "EEEE d 'de' MMMM", { locale: es }) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-md rounded-2xl p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-foreground mb-1">{goalTitle}</h3>
        <p className="text-sm text-muted-foreground mb-4 capitalize">{formattedDate}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Por qué sí o no cumpliste? Reflexiona brevemente..."
          className={cn("w-full h-32 p-4 rounded-xl resize-none", "bg-secondary border-none text-foreground placeholder:text-muted-foreground", "focus:outline-none focus:ring-2 focus:ring-primary/50")}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(note)} className="flex-1 py-3 px-4 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
