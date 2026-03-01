export interface Goal {
  id: string;
  title: string;
  emoji: string;
  weeklyTarget: number;
  createdAt: Date;
}

export type Mood = '😊' | '😌' | '😐' | '😓' | '😤';

export interface DailyCheck {
  id: string;
  goalId: string;
  date: string;
  completed: boolean;
  note?: string;
  mood?: Mood;
  satisfaction?: number; 
  duration?: number;
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: string[];
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  goalEmojis: string[];
  goalTitles: string[];
  goalId?: string;
}

export interface GoalStreak {
  goalId: string;
  currentStreak: number;
  maxStreak: number;
}
