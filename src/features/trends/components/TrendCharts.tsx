import { useState } from 'react';
import type { Goal, DailyCheck } from '@/features/goals/types/goals';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, Clock, Star, ChevronDown } from 'lucide-react';

interface TrendChartsProps {
  goals: Goal[];
  checks: DailyCheck[];
}

type ChartType = 'satisfaction' | 'duration';
type TimeRange = 7 | 14 | 30;

export function TrendCharts({ goals, checks }: TrendChartsProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | 'all'>('all');
  const [chartType, setChartType] = useState<ChartType>('satisfaction');
  const [timeRange, setTimeRange] = useState<TimeRange>(14);

  const today = startOfDay(new Date());
  const dates = Array.from({ length: timeRange }, (_, i) => {
    const date = subDays(today, timeRange - 1 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const getChartData = () => {
    return dates.map(date => {
      const dayChecks = checks.filter(c => c.date === date);
      
      if (selectedGoal === 'all') {
        const checksWithData = dayChecks.filter(c => chartType === 'satisfaction' ? c.satisfaction : c.duration);
        if (checksWithData.length === 0) {
          return { date, value: null, label: format(parseISO(date), 'd MMM', { locale: es }) };
        }
        const value = chartType === 'satisfaction'
          ? checksWithData.reduce((sum, c) => sum + (c.satisfaction || 0), 0) / checksWithData.length
          : checksWithData.reduce((sum, c) => sum + (c.duration || 0), 0);
        return { date, value: Math.round(value * 10) / 10, label: format(parseISO(date), 'd MMM', { locale: es }) };
      } else {
        const check = dayChecks.find(c => c.goalId === selectedGoal);
        const value = chartType === 'satisfaction' ? check?.satisfaction : check?.duration;
        return { date, value: value || null, label: format(parseISO(date), 'd MMM', { locale: es }) };
      }
    });
  };

  const chartData = getChartData();
  const hasData = chartData.some(d => d.value !== null);
  const validData = chartData.filter(d => d.value !== null);
  const average = validData.length > 0 ? validData.reduce((sum, d) => sum + (d.value || 0), 0) / validData.length : 0;
  const trend = validData.length >= 2 ? (validData[validData.length - 1].value || 0) - (validData[0].value || 0) : 0;
  const selectedGoalData = goals.find(g => g.id === selectedGoal);

  return (
    <div className="gradient-card rounded-2xl p-5 shadow-card mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-foreground">Tendencias</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[140px]">
          <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}
            className="w-full appearance-none bg-secondary rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="all">Todas las metas</option>
            {goals.map(goal => (<option key={goal.id} value={goal.id}>{goal.emoji} {goal.title}</option>))}
          </select>
          <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="flex bg-secondary rounded-lg p-1">
          <button onClick={() => setChartType('satisfaction')} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all", chartType === 'satisfaction' ? "bg-warning/20 text-warning" : "text-muted-foreground hover:text-foreground")}>
            <Star size={14} /><span className="hidden sm:inline">Satisfacción</span>
          </button>
          <button onClick={() => setChartType('duration')} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all", chartType === 'duration' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Clock size={14} /><span className="hidden sm:inline">Tiempo</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {([7, 14, 30] as TimeRange[]).map(range => (
          <button key={range} onClick={() => setTimeRange(range)} className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all", timeRange === range ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {range}d
          </button>
        ))}
      </div>

      <div className="h-48 mb-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartType === 'satisfaction' ? 'hsl(45, 95%, 55%)' : 'hsl(24, 95%, 60%)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartType === 'satisfaction' ? 'hsl(45, 95%, 55%)' : 'hsl(24, 95%, 60%)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} interval="preserveStartEnd" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} domain={chartType === 'satisfaction' ? [0, 5] : ['auto', 'auto']} tickFormatter={(value) => chartType === 'duration' ? `${value}m` : value} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(240, 12%, 12%)', border: '1px solid hsl(240, 10%, 20%)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [chartType === 'satisfaction' ? `${value} ★` : `${value} min`, chartType === 'satisfaction' ? 'Satisfacción' : 'Duración']}
                labelStyle={{ color: 'hsl(0, 0%, 98%)' }} />
              <Area type="monotone" dataKey="value" stroke={chartType === 'satisfaction' ? 'hsl(45, 95%, 55%)' : 'hsl(24, 95%, 60%)'} strokeWidth={2} fill="url(#colorValue)" connectNulls
                dot={{ fill: chartType === 'satisfaction' ? 'hsl(45, 95%, 55%)' : 'hsl(24, 95%, 60%)', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: chartType === 'satisfaction' ? 'hsl(45, 95%, 55%)' : 'hsl(24, 95%, 60%)', strokeWidth: 0, r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No hay datos suficientes</p>
            <p className="text-xs">Registra satisfacción o duración para ver tendencias</p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{chartType === 'satisfaction' ? `${average.toFixed(1)} ★` : `${Math.round(average)}m`}</p>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </div>
          <div className="text-center">
            <p className={cn("text-lg font-bold", trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-foreground")}>
              {trend > 0 ? '+' : ''}{chartType === 'satisfaction' ? trend.toFixed(1) : `${Math.round(trend)}m`}
            </p>
            <p className="text-xs text-muted-foreground">Tendencia</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{validData.length}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
        </div>
      )}

      {selectedGoal !== 'all' && selectedGoalData && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
          <span className="text-xl">{selectedGoalData.emoji}</span>
          <span className="text-sm text-muted-foreground">
            Mostrando datos de <span className="text-foreground font-medium">{selectedGoalData.title}</span>
          </span>
        </div>
      )}
    </div>
  );
}
