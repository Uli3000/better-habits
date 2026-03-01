import { useState, useEffect } from 'react';
import type { Goal, DailyCheck, UnlockedAchievement } from '@/features/goals/types/goals';
import { Trophy, Flame, Star, Zap, Crown, Medal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AchievementCelebration } from './AchievementCelebration';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  color: string;
  bgColor: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak-3', name: 'Buen inicio', description: '3 días consecutivos', icon: <Flame size={20} />, requirement: 3, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  { id: 'streak-7', name: 'Semana perfecta', description: '7 días consecutivos', icon: <Star size={20} />, requirement: 7, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { id: 'streak-14', name: 'Imparable', description: '14 días consecutivos', icon: <Zap size={20} />, requirement: 14, color: 'text-primary', bgColor: 'bg-primary/20' },
  { id: 'streak-30', name: 'Maestro del hábito', description: '30 días consecutivos', icon: <Trophy size={20} />, requirement: 30, color: 'text-accent', bgColor: 'bg-accent/20' },
  { id: 'streak-60', name: 'Leyenda', description: '60 días consecutivos', icon: <Crown size={20} />, requirement: 60, color: 'text-warning', bgColor: 'bg-warning/20' },
  { id: 'streak-100', name: 'Centenario', description: '100 días consecutivos', icon: <Medal size={20} />, requirement: 100, color: 'text-success', bgColor: 'bg-success/20' },
];

const UNLOCKED_KEY = 'unlocked-achievements';

interface AchievementsBadgesProps {
  goals: Goal[];
  checks: DailyCheck[];
}

export function AchievementsBadges({ goals, checks }: AchievementsBadgesProps) {
  const [unlockedData, setUnlockedData] = useState<UnlockedAchievement[]>(() => {
    const saved = localStorage.getItem(UNLOCKED_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [celebrationGoals, setCelebrationGoals] = useState<{ emojis: string[]; titles: string[] }>({ emojis: [], titles: [] });
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const { currentStreak, maxStreak } = calculateStreaks(goals, checks);

  useEffect(() => {
    if (goals.length === 0) return;
    const unlockedIds = unlockedData.map(u => u.achievementId);
    const newlyUnlocked = ACHIEVEMENTS.filter(a => maxStreak >= a.requirement && !unlockedIds.includes(a.id));

    if (newlyUnlocked.length > 0) {
      const newUnlockedData: UnlockedAchievement[] = newlyUnlocked.map(a => ({
        achievementId: a.id, unlockedAt: new Date().toISOString(),
        goalEmojis: goals.map(g => g.emoji), goalTitles: goals.map(g => g.title),
      }));
      const updatedData = [...unlockedData, ...newUnlockedData];
      setUnlockedData(updatedData);
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(updatedData));
      const highestNew = newlyUnlocked.reduce((prev, curr) => curr.requirement > prev.requirement ? curr : prev);
      setCelebratingAchievement(highestNew);
      setCelebrationGoals({ emojis: goals.map(g => g.emoji), titles: goals.map(g => g.title) });
    }
  }, [maxStreak, goals, unlockedData]);

  const getUnlockedData = (achievementId: string): UnlockedAchievement | undefined => {
    return unlockedData.find(u => u.achievementId === achievementId);
  };

  const nextAchievement = ACHIEVEMENTS.find(a => maxStreak < a.requirement);

  if (goals.length === 0) return null;

  return (
    <>
      <div className="gradient-card rounded-2xl p-5 shadow-card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Logros</h3>
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/20 text-warning">
              <Flame size={16} />
              <span className="text-sm font-semibold">{currentStreak} días</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = maxStreak >= achievement.requirement;
            const unlockData = getUnlockedData(achievement.id);
            const isSelected = selectedBadge === achievement.id;
            
            return (
              <button key={achievement.id} onClick={() => isUnlocked && setSelectedBadge(isSelected ? null : achievement.id)} disabled={!isUnlocked}
                className={cn("relative flex flex-col items-center p-3 rounded-xl transition-all",
                  isUnlocked ? `${achievement.bgColor} border border-${achievement.color.replace('text-', '')}/30 hover:scale-105` : "bg-secondary/50 opacity-40 cursor-not-allowed",
                  isSelected && "ring-2 ring-primary"
                )}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", isUnlocked ? achievement.color : "text-muted-foreground")}>
                  {achievement.icon}
                </div>
                <p className={cn("text-xs font-semibold text-center", isUnlocked ? "text-foreground" : "text-muted-foreground")}>{achievement.name}</p>
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">{achievement.description}</p>
                {isUnlocked && unlockData && (
                  <div className="flex gap-0.5 mt-2">
                    {unlockData.goalEmojis.slice(0, 3).map((emoji, i) => (<span key={i} className="text-xs">{emoji}</span>))}
                    {unlockData.goalEmojis.length > 3 && (<span className="text-[10px] text-muted-foreground">+{unlockData.goalEmojis.length - 3}</span>)}
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <span className="text-[10px]">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedBadge && (() => {
          const achievement = ACHIEVEMENTS.find(a => a.id === selectedBadge);
          const unlockData = getUnlockedData(selectedBadge);
          if (!achievement || !unlockData) return null;
          return (
            <div className="mb-4 p-4 rounded-xl bg-secondary/70 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={achievement.color}>{achievement.icon}</span>
                  <span className="font-semibold text-foreground">{achievement.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(parseISO(unlockData.unlockedAt), "d MMM yyyy", { locale: es })}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Desbloqueado con estas metas:</p>
              <div className="flex flex-wrap gap-2">
                {unlockData.goalTitles.map((title, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium">
                    <span>{unlockData.goalEmojis[i]}</span>{title}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {nextAchievement && (
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Próximo:</span>
                <span className="text-xs font-medium text-foreground">{nextAchievement.name}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{maxStreak}/{nextAchievement.requirement}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${Math.min((maxStreak / nextAchievement.requirement) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <ChevronRight size={12} />
              Completa todas tus metas {nextAchievement.requirement - maxStreak} días más
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Racha actual</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{maxStreak}</p>
            <p className="text-xs text-muted-foreground">Mejor racha</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{unlockedData.length}</p>
            <p className="text-xs text-muted-foreground">Logros</p>
          </div>
        </div>
      </div>

      <AchievementCelebration
        isOpen={celebratingAchievement !== null}
        onClose={() => setCelebratingAchievement(null)}
        achievement={celebratingAchievement}
        goalEmojis={celebrationGoals.emojis}
        goalTitles={celebrationGoals.titles}
      />
    </>
  );
}

function calculateStreaks(goals: Goal[], checks: DailyCheck[]): { currentStreak: number; maxStreak: number } {
  if (goals.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isAllGoalsCompleted = (dateStr: string): boolean => {
    return goals.every(goal => checks.some(c => c.goalId === goal.id && c.date === dateStr && c.completed));
  };

  let currentStreak = 0;
  let checkDate = today;
  let todayStr = format(today, 'yyyy-MM-dd');
  
  if (!isAllGoalsCompleted(todayStr)) {
    checkDate = subDays(today, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (isAllGoalsCompleted(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
    if (currentStreak > 365) break;
  }

  const completedDays = new Set<string>();
  checks.forEach(check => {
    if (check.completed) {
      const dateStr = check.date;
      if (isAllGoalsCompleted(dateStr)) {
        completedDays.add(dateStr);
      }
    }
  });

  let maxStreak = 0;
  const sortedDays = Array.from(completedDays).sort();
  
  if (sortedDays.length > 0) {
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = parseISO(sortedDays[i - 1]);
      const currDate = parseISO(sortedDays[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) { streak++; } else { maxStreak = Math.max(maxStreak, streak); streak = 1; }
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  maxStreak = Math.max(maxStreak, currentStreak);
  return { currentStreak, maxStreak };
}
