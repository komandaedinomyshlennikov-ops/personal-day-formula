/**
 * Activation codes are stored as SHA-256 hashes only.
 * Plaintext codes never ship in the client bundle.
 */

export type ActivationPlan = 'month' | 'year' | 'lifetime' | 'test';

export interface ActivationResult {
  plan: ActivationPlan;
  days: number;
}

/** SHA-256 hex of valid codes (MONTH-*, YEAR-*, LIFE-*; TEST only in dev). */
const PROD_CODE_HASHES: Record<string, ActivationResult> = {
  // MONTH-4915
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

const DEV_CODE_HASHES: Record<string, ActivationResult> = {
  // TEST-1234 — only available outside production builds
  '3352ceb2586cac573f9a9e0c5529b87ff65b6dc87b79d0c251c2ac025eaa5d91': {
    plan: 'test',
    days: 30,
  },
};

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function resolveActivationCode(code: string): Promise<ActivationResult | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const hash = await sha256Hex(normalized);
  const map = {
    ...PROD_CODE_HASHES,
    ...(import.meta.env.PROD ? {} : DEV_CODE_HASHES),
  };

  return map[hash] ?? null;
}
