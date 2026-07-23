import { describe, expect, it } from 'vitest';
import { buildDayInfo, dayToPath } from './dayInfo';

describe('buildDayInfo', () => {
  it('builds a day for deep links', () => {
    const day = buildDayInfo('1990-05-15', '2026-07-23');
    expect(day).not.toBeNull();
    expect(day!.date.getFullYear()).toBe(2026);
    expect(day!.date.getMonth()).toBe(6);
    expect(day!.date.getDate()).toBe(23);
    expect(day!.personalNumber).toBeGreaterThanOrEqual(1);
    expect(day!.personalNumber).toBeLessThanOrEqual(9);
  });

  it('rejects invalid dates', () => {
    expect(buildDayInfo('1990-05-15', '2026-13-01')).toBeNull();
  });
});

describe('dayToPath', () => {
  it('formats local date path', () => {
    const d = new Date(2026, 6, 23);
    expect(dayToPath(d)).toBe('/day/2026-07-23');
  });
});
