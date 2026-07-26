/**
 * Legacy static activation codes.
 * SECURITY (audit P0.3): disabled in production builds.
 * Paid unlock must use signed v1 tokens via pay Worker /claim only.
 */

export type ActivationPlan = 'month' | 'year' | 'lifetime' | 'test';

export interface ActivationResult {
  plan: ActivationPlan;
  days: number;
}

/** Dev-only codes (never in production bundle map). */
const DEV_CODE_HASHES: Record<string, ActivationResult> = {
  // TEST-1234
  '3352ceb2586cac573f9a9e0c5529b87ff65b6dc87b79d0c251c2ac025eaa5d91': {
    plan: 'test',
    days: 30,
  },
  // MONTH-4915 — dev only (legacy)
  '79d036a3a1730635d8df710e6adbb7919bc06a3f39bd7fcb7c14b4d6c021528b': {
    plan: 'month',
    days: 30,
  },
  // YEAR-4915
  '6fb943866b24d23f1bab74f495d20590ae39685a1aa744f42b1daf48a178704d': {
    plan: 'year',
    days: 365,
  },
  // LIFE-4915
  '90eb251b41c9e39a6dbedcfebcb254a696c51fc90e4a88dcc9157e9c5c0b9c16': {
    plan: 'lifetime',
    days: 99999,
  },
};

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Resolve legacy static code. Returns null in production always.
 */
export async function resolveActivationCode(code: string): Promise<ActivationResult | null> {
  // P0.3: no static codes in public builds
  if (import.meta.env.PROD) return null;

  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const hash = await sha256Hex(normalized);
  return DEV_CODE_HASHES[hash] ?? null;
}

export function legacyActivationEnabled(): boolean {
  return !import.meta.env.PROD;
}
