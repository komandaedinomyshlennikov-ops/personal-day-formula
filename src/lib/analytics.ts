/**
 * Privacy-first analytics: loads only after explicit cookie consent.
 * Supports Google Analytics 4 via VITE_GA_MEASUREMENT_ID (optional).
 */

export type ConsentStatus = 'unknown' | 'accepted' | 'declined';

const CONSENT_KEY = 'astronavigator_cookie_consent';
const CONSENT_VERSION = '1';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getConsent(): ConsentStatus {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return 'unknown';
    const parsed = JSON.parse(raw) as { status: ConsentStatus; v?: string };
    if (parsed.v !== CONSENT_VERSION) return 'unknown';
    return parsed.status === 'accepted' || parsed.status === 'declined'
      ? parsed.status
      : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function setConsent(status: 'accepted' | 'declined'): void {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ status, v: CONSENT_VERSION, at: new Date().toISOString() })
  );
  if (status === 'accepted') {
    initAnalytics();
  }
}

export function getGaId(): string | undefined {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  return id && id.startsWith('G-') ? id : undefined;
}

let loaded = false;

export function initAnalytics(): void {
  if (loaded || getConsent() !== 'accepted') return;
  const gaId = getGaId();
  if (!gaId || typeof document === 'undefined') return;

  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (getConsent() !== 'accepted' || !window.gtag) return;
  window.gtag('event', name, params);
}

export function trackPageView(path: string): void {
  if (getConsent() !== 'accepted' || !window.gtag) return;
  const gaId = getGaId();
  if (!gaId) return;
  window.gtag('config', gaId, { page_path: path });
}
