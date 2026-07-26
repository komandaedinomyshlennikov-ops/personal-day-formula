/**
 * Home-screen product metrics.
 * - Always aggregates locally (works without GA / consent)
 * - Forwards to GA via trackEvent when consent + gtag available
 */
import { trackEvent } from '@/lib/analytics';

const KEY = 'astronavigator_home_metrics_v1';

export type HomeMetricName =
  | 'home_view'
  | 'home_tab_change'
  | 'home_upgrade_bar_click'
  | 'home_month_lock_open'
  | 'home_calendar_scroll'
  | 'home_coach_chip'
  | 'home_share_day'
  | 'home_pro_tools_toggle'
  | 'home_first_hint_dismiss'
  | 'home_today_open';

export interface HomeMetricsSnapshot {
  counts: Record<string, number>;
  lastAt: Record<string, string>;
  updatedAt: string;
}

/** In-memory fallback (tests / private mode) */
let memory: HomeMetricsSnapshot = {
  counts: {},
  lastAt: {},
  updatedAt: new Date().toISOString(),
};

function empty(): HomeMetricsSnapshot {
  return { counts: {}, lastAt: {}, updatedAt: new Date().toISOString() };
}

function readStorage(): HomeMetricsSnapshot | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomeMetricsSnapshot;
    return {
      counts: { ...(parsed.counts || {}) },
      lastAt: { ...(parsed.lastAt || {}) },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeStorage(snap: HomeMetricsSnapshot): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export function getHomeMetrics(): HomeMetricsSnapshot {
  const fromLs = readStorage();
  if (fromLs) {
    memory = fromLs;
    return {
      counts: { ...fromLs.counts },
      lastAt: { ...fromLs.lastAt },
      updatedAt: fromLs.updatedAt,
    };
  }
  return {
    counts: { ...memory.counts },
    lastAt: { ...memory.lastAt },
    updatedAt: memory.updatedAt,
  };
}

/** Record a home metric (local + optional GA). */
export function recordHomeMetric(
  name: HomeMetricName,
  params?: Record<string, string | number | boolean>
): void {
  const snap = getHomeMetrics();
  snap.counts[name] = (snap.counts[name] || 0) + 1;
  const now = new Date().toISOString();
  snap.lastAt[name] = now;
  snap.updatedAt = now;
  memory = {
    counts: { ...snap.counts },
    lastAt: { ...snap.lastAt },
    updatedAt: snap.updatedAt,
  };
  writeStorage(memory);

  try {
    trackEvent(name, params);
  } catch {
    /* analytics must never break product */
  }
}

export function resetHomeMetrics(): void {
  memory = empty();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(KEY);
    }
  } catch {
    /* ignore */
  }
}
