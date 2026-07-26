/**
 * Admin / developer unlocks.
 * SECURITY (audit P0.2): never ship an unconditional birth-date backdoor in production.
 * Enabled only in DEV builds, or when VITE_ENABLE_ADMIN_UNLOCK=true is set at build time
 * (do not set that flag for public GitHub Pages).
 */
import { normalizeBirthDateString } from '@/utils/date';

/** 07.03.1991 — Андрей (admin/dev), only if unlock flag is on */
const ADMIN_BIRTH_DATES = ['1991-03-07'] as const;

function adminUnlockEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_ENABLE_ADMIN_UNLOCK === 'true';
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
