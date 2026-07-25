import { describe, expect, it } from 'vitest';
import {
  getBestWindows,
  getMonthBalance,
  getMonthTopDays,
  getWeeklyDigest,
  countWeekTones,
  getYearFocusAreas,
  formatWeeklyDigestText,
} from './premiumInsights';

const BIRTH = '1990-05-15';

describe('premiumInsights', () => {
  it('getBestWindows always returns up to top days with tips', () => {
    const windows = getBestWindows(BIRTH, 30, 5);
    expect(windows.length).toBeGreaterThan(0);
    expect(windows.length).toBeLessThanOrEqual(5);
    for (const w of windows) {
      expect(w.tip.length).toBeGreaterThan(3);
      expect(w.day.personalNumber).toBeGreaterThanOrEqual(1);
      expect(w.day.personalNumber).toBeLessThanOrEqual(9);
    }
  });

  it('getMonthBalance counts days', () => {
    const now = new Date();
    const bal = getMonthBalance(BIRTH, now.getFullYear(), now.getMonth() + 1);
    expect(bal.total).toBeGreaterThanOrEqual(28);
    expect(bal.favorable + bal.neutral + bal.challenging).toBe(bal.total);
    expect(bal.personalMonth).toBeGreaterThanOrEqual(1);
    expect(bal.personalMonth).toBeLessThanOrEqual(9);
  });

  it('getMonthTopDays returns remaining days only', () => {
    const now = new Date();
    const top = getMonthTopDays(BIRTH, now.getFullYear(), now.getMonth() + 1, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const w of top) {
      const d = new Date(w.day.date);
      d.setHours(0, 0, 0, 0);
      expect(d.getTime()).toBeGreaterThanOrEqual(today.getTime());
    }
  });

  it('weekly digest has 7 days and tone counts', () => {
    const digest = getWeeklyDigest(BIRTH);
    expect(digest).toHaveLength(7);
    const tones = countWeekTones(digest);
    expect(tones.favorable + tones.neutral + tones.challenging).toBe(7);
  });

  it('year focus areas depend on personal year', () => {
    const f1 = getYearFocusAreas(1);
    const f8 = getYearFocusAreas(8);
    expect(f1[0].key).toBe('career');
    expect(f8[0].key).toBe('resource');
  });

  it('formatWeeklyDigestText is non-empty', () => {
    const text = formatWeeklyDigestText(BIRTH, 'ru-RU');
    expect(text.includes('Неделя')).toBe(true);
    expect(text.split('\n').length).toBeGreaterThan(5);
  });
});
