// Рекомендации для личного месяца и личного года
// Контент основан на энергиях планетарных управителей

import type { TFunction } from 'i18next';

export interface SignificantDate {
  date: string;
  title: string;
  description: string;
  impact: 'positive' | 'neutral' | 'challenging';
}

export interface MonthYearRecommendation {
  number: number;
  planet: string;
  title: string;
  description: string;
  focus: string[];
  opportunities: string[];
  challenges: string[];
  astroEvents: string[];
  significantDates?: SignificantDate[];
}

// Translation keys for month recommendations
const monthTranslationKeys: Record<number, {
  title: string;
  description: string;
  focus: string[];
  opportunities: string[];
  challenges: string[];
  astroEvents: string[];
  significantDates: { date: string; title: string; description: string; impact: 'positive' | 'neutral' | 'challenging' }[];
}> = {
  1: {
    title: 'monthYear.month1.title',
    description: 'monthYear.month1.description',
    focus: [
      'monthYear.month1.focus1',
      'monthYear.month1.focus2',
      'monthYear.month1.focus3',
      'monthYear.month1.focus4'
    ],
    opportunities: [
      'monthYear.month1.opportunity1',
      'monthYear.month1.opportunity2',
      'monthYear.month1.opportunity3',
      'monthYear.month1.opportunity4'
    ],
    challenges: [
      'monthYear.month1.challenge1',
      'monthYear.month1.challenge2',
      'monthYear.month1.challenge3'
    ],
    astroEvents: [
      'monthYear.month1.astroEvent1',
      'monthYear.month1.astroEvent2',
      'monthYear.month1.astroEvent3'
    ],
    significantDates: [
      { date: 'monthYear.month1.date1.date', title: 'monthYear.month1.date1.title', description: 'monthYear.month1.date1.description', impact: 'positive' },
      { date: 'monthYear.month1.date2.date', title: 'monthYear.month1.date2.title', description: 'monthYear.month1.date2.description', impact: 'challenging' },
      { date: 'monthYear.month1.date3.date', title: 'monthYear.month1.date3.title', description: 'monthYear.month1.date3.description', impact: 'positive' },
      { date: 'monthYear.month1.date4.date', title: 'monthYear.month1.date4.title', description: 'monthYear.month1.date4.description', impact: 'positive' },
      { date: 'monthYear.month1.date5.date', title: 'monthYear.month1.date5.title', description: 'monthYear.month1.date5.description', impact: 'neutral' },
      { date: 'monthYear.month1.date6.date', title: 'monthYear.month1.date6.title', description: 'monthYear.month1.date6.description', impact: 'neutral' }
    ]
  },
  2: {
    title: 'monthYear.month2.title',
    description: 'monthYear.month2.description',
    focus: [
      'monthYear.month2.focus1',
      'monthYear.month2.focus2',
      'monthYear.month2.focus3',
      'monthYear.month2.focus4'
    ],
    opportunities: [
      'monthYear.month2.opportunity1',
      'monthYear.month2.opportunity2',
      'monthYear.month2.opportunity3',
      'monthYear.month2.opportunity4'
    ],
    challenges: [
      'monthYear.month2.challenge1',
      'monthYear.month2.challenge2',
      'monthYear.month2.challenge3'
    ],
    astroEvents: [
      'monthYear.month2.astroEvent1',
      'monthYear.month2.astroEvent2',
      'monthYear.month2.astroEvent3'
    ],
    significantDates: [
      { date: 'monthYear.month2.date1.date', title: 'monthYear.month2.date1.title', description: 'monthYear.month2.date1.description', impact: 'positive' },
      { date: 'monthYear.month2.date2.date', title: 'monthYear.month2.date2.title', description: 'monthYear.month2.date2.description', impact: 'positive' },
      { date: 'monthYear.month2.date3.date', title: 'monthYear.month2.date3.title', description: 'monthYear.month2.date3.description', impact: 'neutral' },
      { date: 'monthYear.month2.date4.date', title: 'monthYear.month2.date4.title', description: 'monthYear.month2.date4.description', impact: 'positive' },
      { date: 'monthYear.month2.date5.date', title: 'monthYear.month2.date5.title', description: 'monthYear.month2.date5.description', impact: 'positive' }
    ]
  },
  3: {
    title: 'monthYear.month3.title',
    description: 'monthYear.month3.description',
    focus: [
      'monthYear.month3.focus1',
      'monthYear.month3.focus2',
      'monthYear.month3.focus3',
      'monthYear.month3.focus4'
    ],
    opportunities: [
      'monthYear.month3.opportunity1',
      'monthYear.month3.opportunity2',
      'monthYear.month3.opportunity3',
      'monthYear.month3.opportunity4'
    ],
    challenges: [
      'monthYear.month3.challenge1',
      'monthYear.month3.challenge2',
      'monthYear.month3.challenge3'
    ],
    astroEvents: [
      'monthYear.month3.astroEvent1',
      'monthYear.month3.astroEvent2',
      'monthYear.month3.astroEvent3'
    ],
    significantDates: []
  },
  4: {
    title: 'monthYear.month4.title',
    description: 'monthYear.month4.description',
    focus: [
      'monthYear.month4.focus1',
      'monthYear.month4.focus2',
      'monthYear.month4.focus3',
      'monthYear.month4.focus4'
    ],
    opportunities: [
      'monthYear.month4.opportunity1',
      'monthYear.month4.opportunity2',
      'monthYear.month4.opportunity3',
      'monthYear.month4.opportunity4'
    ],
    challenges: [
      'monthYear.month4.challenge1',
      'monthYear.month4.challenge2',
      'monthYear.month4.challenge3'
    ],
    astroEvents: [
      'monthYear.month4.astroEvent1',
      'monthYear.month4.astroEvent2',
      'monthYear.month4.astroEvent3'
    ],
    significantDates: []
  },
  5: {
    title: 'monthYear.month5.title',
    description: 'monthYear.month5.description',
    focus: [
      'monthYear.month5.focus1',
      'monthYear.month5.focus2',
      'monthYear.month5.focus3',
      'monthYear.month5.focus4'
    ],
    opportunities: [
      'monthYear.month5.opportunity1',
      'monthYear.month5.opportunity2',
      'monthYear.month5.opportunity3',
      'monthYear.month5.opportunity4'
    ],
    challenges: [
      'monthYear.month5.challenge1',
      'monthYear.month5.challenge2',
      'monthYear.month5.challenge3'
    ],
    astroEvents: [
      'monthYear.month5.astroEvent1',
      'monthYear.month5.astroEvent2',
      'monthYear.month5.astroEvent3'
    ],
    significantDates: []
  },
  6: {
    title: 'monthYear.month6.title',
    description: 'monthYear.month6.description',
    focus: [
      'monthYear.month6.focus1',
      'monthYear.month6.focus2',
      'monthYear.month6.focus3',
      'monthYear.month6.focus4'
    ],
    opportunities: [
      'monthYear.month6.opportunity1',
      'monthYear.month6.opportunity2',
      'monthYear.month6.opportunity3',
      'monthYear.month6.opportunity4'
    ],
    challenges: [
      'monthYear.month6.challenge1',
      'monthYear.month6.challenge2',
      'monthYear.month6.challenge3'
    ],
    astroEvents: [
      'monthYear.month6.astroEvent1',
      'monthYear.month6.astroEvent2',
      'monthYear.month6.astroEvent3'
    ],
    significantDates: []
  },
  7: {
    title: 'monthYear.month7.title',
    description: 'monthYear.month7.description',
    focus: [
      'monthYear.month7.focus1',
      'monthYear.month7.focus2',
      'monthYear.month7.focus3',
      'monthYear.month7.focus4'
    ],
    opportunities: [
      'monthYear.month7.opportunity1',
      'monthYear.month7.opportunity2',
      'monthYear.month7.opportunity3',
      'monthYear.month7.opportunity4'
    ],
    challenges: [
      'monthYear.month7.challenge1',
      'monthYear.month7.challenge2',
      'monthYear.month7.challenge3'
    ],
    astroEvents: [
      'monthYear.month7.astroEvent1',
      'monthYear.month7.astroEvent2',
      'monthYear.month7.astroEvent3'
    ],
    significantDates: []
  },
  8: {
    title: 'monthYear.month8.title',
    description: 'monthYear.month8.description',
    focus: [
      'monthYear.month8.focus1',
      'monthYear.month8.focus2',
      'monthYear.month8.focus3',
      'monthYear.month8.focus4'
    ],
    opportunities: [
      'monthYear.month8.opportunity1',
      'monthYear.month8.opportunity2',
      'monthYear.month8.opportunity3',
      'monthYear.month8.opportunity4'
    ],
    challenges: [
      'monthYear.month8.challenge1',
      'monthYear.month8.challenge2',
      'monthYear.month8.challenge3'
    ],
    astroEvents: [
      'monthYear.month8.astroEvent1',
      'monthYear.month8.astroEvent2',
      'monthYear.month8.astroEvent3'
    ],
    significantDates: []
  },
  9: {
    title: 'monthYear.month9.title',
    description: 'monthYear.month9.description',
    focus: [
      'monthYear.month9.focus1',
      'monthYear.month9.focus2',
      'monthYear.month9.focus3',
      'monthYear.month9.focus4'
    ],
    opportunities: [
      'monthYear.month9.opportunity1',
      'monthYear.month9.opportunity2',
      'monthYear.month9.opportunity3',
      'monthYear.month9.opportunity4'
    ],
    challenges: [
      'monthYear.month9.challenge1',
      'monthYear.month9.challenge2',
      'monthYear.month9.challenge3'
    ],
    astroEvents: [
      'monthYear.month9.astroEvent1',
      'monthYear.month9.astroEvent2',
      'monthYear.month9.astroEvent3'
    ],
    significantDates: []
  }
};

// Translation keys for year recommendations
const yearTranslationKeys: Record<number, {
  title: string;
  description: string;
  focus: string[];
  opportunities: string[];
  challenges: string[];
  astroEvents: string[];
}> = {
  1: {
    title: 'monthYear.year1.title',
    description: 'monthYear.year1.description',
    focus: [
      'monthYear.year1.focus1',
      'monthYear.year1.focus2',
      'monthYear.year1.focus3',
      'monthYear.year1.focus4'
    ],
    opportunities: [
      'monthYear.year1.opportunity1',
      'monthYear.year1.opportunity2',
      'monthYear.year1.opportunity3',
      'monthYear.year1.opportunity4'
    ],
    challenges: [
      'monthYear.year1.challenge1',
      'monthYear.year1.challenge2',
      'monthYear.year1.challenge3'
    ],
    astroEvents: [
      'monthYear.year1.astroEvent1',
      'monthYear.year1.astroEvent2',
      'monthYear.year1.astroEvent3'
    ]
  },
  2: {
    title: 'monthYear.year2.title',
    description: 'monthYear.year2.description',
    focus: [
      'monthYear.year2.focus1',
      'monthYear.year2.focus2',
      'monthYear.year2.focus3',
      'monthYear.year2.focus4'
    ],
    opportunities: [
      'monthYear.year2.opportunity1',
      'monthYear.year2.opportunity2',
      'monthYear.year2.opportunity3',
      'monthYear.year2.opportunity4'
    ],
    challenges: [
      'monthYear.year2.challenge1',
      'monthYear.year2.challenge2',
      'monthYear.year2.challenge3'
    ],
    astroEvents: [
      'monthYear.year2.astroEvent1',
      'monthYear.year2.astroEvent2',
      'monthYear.year2.astroEvent3'
    ]
  },
  3: {
    title: 'monthYear.year3.title',
    description: 'monthYear.year3.description',
    focus: [
      'monthYear.year3.focus1',
      'monthYear.year3.focus2',
      'monthYear.year3.focus3',
      'monthYear.year3.focus4'
    ],
    opportunities: [
      'monthYear.year3.opportunity1',
      'monthYear.year3.opportunity2',
      'monthYear.year3.opportunity3',
      'monthYear.year3.opportunity4'
    ],
    challenges: [
      'monthYear.year3.challenge1',
      'monthYear.year3.challenge2',
      'monthYear.year3.challenge3'
    ],
    astroEvents: [
      'monthYear.year3.astroEvent1',
      'monthYear.year3.astroEvent2',
      'monthYear.year3.astroEvent3'
    ]
  },
  4: {
    title: 'monthYear.year4.title',
    description: 'monthYear.year4.description',
    focus: [
      'monthYear.year4.focus1',
      'monthYear.year4.focus2',
      'monthYear.year4.focus3',
      'monthYear.year4.focus4'
    ],
    opportunities: [
      'monthYear.year4.opportunity1',
      'monthYear.year4.opportunity2',
      'monthYear.year4.opportunity3',
      'monthYear.year4.opportunity4'
    ],
    challenges: [
      'monthYear.year4.challenge1',
      'monthYear.year4.challenge2',
      'monthYear.year4.challenge3'
    ],
    astroEvents: [
      'monthYear.year4.astroEvent1',
      'monthYear.year4.astroEvent2',
      'monthYear.year4.astroEvent3'
    ]
  },
  5: {
    title: 'monthYear.year5.title',
    description: 'monthYear.year5.description',
    focus: [
      'monthYear.year5.focus1',
      'monthYear.year5.focus2',
      'monthYear.year5.focus3',
      'monthYear.year5.focus4'
    ],
    opportunities: [
      'monthYear.year5.opportunity1',
      'monthYear.year5.opportunity2',
      'monthYear.year5.opportunity3',
      'monthYear.year5.opportunity4'
    ],
    challenges: [
      'monthYear.year5.challenge1',
      'monthYear.year5.challenge2',
      'monthYear.year5.challenge3'
    ],
    astroEvents: [
      'monthYear.year5.astroEvent1',
      'monthYear.year5.astroEvent2',
      'monthYear.year5.astroEvent3'
    ]
  },
  6: {
    title: 'monthYear.year6.title',
    description: 'monthYear.year6.description',
    focus: [
      'monthYear.year6.focus1',
      'monthYear.year6.focus2',
      'monthYear.year6.focus3',
      'monthYear.year6.focus4'
    ],
    opportunities: [
      'monthYear.year6.opportunity1',
      'monthYear.year6.opportunity2',
      'monthYear.year6.opportunity3',
      'monthYear.year6.opportunity4'
    ],
    challenges: [
      'monthYear.year6.challenge1',
      'monthYear.year6.challenge2',
      'monthYear.year6.challenge3'
    ],
    astroEvents: [
      'monthYear.year6.astroEvent1',
      'monthYear.year6.astroEvent2',
      'monthYear.year6.astroEvent3'
    ]
  },
  7: {
    title: 'monthYear.year7.title',
    description: 'monthYear.year7.description',
    focus: [
      'monthYear.year7.focus1',
      'monthYear.year7.focus2',
      'monthYear.year7.focus3',
      'monthYear.year7.focus4'
    ],
    opportunities: [
      'monthYear.year7.opportunity1',
      'monthYear.year7.opportunity2',
      'monthYear.year7.opportunity3',
      'monthYear.year7.opportunity4'
    ],
    challenges: [
      'monthYear.year7.challenge1',
      'monthYear.year7.challenge2',
      'monthYear.year7.challenge3'
    ],
    astroEvents: [
      'monthYear.year7.astroEvent1',
      'monthYear.year7.astroEvent2',
      'monthYear.year7.astroEvent3'
    ]
  },
  8: {
    title: 'monthYear.year8.title',
    description: 'monthYear.year8.description',
    focus: [
      'monthYear.year8.focus1',
      'monthYear.year8.focus2',
      'monthYear.year8.focus3',
      'monthYear.year8.focus4'
    ],
    opportunities: [
      'monthYear.year8.opportunity1',
      'monthYear.year8.opportunity2',
      'monthYear.year8.opportunity3',
      'monthYear.year8.opportunity4'
    ],
    challenges: [
      'monthYear.year8.challenge1',
      'monthYear.year8.challenge2',
      'monthYear.year8.challenge3'
    ],
    astroEvents: [
      'monthYear.year8.astroEvent1',
      'monthYear.year8.astroEvent2',
      'monthYear.year8.astroEvent3'
    ]
  },
  9: {
    title: 'monthYear.year9.title',
    description: 'monthYear.year9.description',
    focus: [
      'monthYear.year9.focus1',
      'monthYear.year9.focus2',
      'monthYear.year9.focus3',
      'monthYear.year9.focus4'
    ],
    opportunities: [
      'monthYear.year9.opportunity1',
      'monthYear.year9.opportunity2',
      'monthYear.year9.opportunity3',
      'monthYear.year9.opportunity4'
    ],
    challenges: [
      'monthYear.year9.challenge1',
      'monthYear.year9.challenge2',
      'monthYear.year9.challenge3'
    ],
    astroEvents: [
      'monthYear.year9.astroEvent1',
      'monthYear.year9.astroEvent2',
      'monthYear.year9.astroEvent3'
    ]
  }
};

// Функция для получения рекомендаций по номеру месяца с переводами
export function getMonthRecommendation(monthNumber: number, t?: TFunction): MonthYearRecommendation {
  const keys = monthTranslationKeys[monthNumber] || monthTranslationKeys[1];
  
  const translate = (key: string): string => {
    if (!t) return key;
    return t(key, key);
  };
  
  const translateArray = (keys: string[]): string[] => {
    if (!t) return keys;
    return keys.map(k => t(k, k));
  };

  return {
    number: monthNumber,
    planet: translate(`energies.${monthNumber}.name`),
    title: translate(keys.title),
    description: translate(keys.description),
    focus: translateArray(keys.focus),
    opportunities: translateArray(keys.opportunities),
    challenges: translateArray(keys.challenges),
    astroEvents: translateArray(keys.astroEvents),
    significantDates: keys.significantDates.map(d => ({
      date: translate(d.date),
      title: translate(d.title),
      description: translate(d.description),
      impact: d.impact
    }))
  };
}

// Функция для получения рекомендаций по номеру года с переводами
export function getYearRecommendation(yearNumber: number, t?: TFunction): MonthYearRecommendation {
  const keys = yearTranslationKeys[yearNumber] || yearTranslationKeys[1];
  
  const translate = (key: string): string => {
    if (!t) return key;
    return t(key, key);
  };
  
  const translateArray = (keys: string[]): string[] => {
    if (!t) return keys;
    return keys.map(k => t(k, k));
  };

  return {
    number: yearNumber,
    planet: translate(`energies.${yearNumber}.name`),
    title: translate(keys.title),
    description: translate(keys.description),
    focus: translateArray(keys.focus),
    opportunities: translateArray(keys.opportunities),
    challenges: translateArray(keys.challenges),
    astroEvents: translateArray(keys.astroEvents),
    significantDates: []
  };
}
