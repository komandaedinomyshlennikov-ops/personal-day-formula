/**
 * Hardcoded admin / developer unlocks.
 * Identified by birth date only (local product, no server accounts).
 */
import { normalizeBirthDateString } from '@/utils/date';

/** 07.03.1991 — Андрей (админ / разработчик) */
export const ADMIN_BIRTH_DATES = ['1991-03-07'] as const;

export function isAdminBirthDate(birthDate: string | null | undefined): boolean {
  if (!birthDate) return false;
  const normalized = normalizeBirthDateString(birthDate);
  if (!normalized) return false;
  return (ADMIN_BIRTH_DATES as readonly string[]).includes(normalized);
}

/** Full product access: lifetime tier, all Pro + Year tools, unlimited coach. */
export function isAdminUser(
  user: { birthDate?: string | null } | null | undefined
): boolean {
  return isAdminBirthDate(user?.birthDate);
}
