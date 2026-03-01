import { useState } from 'react';
import { Plus, CalendarDays, LayoutGrid, Trophy, TrendingUp, Sparkles, Timer, LogOut, LogIn } from 'lucide-react';
import { isSameWeek } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Feature imports
import { useGoals, getCurrentWeek, getWeekOffset, type Goal } from '@/features/goals';
import { GoalCard } from '@/features/goals';
import { WeekNavigation } from '@/features/goals';
import { StatsCard } from '@/features/goals';
import { AddGoalDialog } from '@/features/goals';
import { EditGoalDialog } from '@/features/goals';
import { EmptyState } from '@/features/goals';

import { MonthlyCalendar, DaySummaryDialog } from '@/features/calendar';
import { AchievementsBadges, IndividualGoalAchievements } from '@/features/achievements';
import { TrendCharts } from '@/features/trends';
import { useMotivation, MotivationBoard, AddMotivationDialog } from '@/features/motivation';
import { TimerView } from '@/features/timer';

import { useGuestGoals } from '@/hooks/useGuestGoals';
import { useGuestMotivation } from '@/hooks/useGuestMotivation';
import { useGuestTimer } from '@/hooks/useGuestTimer';

type ViewMode = 'weekly' | 'monthly' | 'achievements' | 'trends' | 'motivation' | 'timer';

const Index = () => {
  const { signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddMotivation, setShowAddMotivation] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const cloudGoals = useGoals();
  const guestGoals = useGuestGoals();
  const goalsData = isGuest ? guestGoals : cloudGoals;

  const cloudMotivation = useMotivation();
  const guestMotivation = useGuestMotivation();
  const motivationData = isGuest ? guestMotivation : cloudMotivation;

  const {
    goals, checks, addGoal, updateGoal, deleteGoal,
    toggleCheck, updateCheckDetails, getCheckForDay, getWeeklyProgress,
  } = goalsData;

  const { items: motivationItems, addQuote, addImage, deleteItem: deleteMotivation } = motivationData;

  const guestTimer = useGuestTimer();
  const timerHookForGuest = isGuest ? guestTimer : undefined;

  const referenceDate = weekOffset === 0 ? new Date() : getWeekOffset(new Date(), weekOffset);
  const currentWeek = getCurrentWeek(referenceDate);
  const isCurrentWeek = isSameWeek(new Date(), referenceDate, { weekStartsOn: 1 });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">
                Better <span className="text-primary">Habits</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {viewMode === 'weekly' ? 'Seguimiento semanal' : 
                 viewMode === 'monthly' ? 'Vista mensual' : 
                 viewMode === 'achievements' ? 'Tus logros' : 
                 viewMode === 'motivation' ? 'Inspiración' : 
                 viewMode === 'timer' ? 'Temporizador' : 'Tendencias'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {isGuest && (
                <button onClick={() => { signOut(); navigate('/auth'); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1.5" title="Crear cuenta">
                  <LogIn size={14} />
                  Crear cuenta
                </button>
              )}
              <button onClick={() => { signOut(); navigate('/auth'); }} className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="flex bg-secondary rounded-xl p-1 mt-4">
              <button onClick={() => setViewMode('weekly')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'weekly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setViewMode('monthly')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'monthly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <CalendarDays size={20} />
              </button>
              <button onClick={() => setViewMode('trends')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'trends' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <TrendingUp size={20} />
              </button>
              <button onClick={() => setViewMode('achievements')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'achievements' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Trophy size={20} />
              </button>
              <button onClick={() => setViewMode('motivation')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'motivation' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Sparkles size={20} />
              </button>
              <button onClick={() => setViewMode('timer')} className={cn("p-2.5 rounded-lg transition-all", viewMode === 'timer' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Timer size={20} />
              </button>
            </div>
        </header>

        {viewMode === 'timer' ? (
          <TimerView goals={goals} onUpdateCheckDetails={updateCheckDetails} getCheckForDay={getCheckForDay} timerHook={timerHookForGuest} />
        ) : viewMode === 'motivation' ? (
          <MotivationBoard items={motivationItems} onDelete={deleteMotivation} />
        ) : goals.length > 0 ? (
          <>
            {viewMode === 'weekly' ? (
              <>
                <WeekNavigation startDate={currentWeek.startDate} endDate={currentWeek.endDate} onPrevious={() => setWeekOffset(weekOffset - 1)} onNext={() => setWeekOffset(weekOffset + 1)} isCurrentWeek={isCurrentWeek} />
                <StatsCard goals={goals} checks={checks} weekDays={currentWeek.days} />
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} weekDays={currentWeek.days} getCheckForDay={getCheckForDay} onToggleCheck={toggleCheck} onUpdateDetails={updateCheckDetails} weeklyProgress={getWeeklyProgress(goal.id, currentWeek.days)} onDelete={deleteGoal} onEdit={setEditingGoal} />
                  ))}
                </div>
              </>
            ) : viewMode === 'monthly' ? (
              <>
                <MonthlyCalendar goals={goals} checks={checks} onDayClick={setSelectedDay} />
                <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <p className="text-sm text-muted-foreground text-center">💡 Toca cualquier día para ver el detalle y las notas</p>
                </div>
              </>
            ) : viewMode === 'trends' ? (
              <TrendCharts goals={goals} checks={checks} />
            ) : (
              <>
                <AchievementsBadges goals={goals} checks={checks} />
                <IndividualGoalAchievements goals={goals} checks={checks} />
              </>
            )}
          </>
        ) : (
          <EmptyState onAddGoal={() => setShowAddDialog(true)} />
        )}
      </div>

      {viewMode !== 'timer' && (
        <button
          onClick={() => viewMode === 'motivation' ? setShowAddMotivation(true) : setShowAddDialog(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl gradient-primary shadow-glow flex items-center justify-center text-primary-foreground hover:opacity-90 transition-all animate-pulse-glow"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <AddGoalDialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={addGoal} />
      <EditGoalDialog isOpen={editingGoal !== null} onClose={() => setEditingGoal(null)} goal={editingGoal} onSave={updateGoal} />
      <DaySummaryDialog isOpen={selectedDay !== null} onClose={() => setSelectedDay(null)} date={selectedDay || ''} goals={goals} checks={checks} />
      <AddMotivationDialog isOpen={showAddMotivation} onClose={() => setShowAddMotivation(false)} onAddQuote={addQuote} onAddImage={addImage} />
    </div>
  );
};

export default Index;
