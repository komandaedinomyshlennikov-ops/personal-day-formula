import type { DayInfo } from '@/types';
import { getUpcomingDays } from '@/utils/upcomingDays';
import { isFavorableDay, isChallengingDay } from '@/utils/numerology';

export interface BestWindow {
  day: DayInfo;
  score: number;
  reason: 'favorable' | 'neutral' | 'challenging';
}

/** Score next N days; higher = better for action (year perk). */
export function getBestWindows(
  birthDate: string,
  horizon = 30,
  top = 5
): BestWindow[] {
  const days = getUpcomingDays(birthDate, horizon);
  const scored: BestWindow[] = days.map((day) => {
    let score = 5;
    if (isFavorableDay(day.personalNumber)) score = 10;
    else if (isChallengingDay(day.personalNumber)) score = 2;
    // Slight boost for classic "start" numbers
    if ([1, 3, 5, 6].includes(day.personalNumber)) score += 1;
    return {
      day,
      score,
      reason: isFavorableDay(day.personalNumber)
        ? 'favorable'
        : isChallengingDay(day.personalNumber)
          ? 'challenging'
          : 'neutral',
    };
  });

  return scored
    .filter((w) => w.score >= 9)
    .sort((a, b) => b.score - a.score || a.day.date.getTime() - b.day.date.getTime())
    .slice(0, top);
}

export interface WeekDigestDay {
  day: DayInfo;
  tone: 'favorable' | 'challenging' | 'neutral';
}

/** Next 7 days snapshot for weekly digest (year perk). */
export function getWeeklyDigest(birthDate: string): WeekDigestDay[] {
  return getUpcomingDays(birthDate, 7).map((day) => ({
    day,
    tone: isFavorableDay(day.personalNumber)
      ? 'favorable'
      : isChallengingDay(day.personalNumber)
        ? 'challenging'
        : 'neutral',
  }));
}

export function countWeekTones(digest: WeekDigestDay[]) {
  return digest.reduce(
    (acc, d) => {
      acc[d.tone] += 1;
      return acc;
    },
    { favorable: 0, neutral: 0, challenging: 0 }
  );
}
