/**
 * Admin / developer unlocks.
 *
 * SECURITY (audit P0.2): never ship an unconditional birth-date backdoor in public production.
 * Unlock is enabled when any of:
 *  - `import.meta.env.DEV` (local `npm run dev` / vitest)
 *  - `VITE_ENABLE_ADMIN_UNLOCK=true` at build time (private deploy only — do not set on public Pages)
 *  - session flag after entering `VITE_ADMIN_SESSION_SECRET` (optional; also private builds only)
 *
 * Admin birth date(s) get AccessTier `lifetime` (Pro + Year + coach unlimited + metrics).
 */
import { normalizeBirthDateString } from '@/utils/date';
import type { UserData } from '@/types';

/** 07.03.1991 — Андрей (admin/dev) */
export const ADMIN_BIRTH_DATES = ['1991-03-07'] as const;

/** Far-future end date used when materializing admin access in localStorage */
export const ADMIN_SUBSCRIPTION_END = '2099-12-31T23:59:59.999Z';

const SESSION_KEY = 'astronavigator_admin_session_v1';

function adminUnlockEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_ENABLE_ADMIN_UNLOCK === 'true') return true;
  if (typeof window === 'undefined') return false;
  try {
    const secret = import.meta.env.VITE_ADMIN_SESSION_SECRET;
    if (!secret) return false;
    return window.localStorage.getItem(SESSION_KEY) === secret;
  } catch {
    return false;
  }
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
 * Try to unlock admin session for this browser (private builds with VITE_ADMIN_SESSION_SECRET).
 * Returns true only when secret matches and is non-empty.
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

/** True if this birth date is on the admin list (ignores unlock gate — for secret UI only). */
export function isAdminBirthDateCandidate(birthDate: string | null | undefined): boolean {
  if (!birthDate) return false;
  const normalized = normalizeBirthDateString(birthDate);
  if (!normalized) return false;
  return (ADMIN_BIRTH_DATES as readonly string[]).includes(normalized);
}

/**
 * Fields to merge into UserData so UI (days left, subscription screen) matches lifetime access.
 * Does not write entitlement (admin bypasses paid entitlement checks via getAccessTier).
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
 * Returns same object reference when no change needed.
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
