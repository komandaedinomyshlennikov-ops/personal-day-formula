import type { DayInfo } from '@/types';
import { fromLocalDate, toLocalDate } from '@/utils/date';
import {
  calculatePersonalDayFromNumbers,
  calculateUniversalDayFromParts,
  isChallengingDay,
  isFavorableDay,
} from '@/utils/numerology';

/** Next N calendar days starting from tomorrow (local), as DayInfo. */
export function getUpcomingDays(
  birthDate: string,
  count: number = 3,
  from: Date = new Date()
): DayInfo[] {
  const result: DayInfo[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  for (let i = 1; i <= count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const { year, month, day } = fromLocalDate(d);
    const personalNumber = calculatePersonalDayFromNumbers(
      birthDate,
      year,
      month,
      day
    );
    const generalNumber = calculateUniversalDayFromParts(year, month, day);

    result.push({
      date: toLocalDate({ year, month, day }),
      personalNumber,
      generalNumber,
      isFavorable: isFavorableDay(personalNumber),
      isUnfavorable: isChallengingDay(personalNumber),
      isNeutral: !isFavorableDay(personalNumber) && !isChallengingDay(personalNumber),
      generalPlanet: '',
      personalPlanet: '',
    });
  }

  return result;
}

/** Whole days left until ISO end date (ceil). 0 if already past. */
export function getDaysLeft(endDateIso: string | null | undefined, now = new Date()): number {
  if (!endDateIso) return 0;
  const end = new Date(endDateIso).getTime();
  const diff = end - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
