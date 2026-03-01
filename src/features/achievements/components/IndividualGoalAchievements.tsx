import { useState, useEffect } from 'react';
import type { Goal, DailyCheck, UnlockedAchievement, GoalStreak } from '@/features/goals/types/goals';
import { Flame, Star, Zap, Trophy, Crown, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AchievementCelebration } from './AchievementCelebration';

interface IndividualAchievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  color: string;
  bgColor: string;
}

const INDIVIDUAL_ACHIEVEMENTS: IndividualAchievement[] = [
  { id: 'ind-7', name: 'Primera semana', description: '7 días seguidos', icon: <Flame size={16} />, requirement: 7, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  { id: 'ind-14', name: 'Dos semanas', description: '14 días seguidos', icon: <Star size={16} />, requirement: 14, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { id: 'ind-30', name: 'Un mes', description: '30 días seguidos', icon: <Zap size={16} />, requirement: 30, color: 'text-primary', bgColor: 'bg-primary/20' },
  { id: 'ind-60', name: 'Dos meses', description: '60 días seguidos', icon: <Trophy size={16} />, requirement: 60, color: 'text-accent', bgColor: 'bg-accent/20' },
  { id: 'ind-100', name: 'Centenario', description: '100 días seguidos', icon: <Crown size={16} />, requirement: 100, color: 'text-warning', bgColor: 'bg-warning/20' },
  { id: 'ind-365', name: 'Un año', description: '365 días seguidos', icon: <Medal size={16} />, requirement: 365, color: 'text-success', bgColor: 'bg-success/20' },
];

const UNLOCKED_INDIVIDUAL_KEY = 'unlocked-individual-achievements';

interface IndividualGoalAchievementsProps {
  goals: Goal[];
  checks: DailyCheck[];
}

export function IndividualGoalAchievements({ goals, checks }: IndividualGoalAchievementsProps) {
  const [unlockedData, setUnlockedData] = useState<UnlockedAchievement[]>(() => {
    const saved = localStorage.getItem(UNLOCKED_INDIVIDUAL_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [celebratingAchievement, setCelebratingAchievement] = useState<IndividualAchievement | null>(null);
  const [celebrationGoal, setCelebrationGoal] = useState<Goal | null>(null);

  const goalStreaks: GoalStreak[] = goals.map(goal => calculateGoalStreak(goal.id, checks));

  useEffect(() => {
    if (goals.length === 0) return;
    let hasNewAchievements = false;
    const newUnlockedData: UnlockedAchievement[] = [];

    goals.forEach(goal => {
      const streak = goalStreaks.find(s => s.goalId === goal.id);
      if (!streak) return;

      INDIVIDUAL_ACHIEVEMENTS.forEach(achievement => {
        const isAlreadyUnlocked = unlockedData.some(u => u.achievementId === achievement.id && u.goalId === goal.id);
        if (streak.maxStreak >= achievement.requirement && !isAlreadyUnlocked) {
          hasNewAchievements = true;
          newUnlockedData.push({
            achievementId: achievement.id, unlockedAt: new Date().toISOString(),
            goalEmojis: [goal.emoji], goalTitles: [goal.title], goalId: goal.id,
          });
          if (!celebratingAchievement) {
            setCelebratingAchievement(achievement);
            setCelebrationGoal(goal);
          }
        }
      });
    });

    if (hasNewAchievements) {
      const updatedData = [...unlockedData, ...newUnlockedData];
      setUnlockedData(updatedData);
      localStorage.setItem(UNLOCKED_INDIVIDUAL_KEY, JSON.stringify(updatedData));
    }
  }, [goalStreaks, goals, unlockedData, celebratingAchievement]);

  const getGoalAchievements = (goalId: string): UnlockedAchievement[] => {
    return unlockedData.filter(u => u.goalId === goalId);
  };

  const totalAchievements = unlockedData.length;

  if (goals.length === 0) return null;

  return (
    <>
      <div className="gradient-card rounded-2xl p-5 shadow-card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Logros por Meta</h3>
          <div className="px-3 py-1.5 rounded-full bg-primary/20 text-primary">
            <span className="text-sm font-semibold">{totalAchievements} logros</span>
          </div>
        </div>

        <div className="space-y-3">
          {goals.map(goal => {
            const streak = goalStreaks.find(s => s.goalId === goal.id);
            const achievements = getGoalAchievements(goal.id);
            const isExpanded = expandedGoal === goal.id;
            const nextAchievement = INDIVIDUAL_ACHIEVEMENTS.find(a => (streak?.maxStreak || 0) < a.requirement);

            return (
              <div key={goal.id} className="rounded-xl bg-secondary/50 border border-border/50 overflow-hidden">
                <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)} className="w-full p-4 flex items-center justify-between hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Flame size={12} className="text-warning" />
                        <span className="text-xs text-muted-foreground">Racha: {streak?.currentStreak || 0} días</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">Mejor: {streak?.maxStreak || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {achievements.slice(0, 3).map((a, i) => {
                        const achDef = INDIVIDUAL_ACHIEVEMENTS.find(def => def.id === a.achievementId);
                        return achDef ? (
                          <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 border-background", achDef.bgColor, achDef.color)}>
                            {achDef.icon}
                          </div>
                        ) : null;
                      })}
                      {achievements.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-background text-[10px] font-semibold text-muted-foreground">
                          +{achievements.length - 3}
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    {nextAchievement && (
                      <div className="mb-4 p-3 rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn("", nextAchievement.color)}>{nextAchievement.icon}</span>
                            <span className="text-xs font-medium text-foreground">{nextAchievement.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{streak?.maxStreak || 0}/{nextAchievement.requirement}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(((streak?.maxStreak || 0) / nextAchievement.requirement) * 100, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{nextAchievement.requirement - (streak?.maxStreak || 0)} días más para desbloquear</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {INDIVIDUAL_ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = achievements.some(a => a.achievementId === achievement.id);
                        const unlockInfo = achievements.find(a => a.achievementId === achievement.id);
                        return (
                          <div key={achievement.id} className={cn("relative flex flex-col items-center p-2 rounded-lg transition-all",
                            isUnlocked ? `${achievement.bgColor} border border-${achievement.color.replace('text-', '')}/30` : "bg-background/30 opacity-40"
                          )}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1", isUnlocked ? achievement.color : "text-muted-foreground")}>
                              {achievement.icon}
                            </div>
                            <p className={cn("text-[10px] font-semibold text-center", isUnlocked ? "text-foreground" : "text-muted-foreground")}>{achievement.name}</p>
                            {isUnlocked && unlockInfo && (
                              <p className="text-[8px] text-muted-foreground">{format(parseISO(unlockInfo.unlockedAt), "d MMM", { locale: es })}</p>
                            )}
                            {isUnlocked && (
                              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                                <span className="text-[8px]">✓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AchievementCelebration
        isOpen={celebratingAchievement !== null}
        onClose={() => { setCelebratingAchievement(null); setCelebrationGoal(null); }}
        achievement={celebratingAchievement}
        goalEmojis={celebrationGoal ? [celebrationGoal.emoji] : []}
        goalTitles={celebrationGoal ? [celebrationGoal.title] : []}
      />
    </>
  );
}

function calculateGoalStreak(goalId: string, checks: DailyCheck[]): GoalStreak {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isGoalCompleted = (dateStr: string): boolean => checks.some(c => c.goalId === goalId && c.date === dateStr && c.completed);

  let currentStreak = 0;
  let checkDate = today;
  let todayStr = format(today, 'yyyy-MM-dd');
  if (!isGoalCompleted(todayStr)) { checkDate = subDays(today, 1); }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (isGoalCompleted(dateStr)) { currentStreak++; checkDate = subDays(checkDate, 1); } else { break; }
    if (currentStreak > 365) break;
  }

  const completedDays = checks.filter(c => c.goalId === goalId && c.completed).map(c => c.date).sort();
  let maxStreak = 0;
  if (completedDays.length > 0) {
    let streak = 1;
    for (let i = 1; i < completedDays.length; i++) {
      const prevDate = parseISO(completedDays[i - 1]);
      const currDate = parseISO(completedDays[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) { streak++; } else { maxStreak = Math.max(maxStreak, streak); streak = 1; }
    }
    maxStreak = Math.max(maxStreak, streak);
  }
  maxStreak = Math.max(maxStreak, currentStreak);
  return { goalId, currentStreak, maxStreak };
}
