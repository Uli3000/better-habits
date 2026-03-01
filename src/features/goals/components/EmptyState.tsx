import { Target } from 'lucide-react';

interface EmptyStateProps {
  onAddGoal: () => void;
}

export function EmptyState({ onAddGoal }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
        <Target size={40} className="text-primary-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">¡Empieza tu semana!</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-xs">
        Agrega tus metas semanales y haz seguimiento diario de tu progreso
      </p>
      <button
        onClick={onAddGoal}
        className="gradient-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity"
      >
        Crear primera meta
      </button>
    </div>
  );
}
