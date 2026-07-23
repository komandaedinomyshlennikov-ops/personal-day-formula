/**
 * Timezone-safe date helpers.
 * Never use `new Date('YYYY-MM-DD')` + getDate()/getMonth() — that shifts the day
 * west of UTC. Always parse calendar parts explicitly.
 */

export interface CalendarDate {
  year: number;
  month: number; // 1–12
  day: number; // 1–31
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD into calendar parts (no timezone). */
export function parseDateOnly(value: string): CalendarDate | null {
  const match = DATE_ONLY.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!isValidCalendarDate(year, month, day)) return null;
  return { year, month, day };
}

/** Require a valid YYYY-MM-DD string; throw if invalid. */
export function requireDateOnly(value: string): CalendarDate {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    throw new Error(`Invalid date string: ${value}`);
  }
  return parsed;
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/** Local midnight for a calendar date (for display / comparisons only). */
export function toLocalDate({ year, month, day }: CalendarDate): Date {
  return new Date(year, month - 1, day);
}

/** Format calendar parts as YYYY-MM-DD. */
export function formatDateOnly({ year, month, day }: CalendarDate): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Extract calendar parts from a Date using local timezone. */
export function fromLocalDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/** Convert Date → YYYY-MM-DD using local calendar (not UTC). */
export function toDateOnlyString(date: Date): string {
  return formatDateOnly(fromLocalDate(date));
}

/** Safe birth date string from user storage. */
export function normalizeBirthDateString(value: string): string | null {
  const parsed = parseDateOnly(value);
  return parsed ? formatDateOnly(parsed) : null;
}
