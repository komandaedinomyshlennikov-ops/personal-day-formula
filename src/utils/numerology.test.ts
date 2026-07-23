import { describe, expect, it } from 'vitest';
import {
  calculateLifePathNumber,
  calculatePersonalDayFromNumbers,
  calculatePersonalMonth,
  calculatePersonalYear,
  calculateUniversalDayFromParts,
  generateMonthData,
  isChallengingDay,
  isFavorableDay,
  reduceToSingleDigit,
} from './numerology';

describe('reduceToSingleDigit', () => {
  it('keeps single digits', () => {
    for (let n = 1; n <= 9; n++) {
      expect(reduceToSingleDigit(n)).toBe(n);
    }
  });

  it('reduces multi-digit numbers', () => {
    expect(reduceToSingleDigit(10)).toBe(1);
    expect(reduceToSingleDigit(19)).toBe(1);
    expect(reduceToSingleDigit(29)).toBe(2);
    // 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
    expect(reduceToSingleDigit(1990)).toBe(1);
  });
});

describe('personal year / month / day (timezone-safe birth strings)', () => {
  // birth 15 May 1990
  // personal year 2026 = reduce(15+5+2026) = reduce(2046) = 12 → 3
  const birth = '1990-05-15';

  it('calculatePersonalYear is stable for YYYY-MM-DD', () => {
    expect(calculatePersonalYear(birth, 2026)).toBe(3);
  });

  it('calculatePersonalMonth = personalYear + month', () => {
    // 3 + 7 = 10 → 1
    expect(calculatePersonalMonth(birth, 2026, 7)).toBe(1);
  });

  it('calculatePersonalDay = personalMonth + day', () => {
    // 1 + 23 = 24 → 6
    expect(calculatePersonalDayFromNumbers(birth, 2026, 7, 23)).toBe(6);
  });

  it('life path uses day+month+year of birth', () => {
    // 15+5+1990 = 2010 → 3
    expect(calculateLifePathNumber(birth)).toBe(3);
  });

  it('does not shift day for western-looking ISO dates', () => {
    // Classic bug: new Date('1990-05-15').getDate() === 14 in US timezones
    // Our parser must still use day 15
    const year = calculatePersonalYear('2000-01-01', 2024);
    expect(year).toBe(reduceToSingleDigit(1 + 1 + 2024)); // 2026 → 10 → 1
  });
});

describe('universal day', () => {
  it('sums calendar parts', () => {
    // 23 + 7 + 2026 = 2056 → 13 → 4
    expect(calculateUniversalDayFromParts(2026, 7, 23)).toBe(4);
  });
});

describe('generateMonthData', () => {
  it('returns correct day count and stable personal numbers', () => {
    const data = generateMonthData('1990-05-15', 2026, 2);
    expect(data).toHaveLength(28);
    // day 1 of Feb 2026: personal month = py(3)+2=5; day=1 → 6
    expect(data[0].personalNumber).toBe(6);
    expect(data[0].date.getDate()).toBe(1);
    expect(data[0].date.getMonth()).toBe(1); // February
  });

  it('marks favorability consistently', () => {
    const data = generateMonthData('1990-05-15', 2026, 7);
    for (const day of data) {
      if (day.isFavorable) expect(isFavorableDay(day.personalNumber)).toBe(true);
      if (day.isUnfavorable) expect(isChallengingDay(day.personalNumber)).toBe(true);
    }
  });
});
