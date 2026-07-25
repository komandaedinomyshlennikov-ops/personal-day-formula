import type { DayInfo } from '@/types';
import type { TFunction } from 'i18next';
import { getUpcomingDays } from '@/utils/upcomingDays';
import {
  generateMonthData,
  isFavorableDay,
  isChallengingDay,
  calculatePersonalYear,
  calculatePersonalMonth,
  getEnergyInfo,
} from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';
import { fromLocalDate } from '@/utils/date';

export interface BestWindow {
  day: DayInfo;
  score: number;
  reason: 'favorable' | 'neutral' | 'challenging';
  tip: string;
}

function scoreDay(day: DayInfo): { score: number; reason: BestWindow['reason'] } {
  let score = 5;
  let reason: BestWindow['reason'] = 'neutral';
  if (isFavorableDay(day.personalNumber)) {
    score = 10;
    reason = 'favorable';
  } else if (isChallengingDay(day.personalNumber)) {
    score = 2;
    reason = 'challenging';
  }
  if ([1, 3, 5, 6].includes(day.personalNumber)) score += 1;
  const { day: d } = fromLocalDate(day.date);
  if (d === 10 || d === 20 || d === 30) score -= 1;
  return { score, reason };
}

function tipForNumber(personalNumber: number, t?: TFunction): string {
  if (t) {
    return getDayActionLine(personalNumber, t).action;
  }
  const map: Record<number, string> = {
    1: 'Start something new — a pitch, a plan, a boundary.',
    2: 'Partner and listen — good for talks, not solo sprints.',
    3: 'Create and share — writing, content, light social moves.',
    4: 'Build systems — admin, cleanup, finish open loops.',
    5: 'Move and explore — travel, variety, short experiments.',
    6: 'Care and home — family, health, design, repair.',
    7: 'Study and rest — research, solitude, no forced launches.',
    8: 'Money and power carefully — negotiate, review numbers.',
    9: 'Close chapters — wrap projects, donate, let go.',
  };
  return map[personalNumber] || 'Check the day card for a clear action.';
}

/** Score next N days; higher = better for action (year perk). Always returns up to `top`. */
export function getBestWindows(
  birthDate: string,
  horizon = 30,
  top = 5,
  t?: TFunction
): BestWindow[] {
  const days = getUpcomingDays(birthDate, horizon);
  const scored: BestWindow[] = days.map((day) => {
    const { score, reason } = scoreDay(day);
    return {
      day,
      score,
      reason,
      tip: tipForNumber(day.personalNumber, t),
    };
  });

  const strong = scored.filter((w) => w.score >= 9);
  const pool = strong.length >= Math.min(2, top) ? strong : scored;
  return pool
    .sort((a, b) => b.score - a.score || a.day.date.getTime() - b.day.date.getTime())
    .slice(0, top);
}

export interface MonthBalance {
  year: number;
  month: number;
  personalMonth: number;
  favorable: number;
  neutral: number;
  challenging: number;
  total: number;
  remainingFavorable: number;
  remainingChallenging: number;
}

/** Calendar-month balance for Pro month tools. */
export function getMonthBalance(
  birthDate: string,
  year: number,
  month: number
): MonthBalance {
  const days = generateMonthData(birthDate, year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const personalMonth = calculatePersonalMonth(birthDate, year, month);

  let favorable = 0;
  let challenging = 0;
  let remainingFavorable = 0;
  let remainingChallenging = 0;

  for (const d of days) {
    if (d.isFavorable) favorable += 1;
    else if (d.isUnfavorable) challenging += 1;

    const dt = new Date(d.date);
    dt.setHours(0, 0, 0, 0);
    if (dt >= today) {
      if (d.isFavorable) remainingFavorable += 1;
      else if (d.isUnfavorable) remainingChallenging += 1;
    }
  }

  return {
    year,
    month,
    personalMonth,
    favorable,
    neutral: days.length - favorable - challenging,
    challenging,
    total: days.length,
    remainingFavorable,
    remainingChallenging,
  };
}

/** Best action days remaining in the current calendar month (Pro month). */
export function getMonthTopDays(
  birthDate: string,
  year: number,
  month: number,
  top = 5,
  t?: TFunction
): BestWindow[] {
  const days = generateMonthData(birthDate, year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const remaining = days.filter((d) => {
    const dt = new Date(d.date);
    dt.setHours(0, 0, 0, 0);
    return dt >= today;
  });

  return remaining
    .map((day) => {
      const { score, reason } = scoreDay(day);
      return {
        day,
        score,
        reason,
        tip: tipForNumber(day.personalNumber, t),
      };
    })
    .sort((a, b) => b.score - a.score || a.day.date.getTime() - b.day.date.getTime())
    .slice(0, top);
}

/** Hard / recovery days left in the month. */
export function getMonthCautionDays(
  birthDate: string,
  year: number,
  month: number,
  top = 3,
  t?: TFunction
): BestWindow[] {
  const days = generateMonthData(birthDate, year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return days
    .filter((d) => {
      const dt = new Date(d.date);
      dt.setHours(0, 0, 0, 0);
      return dt >= today && d.isUnfavorable;
    })
    .map((day) => {
      const { score, reason } = scoreDay(day);
      return { day, score, reason, tip: tipForNumber(day.personalNumber, t) };
    })
    .sort((a, b) => a.day.date.getTime() - b.day.date.getTime())
    .slice(0, top);
}

export interface WeekDigestDay {
  day: DayInfo;
  tone: 'favorable' | 'challenging' | 'neutral';
  tip: string;
}

/** Next 7 days snapshot for weekly digest (year perk). */
export function getWeeklyDigest(birthDate: string, t?: TFunction): WeekDigestDay[] {
  return getUpcomingDays(birthDate, 7).map((day) => ({
    day,
    tone: isFavorableDay(day.personalNumber)
      ? 'favorable'
      : isChallengingDay(day.personalNumber)
        ? 'challenging'
        : 'neutral',
    tip: tipForNumber(day.personalNumber, t),
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

export interface YearFocusArea {
  key: 'career' | 'relations' | 'resource' | 'growth' | 'home';
  weight: number;
}

/** Soft year compass focus weights from personal year number (year perk). */
export function getYearFocusAreas(personalYear: number): YearFocusArea[] {
  const map: Record<number, YearFocusArea[]> = {
    1: [
      { key: 'career', weight: 3 },
      { key: 'growth', weight: 2 },
      { key: 'resource', weight: 1 },
    ],
    2: [
      { key: 'relations', weight: 3 },
      { key: 'home', weight: 2 },
      { key: 'career', weight: 1 },
    ],
    3: [
      { key: 'growth', weight: 3 },
      { key: 'relations', weight: 2 },
      { key: 'career', weight: 1 },
    ],
    4: [
      { key: 'resource', weight: 3 },
      { key: 'home', weight: 2 },
      { key: 'career', weight: 2 },
    ],
    5: [
      { key: 'growth', weight: 3 },
      { key: 'career', weight: 2 },
      { key: 'relations', weight: 1 },
    ],
    6: [
      { key: 'home', weight: 3 },
      { key: 'relations', weight: 3 },
      { key: 'resource', weight: 1 },
    ],
    7: [
      { key: 'growth', weight: 3 },
      { key: 'resource', weight: 1 },
      { key: 'home', weight: 1 },
    ],
    8: [
      { key: 'resource', weight: 3 },
      { key: 'career', weight: 3 },
      { key: 'relations', weight: 1 },
    ],
    9: [
      { key: 'growth', weight: 2 },
      { key: 'relations', weight: 2 },
      { key: 'career', weight: 1 },
    ],
  };
  return map[personalYear] || map[1];
}

export function getPersonalYearNow(birthDate: string): number {
  return calculatePersonalYear(birthDate, new Date().getFullYear());
}

/** Plain text weekly digest for share / clipboard (year perk). */
export function formatWeeklyDigestText(
  birthDate: string,
  locale: string,
  t?: TFunction
): string {
  const digest = getWeeklyDigest(birthDate, t);
  const tones = countWeekTones(digest);
  const lines = digest.map((d) => {
    const label = d.day.date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const mark =
      d.tone === 'favorable' ? '●' : d.tone === 'challenging' ? '▲' : '○';
    return `${mark} ${label} · ${d.day.personalNumber} — ${d.tip}`;
  });
  const header = locale.startsWith('ru')
    ? `Неделя: ●${tones.favorable}  ○${tones.neutral}  ▲${tones.challenging}`
    : `Week: ●${tones.favorable}  ○${tones.neutral}  ▲${tones.challenging}`;
  return [header, '', ...lines].join('\n');
}

export function monthEnergySummary(birthDate: string, year: number, month: number) {
  const days = generateMonthData(birthDate, year, month);
  const personalMonth = calculatePersonalMonth(birthDate, year, month);
  const energy = getEnergyInfo(personalMonth);
  const fav = days.filter((d) => d.isFavorable).length;
  const hard = days.filter((d) => d.isUnfavorable).length;
  return { personalMonth, planet: energy.planet, fav, hard, total: days.length };
}
