/**
 * Claim a signed unlock token from the Telegram pay bot Worker.
 * Tokens look like: v1.<bodyB64>.<hmac>
 * Secret never ships in the client — only the Worker verifies.
 */

export type ClaimPlan = 'month' | 'year' | 'lifetime';

export interface ClaimResult {
  plan: ClaimPlan;
  days: number;
}

function payApiBase(): string {
  return (import.meta.env.VITE_PAY_API_URL || '').replace(/\/$/, '');
}

export function isPayApiConfigured(): boolean {
  return Boolean(payApiBase());
}

export function isSignedUnlockToken(token: string): boolean {
  return token.trim().startsWith('v1.');
}

/**
 * POST /claim — one-time activation payload for signed tokens.
 * Returns null on network/HTTP/validation failure.
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
    };

    if (!data.ok) return null;
    if (data.plan !== 'month' && data.plan !== 'year' && data.plan !== 'lifetime') {
      return null;
    }
    const days = Number(data.days);
    if (!Number.isFinite(days) || days <= 0) return null;

    return { plan: data.plan, days };
  } catch (e) {
    console.error('[pay] claim failed', e);
    return null;
  }
}
