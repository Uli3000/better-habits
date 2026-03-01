import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subWeeks, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WeekData } from '@/features/goals/types/goals';

export function getCurrentWeek(referenceDate: Date = new Date()): WeekData {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start, end }).map(day => 
    format(day, 'yyyy-MM-dd')
  );

  return {
    startDate: start,
    endDate: end,
    days,
  };
}

export function formatDayShort(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, 'EEE', { locale: es }).charAt(0).toUpperCase() + format(date, 'EEE', { locale: es }).slice(1, 3);
}

export function formatDayNumber(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, 'd');
}

export function isDateToday(dateString: string): boolean {
  return isToday(new Date(dateString));
}

export function formatWeekRange(start: Date, end: Date): string {
  const startStr = format(start, "d 'de' MMM", { locale: es });
  const endStr = format(end, "d 'de' MMM", { locale: es });
  return `${startStr} - ${endStr}`;
}

export function getWeekOffset(referenceDate: Date, offset: number): Date {
  return offset > 0 ? addWeeks(referenceDate, offset) : subWeeks(referenceDate, Math.abs(offset));
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
