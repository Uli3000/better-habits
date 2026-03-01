import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export function getMonthDays(referenceDate: Date): Date[] {
  const start = startOfMonth(referenceDate);
  const end = endOfMonth(referenceDate);
  const calendarStart = startOfWeek(start, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: es });
}

export function formatDateFull(date: Date): string {
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function isSameMonthAs(date: Date, referenceDate: Date): boolean {
  return isSameMonth(date, referenceDate);
}

export function isDayToday(date: Date): boolean {
  return isToday(date);
}
