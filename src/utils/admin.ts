/**
 * Admin / developer unlocks.
 *
 * Product: Андрей, birth date 07.03.1991 → full AccessTier `lifetime`
 * (Pro + Year + coach unlimited + export + home metrics) without payment.
 *
 * Kill-switch for a hard public launch (optional build flag):
 *   VITE_DISABLE_ADMIN_UNLOCK=true
 *
 * Optional private extras (session secret) still supported for extra devices.
 */
import { normalizeBirthDateString } from '@/utils/date';
import type { UserData } from '@/types';

/** 07.03.1991 — Андрей (admin / developer) */
export const ADMIN_BIRTH_DATES = ['1991-03-07'] as const;

/** Far-future end date when materializing admin access in localStorage */
export const ADMIN_SUBSCRIPTION_END = '2099-12-31T23:59:59.999Z';

const SESSION_KEY = 'astronavigator_admin_session_v1';

/**
 * Master gate. Default ON so Andrey gets full access on production Pages too.
 * Set VITE_DISABLE_ADMIN_UNLOCK=true only if you must remove the birth-date path.
 */
function adminUnlockEnabled(): boolean {
  if (import.meta.env.VITE_DISABLE_ADMIN_UNLOCK === 'true') return false;
  return true;
}

export function isAdminUnlockEnabled(): boolean {
  return adminUnlockEnabled();
}

export function isAdminBirthDate(birthDate: string | null | undefined): boolean {
  if (!adminUnlockEnabled()) return false;
  if (!birthDate) return false;
  const normalized = normalizeBirthDateString(birthDate);
  if (!normalized) return false;
  return (ADMIN_BIRTH_DATES as readonly string[]).includes(normalized);
}

export function isAdminUser(
  user: { birthDate?: string | null } | null | undefined
): boolean {
  return isAdminBirthDate(user?.birthDate);
}

/**
 * Optional session unlock for private builds with VITE_ADMIN_SESSION_SECRET.
 * Not required for Andrey birth-date path (always on unless kill-switch).
 */
export function tryUnlockAdminSession(passphrase: string): boolean {
  const secret = import.meta.env.VITE_ADMIN_SESSION_SECRET;
  if (!secret || !passphrase || passphrase !== secret) return false;
  try {
    window.localStorage.setItem(SESSION_KEY, secret);
    return true;
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** True if this birth date is on the admin list (ignores kill-switch — for UI only). */
export function isAdminBirthDateCandidate(birthDate: string | null | undefined): boolean {
  if (!birthDate) return false;
  const normalized = normalizeBirthDateString(birthDate);
  if (!normalized) return false;
  return (ADMIN_BIRTH_DATES as readonly string[]).includes(normalized);
}

/**
 * Fields to merge into UserData so UI matches lifetime access.
 * Admin bypasses paid entitlement checks via getAccessTier.
 */
export function adminAccessFields(): Pick<
  UserData,
  'isTrialActive' | 'activatedPlan' | 'subscriptionEndDate'
> {
  return {
    isTrialActive: false,
    activatedPlan: 'lifetime',
    subscriptionEndDate: ADMIN_SUBSCRIPTION_END,
  };
}

/**
 * If user is admin, ensure stored plan looks like lifetime (idempotent).
 */
export function ensureAdminUserData<T extends UserData>(user: T): T {
  if (!isAdminBirthDate(user.birthDate)) return user;
  const fields = adminAccessFields();
  if (
    user.activatedPlan === fields.activatedPlan &&
    user.isTrialActive === fields.isTrialActive &&
    user.subscriptionEndDate === fields.subscriptionEndDate
  ) {
    return user;
  }
  return { ...user, ...fields };
}
