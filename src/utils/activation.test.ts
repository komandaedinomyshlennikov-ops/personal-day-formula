import { describe, expect, it } from 'vitest';
import { resolveActivationCode } from './activation';

describe('resolveActivationCode', () => {
  it('accepts known production codes by hash', async () => {
    const month = await resolveActivationCode('MONTH-4915');
    expect(month).toEqual({ plan: 'month', days: 30 });

    const year = await resolveActivationCode('  year-4915  ');
    expect(year).toEqual({ plan: 'year', days: 365 });

    const life = await resolveActivationCode('life-4915');
    expect(life).toEqual({ plan: 'lifetime', days: 99999 });
  });

  it('rejects unknown codes', async () => {
    expect(await resolveActivationCode('FAKE-0000')).toBeNull();
    expect(await resolveActivationCode('')).toBeNull();
  });

  it('accepts TEST code only outside production', async () => {
    const result = await resolveActivationCode('TEST-1234');
    // vitest runs with import.meta.env.PROD === false
    expect(result).toEqual({ plan: 'test', days: 30 });
  });
});
