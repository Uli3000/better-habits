import type { MotivationItem } from '../types/motivation';
import { Trash2, Quote, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MotivationBoardProps {
  items: MotivationItem[];
  onDelete: (id: string) => void;
}

export function MotivationBoard({ items, onDelete }: MotivationBoardProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="text-primary" size={36} />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Tu mural de inspiración</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Agrega frases motivacionales o imágenes que te impulsen a cumplir tus hábitos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "rounded-2xl border border-border/50 overflow-hidden animate-slide-up",
            "transition-all duration-300 hover:border-primary/30",
            item.type === 'quote' ? 'gradient-card p-6' : 'bg-card'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {item.type === 'quote' ? (
            <div className="relative">
              <Quote size={32} className="text-primary/20 absolute -top-1 -left-1" />
              <p className="text-foreground text-lg font-medium leading-relaxed pl-6 italic">
                "{item.content}"
              </p>
              {item.author && (
                <p className="text-primary font-semibold mt-3 pl-6">— {item.author}</p>
              )}
            </div>
          ) : (
            <img
              src={item.content}
              alt="Motivación"
              className="w-full max-h-72 object-cover"
              loading="lazy"
            />
          )}

          <div className={cn(
            "flex justify-end",
            item.type === 'image' ? 'p-3' : 'mt-4'
          )}>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
