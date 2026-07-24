import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { buildCoachOpening, generateCoachReply } from './coachEngine';
import type { CoachContext } from './coachEngine';

const t = ((key: string, opts?: { defaultValue?: string }) => {
  if (key.startsWith('energies.') && key.endsWith('.positive')) {
    return ['Start carefully', 'Talk calmly'];
  }
  if (key.startsWith('energies.') && key.endsWith('.negative')) {
    return ['Rush decisions'];
  }
  if (key.startsWith('energies.') && key.endsWith('.name')) return 'Sun';
  if (key.startsWith('energies.') && key.endsWith('.description')) return 'A calm day';
  if (key.includes('storyBody')) return 'Soft day body';
  if (key.includes('storyTitle')) return 'Day title';
  if (key.includes('favorable') || key.includes('completion') || key.includes('neutral')) {
    return 'tone';
  }
  return opts?.defaultValue ?? key;
}) as unknown as TFunction;

const baseCtx: CoachContext = {
  displayName: 'Andrey',
  personalNumber: 7,
  dateKey: '2026-07-24',
  profile: { goal: 'open a small business' },
  checkIns: [],
  recentMessages: [],
  lang: 'en',
};

describe('coachEngine trust voice', () => {
  it('opening does not claim AI knows destiny', () => {
    const text = buildCoachOpening(baseCtx, t);
    expect(text.toLowerCase()).not.toMatch(/knows you better|destiny|predicted/);
    expect(text).toMatch(/Andrey|day/i);
    expect(text.length).toBeGreaterThan(40);
  });

  it('reply stays interpretive for work focus', () => {
    const text = generateCoachReply('Today work is the priority', baseCtx, t);
    expect(text.toLowerCase()).not.toMatch(/you must|forbidden|cannot sign/);
    expect(text.length).toBeGreaterThan(30);
  });
});
