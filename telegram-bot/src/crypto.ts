/** HMAC-SHA256 helpers (Web Crypto) for unlock tokens */

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  );
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export type UnlockPlan = 'month' | 'year' | 'lifetime';

export interface UnlockPayload {
  plan: UnlockPlan;
  days: number;
  exp: number; // unix sec
  jti: string;
}

const DAYS: Record<UnlockPlan, number> = {
  month: 30,
  year: 365,
  lifetime: 99999,
};

export async function mintUnlockToken(
  secret: string,
  plan: UnlockPlan,
  ttlSec = 60 * 60 * 24 * 7
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const jti = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const days = DAYS[plan];
  const body = `${plan}.${days}.${exp}.${jti}`;
  const sig = await hmacHex(secret, body);
  return `v1.${b64urlEncode(body)}.${sig}`;
}

/**
 * Long-lived entitlement after successful claim (access window = plan days).
 * Prefix ent.v1 so it is not confused with one-time payment unlock links.
 */
export async function mintEntitlementToken(
  secret: string,
  plan: UnlockPlan
): Promise<string> {
  const days = DAYS[plan];
  const ttlSec =
    plan === 'lifetime'
      ? 60 * 60 * 24 * 365 * 50
      : Math.max(days, 1) * 24 * 60 * 60;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const jti = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const body = `${plan}.${days}.${exp}.${jti}`;
  const sig = await hmacHex(secret, body);
  return `ent.v1.${b64urlEncode(body)}.${sig}`;
}

export async function verifyEntitlementToken(
  secret: string,
  token: string
): Promise<UnlockPayload | null> {
  const parts = token.trim().split('.');
  if (parts.length !== 4 || parts[0] !== 'ent' || parts[1] !== 'v1') return null;
  const bodyB64 = parts[2];
  const sig = parts[3];
  let body: string;
  try {
    body = b64urlDecode(bodyB64);
  } catch {
    return null;
  }
  const expect = await hmacHex(secret, body);
  if (expect.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expect.length; i++) ok |= expect.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return null;

  const [plan, daysS, expS, jti] = body.split('.');
  if (plan !== 'month' && plan !== 'year' && plan !== 'lifetime') return null;
  const days = Number(daysS);
  const exp = Number(expS);
  if (!Number.isFinite(days) || !Number.isFinite(exp) || !jti) return null;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  return { plan, days, exp, jti };
}

export async function verifyUnlockToken(
  secret: string,
  token: string
): Promise<UnlockPayload | null> {
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const [, bodyB64, sig] = parts;
  let body: string;
  try {
    body = b64urlDecode(bodyB64);
  } catch {
    return null;
  }
  const expect = await hmacHex(secret, body);
  if (expect.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expect.length; i++) ok |= expect.charCodeAt(i) ^ sig.charCodeAt(i);
  if (ok !== 0) return null;

  const [plan, daysS, expS, jti] = body.split('.');
  if (plan !== 'month' && plan !== 'year' && plan !== 'lifetime') return null;
  const days = Number(daysS);
  const exp = Number(expS);
  if (!Number.isFinite(days) || !Number.isFinite(exp) || !jti) return null;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  return { plan, days, exp, jti };
}
