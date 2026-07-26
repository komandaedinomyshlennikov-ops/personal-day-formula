/**
 * Claim / verify signed tokens from the Telegram pay bot Worker.
 * Secret never ships in the client — only the Worker verifies HMAC.
 */

export type ClaimPlan = 'month' | 'year' | 'lifetime';

export interface ClaimResult {
  plan: ClaimPlan;
  days: number;
  /** Long-lived signed entitlement for session revalidation */
  entitlement?: string;
}

export interface VerifyResult {
  plan: ClaimPlan;
  days: number;
  exp: number;
}

function payApiBase(): string {
  return (import.meta.env.VITE_PAY_API_URL || '').replace(/\/$/, '');
}

export function isPayApiConfigured(): boolean {
  return Boolean(payApiBase());
}

export function isSignedUnlockToken(token: string): boolean {
  const t = token.trim();
  return t.startsWith('v1.') || t.startsWith('ent.v1.');
}

/**
 * POST /claim — one-time claim of payment unlock token.
 */
export async function claimUnlockToken(token: string): Promise<ClaimResult | null> {
  const base = payApiBase();
  if (!base) {
    console.warn('[pay] VITE_PAY_API_URL is not set — cannot claim signed token');
    return null;
  }

  try {
    const res = await fetch(`${base}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      ok?: boolean;
      plan?: string;
      days?: number;
      entitlement?: string;
    };

    if (!data.ok) return null;
    if (data.plan !== 'month' && data.plan !== 'year' && data.plan !== 'lifetime') {
      return null;
    }
    const days = Number(data.days);
    if (!Number.isFinite(days) || days <= 0) return null;

    return {
      plan: data.plan,
      days,
      entitlement: typeof data.entitlement === 'string' ? data.entitlement : undefined,
    };
  } catch (e) {
    console.error('[pay] claim failed', e);
    return null;
  }
}

/**
 * POST /verify — revalidate stored entitlement (server-side HMAC).
 */
export async function verifyEntitlementToken(
  entitlement: string
): Promise<VerifyResult | null> {
  const base = payApiBase();
  if (!base || !entitlement.trim()) return null;

  try {
    const res = await fetch(`${base}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entitlement: entitlement.trim() }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      plan?: string;
      days?: number;
      exp?: number;
    };
    if (!data.ok) return null;
    if (data.plan !== 'month' && data.plan !== 'year' && data.plan !== 'lifetime') {
      return null;
    }
    const days = Number(data.days);
    const exp = Number(data.exp);
    if (!Number.isFinite(days) || days <= 0) return null;
    if (!Number.isFinite(exp)) return null;
    return { plan: data.plan, days, exp };
  } catch (e) {
    console.error('[pay] verify failed', e);
    return null;
  }
}
