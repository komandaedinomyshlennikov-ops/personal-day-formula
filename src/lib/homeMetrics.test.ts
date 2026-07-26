import { beforeEach, describe, expect, it } from 'vitest';
import { getHomeMetrics, recordHomeMetric, resetHomeMetrics } from './homeMetrics';

describe('homeMetrics', () => {
  beforeEach(() => {
    resetHomeMetrics();
  });

  it('increments counts locally', () => {
    recordHomeMetric('home_view');
    recordHomeMetric('home_view');
    recordHomeMetric('home_tab_change', { tab: 'week' });
    const snap = getHomeMetrics();
    expect(snap.counts.home_view).toBe(2);
    expect(snap.counts.home_tab_change).toBe(1);
    expect(snap.lastAt.home_view).toBeTruthy();
  });

  it('reset clears storage', () => {
    recordHomeMetric('home_coach_chip');
    resetHomeMetrics();
    expect(getHomeMetrics().counts.home_coach_chip || 0).toBe(0);
  });
});
