import { describe, expect, it } from 'vitest';
import { isAdminBirthDate, isAdminUser } from './admin';
import { getAccessTier, canUseFeature, hasYearPerks, isPaidTier } from './access';

describe('admin unlock (Андрей 07.03.1991)', () => {
  it('recognizes 1991-03-07', () => {
    expect(isAdminBirthDate('1991-03-07')).toBe(true);
    expect(isAdminBirthDate('1991-03-07 ')).toBe(true);
    expect(isAdminUser({ birthDate: '1991-03-07' })).toBe(true);
  });

  it('rejects other dates', () => {
    expect(isAdminBirthDate('1990-03-07')).toBe(false);
    expect(isAdminBirthDate('1991-03-08')).toBe(false);
    expect(isAdminBirthDate(null)).toBe(false);
    expect(isAdminBirthDate('')).toBe(false);
  });

  it('grants lifetime tier without subscription', () => {
    const tier = getAccessTier({
      birthDate: '1991-03-07',
      subscriptionEndDate: null,
      isTrialActive: false,
      activatedPlan: undefined,
    });
    expect(tier).toBe('lifetime');
    expect(isPaidTier(tier)).toBe(true);
    expect(hasYearPerks(tier)).toBe(true);
    expect(canUseFeature('monthYearDeep', tier)).toBe(true);
    expect(canUseFeature('export', tier)).toBe(true);
    expect(canUseFeature('notesTips', tier)).toBe(true);
    expect(canUseFeature('coachUnlimited', tier)).toBe(true);
    expect(canUseFeature('yearCompass', tier)).toBe(true);
    expect(canUseFeature('bestWindows', tier)).toBe(true);
    expect(canUseFeature('weeklyDigest', tier)).toBe(true);
    expect(canUseFeature('customReminders', tier)).toBe(true);
  });

  it('admin wins over expired trial', () => {
    const tier = getAccessTier({
      birthDate: '1991-03-07',
      subscriptionEndDate: new Date(Date.now() - 86400000).toISOString(),
      isTrialActive: true,
      activatedPlan: 'trial',
    });
    expect(tier).toBe('lifetime');
  });
});
