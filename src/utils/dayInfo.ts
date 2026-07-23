import type { DayInfo } from '@/types';
import { parseDateOnly, toLocalDate } from '@/utils/date';
import {
  calculatePersonalDayFromNumbers,
  calculateUniversalDayFromParts,
  isChallengingDay,
  isFavorableDay,
} from '@/utils/numerology';

/** Build DayInfo for a YYYY-MM-DD string + birth date (deep-link safe). */
export function buildDayInfo(birthDate: string, dateOnly: string): DayInfo | null {
  const parts = parseDateOnly(dateOnly);
  if (!parts) return null;

  const personalNumber = calculatePersonalDayFromNumbers(
    birthDate,
    parts.year,
    parts.month,
    parts.day
  );
  const generalNumber = calculateUniversalDayFromParts(
    parts.year,
    parts.month,
    parts.day
  );

  return {
    date: toLocalDate(parts),
    personalNumber,
    generalNumber,
    isFavorable: isFavorableDay(personalNumber),
    isUnfavorable: isChallengingDay(personalNumber),
    isNeutral: !isFavorableDay(personalNumber) && !isChallengingDay(personalNumber),
    generalPlanet: '',
    personalPlanet: '',
  };
}

export function dayToPath(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `/day/${y}-${m}-${d}`;
}
