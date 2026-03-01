import { useEffect, useState } from 'react';
import { Trophy, Flame, Star, Zap, Crown, Medal, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    id: string;
    name: string;
    description: string;
    requirement: number;
  } | null;
  goalEmojis: string[];
  goalTitles: string[];
}

const ACHIEVEMENT_ICONS: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  'streak-3': { icon: <Flame size={48} />, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  'streak-7': { icon: <Star size={48} />, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  'streak-14': { icon: <Zap size={48} />, color: 'text-primary', bgColor: 'bg-primary/20' },
  'streak-30': { icon: <Trophy size={48} />, color: 'text-accent', bgColor: 'bg-accent/20' },
  'streak-60': { icon: <Crown size={48} />, color: 'text-warning', bgColor: 'bg-warning/20' },
  'streak-100': { icon: <Medal size={48} />, color: 'text-success', bgColor: 'bg-success/20' },
};

export function AchievementCelebration({ isOpen, onClose, achievement, goalEmojis, goalTitles }: AchievementCelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  if (!isOpen || !achievement) return null;

  const iconData = ACHIEVEMENT_ICONS[achievement.id] || ACHIEVEMENT_ICONS['streak-3'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div key={particle.id} className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{ left: `${particle.x}%`, top: `-10%`, animationDelay: `${particle.delay}s`,
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][particle.id % 6] }} />
        ))}
      </div>
      <div className="relative z-10 w-[90%] max-w-sm animate-celebration-pop">
        <div className="gradient-card rounded-3xl p-8 shadow-card border border-border/50 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
          <div className="absolute top-6 left-6 text-warning animate-pulse"><Sparkles size={24} /></div>
          <div className="absolute top-6 right-14 text-primary animate-pulse" style={{ animationDelay: '0.3s' }}><Sparkles size={20} /></div>
          <div className={cn("w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-badge-glow", iconData.bgColor, iconData.color)}>
            {iconData.icon}
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">¡Logro Desbloqueado!</h2>
          <h3 className={cn("text-xl font-bold mb-2", iconData.color)}>{achievement.name}</h3>
          <p className="text-muted-foreground mb-6">{achievement.description}</p>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 mb-6">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Metas que contribuyeron</p>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {goalEmojis.map((emoji, i) => (
                <span key={i} className="text-2xl animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>{emoji}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {goalTitles.map((title, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium">{title}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all">
            ¡Seguir así! 💪
          </button>
        </div>
      </div>
    </div>
  );
}
