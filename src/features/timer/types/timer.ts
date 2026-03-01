export interface TimerSession {
  id: string;
  goalId?: string;
  label: string;
  duration: number; 
  startedAt: string; 
  completedAt?: string; 
}
