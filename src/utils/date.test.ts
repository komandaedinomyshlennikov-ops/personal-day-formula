import { describe, expect, it } from 'vitest';
import {
  formatDateOnly,
  fromLocalDate,
  isValidCalendarDate,
  parseDateOnly,
  requireDateOnly,
  toDateOnlyString,
  toLocalDate,
} from './date';

describe('parseDateOnly', () => {
  it('parses YYYY-MM-DD without timezone shift', () => {
    expect(parseDateOnly('1990-05-15')).toEqual({
      year: 1990,
      month: 5,
      day: 15,
    });
  });

  it('rejects invalid calendar dates', () => {
    expect(parseDateOnly('2024-02-30')).toBeNull();
    expect(parseDateOnly('2024-13-01')).toBeNull();
    expect(parseDateOnly('not-a-date')).toBeNull();
  });

  it('accepts leap day', () => {
    expect(parseDateOnly('2024-02-29')).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });
});

describe('local date round-trip', () => {
  it('preserves day across toLocalDate / fromLocalDate', () => {
    const parts = requireDateOnly('1985-12-31');
    const local = toLocalDate(parts);
    expect(fromLocalDate(local)).toEqual(parts);
    expect(toDateOnlyString(local)).toBe('1985-12-31');
    expect(formatDateOnly(parts)).toBe('1985-12-31');
  });

  it('isValidCalendarDate handles month lengths', () => {
    expect(isValidCalendarDate(2023, 2, 28)).toBe(true);
    expect(isValidCalendarDate(2023, 2, 29)).toBe(false);
  });
});
