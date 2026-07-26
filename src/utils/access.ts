import type { UserData } from '@/types';
import { isAdminBirthDate } from '@/utils/admin';

/** Product access tier for freemium gating */
export type AccessTier = 'none' | 'trial' | 'month' | 'year' | 'lifetime';

export type PremiumFeature =
  | 'calendar'
  | 'today'
  | 'dayDetail'
  | 'upcoming'
  | 'monthYearDeep'
  | 'export'
  | 'notesTips'
  | 'coach'
  | 'coachUnlimited'
  | 'yearCompass'
  | 'bestWindows'
  | 'weeklyDigest'
  | 'customReminders';

const FEATURE_MATRIX: Record<PremiumFeature, AccessTier[]> = {
  // Core value during trial — so user feels real benefit
  calendar: ['trial', 'month', 'year', 'lifetime'],
  today: ['trial', 'month', 'year', 'lifetime'],
  dayDetail: ['trial', 'month', 'year', 'lifetime'],
  upcoming: ['trial', 'month', 'year', 'lifetime'],
  // Coach: free tier of interpretive helper (quota enforced separately)
  coach: ['trial', 'month', 'year', 'lifetime'],
  // Paid — deeper monetization layers
  monthYearDeep: ['month', 'year', 'lifetime'],
  export: ['month', 'year', 'lifetime'],
  notesTips: ['month', 'year', 'lifetime'],
  coachUnlimited: ['month', 'year', 'lifetime'],
  // Year+ exclusives (2026-style real utility)
  yearCompass: ['year', 'lifetime'],
  bestWindows: ['year', 'lifetime'],
  weeklyDigest: ['year', 'lifetime'],
  customReminders: ['year', 'lifetime'],
};

export function getAccessTier(
  user: Pick<UserData, 'subscriptionEndDate' | 'isTrialActive' | 'activatedPlan'> & {
    birthDate?: string | null;
  }
): AccessTier {
  // Admin / developer: full unlock (lifetime) by birth date
  if (isAdminBirthDate(user.birthDate)) return 'lifetime';

  if (!user.subscriptionEndDate) return 'none';
  const end = new Date(user.subscriptionEndDate);
  if (end <= new Date()) return 'none';

  if (user.isTrialActive) return 'trial';

  const plan = (user.activatedPlan || '').toLowerCase();
  if (plan === 'lifetime' || plan === 'life') return 'lifetime';
  if (plan === 'year') return 'year';
  if (plan === 'month' || plan === 'test') return 'month';

  // Active sub without plan marker — treat as paid month
  return 'month';
}

export function isAccessActive(tier: AccessTier): boolean {
  return tier !== 'none';
}

export function isPaidTier(tier: AccessTier): boolean {
  return tier === 'month' || tier === 'year' || tier === 'lifetime';
}

export function hasYearPerks(tier: AccessTier): boolean {
  return tier === 'year' || tier === 'lifetime';
}

export function canUseFeature(feature: PremiumFeature, tier: AccessTier): boolean {
  return FEATURE_MATRIX[feature].includes(tier);
}

export function isTrialTier(tier: AccessTier): boolean {
  return tier === 'trial';
}
