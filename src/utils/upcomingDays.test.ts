import { describe, expect, it } from 'vitest';
import { getDaysLeft, getUpcomingDays } from './upcomingDays';

describe('getUpcomingDays', () => {
  it('returns next 3 days after from date', () => {
    const from = new Date(2026, 6, 23); // Jul 23 local
    const days = getUpcomingDays('1990-05-15', 3, from);
    expect(days).toHaveLength(3);
    expect(days[0].date.getDate()).toBe(24);
    expect(days[1].date.getDate()).toBe(25);
    expect(days[2].date.getDate()).toBe(26);
    expect(days[0].personalNumber).toBeGreaterThanOrEqual(1);
    expect(days[0].personalNumber).toBeLessThanOrEqual(9);
  });
});

describe('getDaysLeft', () => {
  it('returns 0 for past dates', () => {
    expect(getDaysLeft('2020-01-01T00:00:00.000Z')).toBe(0);
  });

  it('returns at least 1 for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    expect(getDaysLeft(tomorrow.toISOString())).toBeGreaterThanOrEqual(1);
  });
});
