import { describe, expect, it } from 'vitest';
import { getDayActionLine } from './actionableDay';
import type { TFunction } from 'i18next';

const t = ((key: string, opts?: { defaultValue?: string }) => {
  const map: Record<string, string> = {
    'energies.1.name': 'Sun',
    'energies.1.description': 'Start projects',
    'energies.1.positive': 'Start new projects',
    'calendar.actionDo': 'Good today for',
    'calendar.actionCareful': 'Better today to',
    'calendar.actionNeutral': 'Focus today on',
    'calendar.actionFallback': 'Open tips',
  };
  // arrays via returnObjects
  if (key.endsWith('.positive') && opts && 'returnObjects' in (opts as object)) {
    return ['Start new projects', 'Sign deals'];
  }
  return map[key] ?? opts?.defaultValue ?? key;
}) as unknown as TFunction;

describe('getDayActionLine', () => {
  it('returns favorable tone for number 1', () => {
    const line = getDayActionLine(1, t);
    expect(line.tone).toBe('favorable');
    expect(line.action.length).toBeGreaterThan(5);
  });

  it('returns challenging tone for number 8', () => {
    const line = getDayActionLine(8, t);
    expect(line.tone).toBe('challenging');
  });
});
