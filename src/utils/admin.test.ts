import { describe, expect, it } from 'vitest';
import {
  ADMIN_SUBSCRIPTION_END,
  adminAccessFields,
  ensureAdminUserData,
  isAdminBirthDate,
  isAdminBirthDateCandidate,
  isAdminUnlockEnabled,
  isAdminUser,
} from './admin';
import { getAccessTier, canUseFeature, hasYearPerks, isPaidTier } from './access';
import type { UserData } from '@/types';

const baseUser: UserData = {
  birthDate: '',
  subscriptionEndDate: null,
  isTrialActive: false,
  theme: 'dark',
  highContrast: false,
  notificationsEnabled: false,
  language: 'ru',
};

describe('admin unlock (Андрей 07.03.1991)', () => {
  it('unlock gate is on by default (all builds unless kill-switch)', () => {
    expect(isAdminUnlockEnabled()).toBe(true);
  });

  it('recognizes 1991-03-07 (Андрей) as admin with full access', () => {
    expect(isAdminBirthDate('1991-03-07')).toBe(true);
    expect(isAdminBirthDate('1991-03-07 ')).toBe(true);
    expect(isAdminUser({ birthDate: '1991-03-07' })).toBe(true);
    expect(isAdminBirthDateCandidate('1991-03-07')).toBe(true);
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

  it('materializes lifetime fields for UI consistency', () => {
    const fields = adminAccessFields();
    expect(fields.activatedPlan).toBe('lifetime');
    expect(fields.isTrialActive).toBe(false);
    expect(fields.subscriptionEndDate).toBe(ADMIN_SUBSCRIPTION_END);

    const raw: UserData = {
      ...baseUser,
      birthDate: '1991-03-07',
      isTrialActive: true,
      activatedPlan: 'trial',
      subscriptionEndDate: new Date().toISOString(),
    };
    const fixed = ensureAdminUserData(raw);
    expect(fixed.activatedPlan).toBe('lifetime');
    expect(fixed.isTrialActive).toBe(false);
    expect(fixed.subscriptionEndDate).toBe(ADMIN_SUBSCRIPTION_END);
    // idempotent
    expect(ensureAdminUserData(fixed)).toBe(fixed);
  });

  it('does not materialize for non-admin', () => {
    const raw: UserData = { ...baseUser, birthDate: '1990-01-01' };
    expect(ensureAdminUserData(raw)).toBe(raw);
  });
});
