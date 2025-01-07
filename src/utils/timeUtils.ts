import { differenceInHours, differenceInMinutes } from 'date-fns';

export function getTimeElapsed(date: string | null): string {
  if (!date) return '—';
  
  const now = new Date();
  const updateDate = new Date(date);
  
  const hours = differenceInHours(now, updateDate);
  const minutes = differenceInMinutes(now, updateDate) % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}