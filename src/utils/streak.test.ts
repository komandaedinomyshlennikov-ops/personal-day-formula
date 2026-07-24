import { describe, expect, it, beforeEach } from 'vitest';
import { clearStreak, readStreak, recordAppOpen } from './streak';

// simple localStorage mock for node
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  // @ts-expect-error test env
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };
  clearStreak();
});

describe('recordAppOpen', () => {
  it('starts streak at 1 on first open', () => {
    const r = recordAppOpen(new Date(2026, 6, 23));
    expect(r.streak).toBe(1);
    expect(r.isNewDay).toBe(true);
    expect(r.totalDays).toBe(1);
  });

  it('does not increment same day', () => {
    recordAppOpen(new Date(2026, 6, 23, 9));
    const r = recordAppOpen(new Date(2026, 6, 23, 21));
    expect(r.streak).toBe(1);
    expect(r.isNewDay).toBe(false);
    expect(r.totalDays).toBe(1);
  });

  it('continues streak on consecutive days', () => {
    recordAppOpen(new Date(2026, 6, 23));
    const r = recordAppOpen(new Date(2026, 6, 24));
    expect(r.streak).toBe(2);
    expect(r.totalDays).toBe(2);
  });

  it('resets streak after a gap', () => {
    recordAppOpen(new Date(2026, 6, 23));
    recordAppOpen(new Date(2026, 6, 24));
    const r = recordAppOpen(new Date(2026, 6, 27));
    expect(r.streak).toBe(1);
    expect(r.totalDays).toBe(3);
  });

  it('readStreak returns stored state', () => {
    recordAppOpen(new Date(2026, 6, 23));
    expect(readStreak().streak).toBe(1);
  });
});
