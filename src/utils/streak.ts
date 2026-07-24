import { formatDateOnly, fromLocalDate } from '@/utils/date';

const STORAGE_KEY = 'astronavigator_streak_v1';

export interface StreakState {
  streak: number;
  lastDate: string; // YYYY-MM-DD local
  totalDays: number;
}

function todayKey(d = new Date()): string {
  return formatDateOnly(fromLocalDate(d));
}

function yesterdayKey(d = new Date()): string {
  const y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  return formatDateOnly(fromLocalDate(y));
}

export function readStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StreakState;
      if (
        typeof parsed.streak === 'number' &&
        typeof parsed.lastDate === 'string' &&
        typeof parsed.totalDays === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return { streak: 0, lastDate: '', totalDays: 0 };
}

function writeStreak(state: StreakState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/**
 * Call once when calendar/home is opened.
 * Soft habit: counts unique local days, consecutive = streak.
 */
export function recordAppOpen(now = new Date()): StreakState & { isNewDay: boolean } {
  const today = todayKey(now);
  const prev = readStreak();

  if (prev.lastDate === today) {
    return { ...prev, isNewDay: false };
  }

  const cont = prev.lastDate === yesterdayKey(now);
  const next: StreakState = {
    lastDate: today,
    streak: cont ? prev.streak + 1 : 1,
    totalDays: prev.totalDays + 1,
  };
  writeStreak(next);
  return { ...next, isNewDay: true };
}

export function clearStreak(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
