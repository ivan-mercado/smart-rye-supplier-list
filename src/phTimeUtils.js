import { format, utcToZonedTime } from 'date-fns-tz';

export function getPHDate() {
  const now = new Date();
  const phTime = utcToZonedTime(now, 'Asia/Manila');
  return format(phTime, 'yyyy-MM-dd');
}

export function getPHTime() {
  const now = new Date();
  const phTime = utcToZonedTime(now, 'Asia/Manila');
  return format(phTime, 'HH:mm:ss');
}