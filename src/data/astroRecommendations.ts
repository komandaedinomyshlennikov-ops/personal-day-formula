// Астрологические рекомендации для общего дня
// Контент основан на энергиях планетарных управителей

import type { TFunction } from 'i18next';

export interface AstroRecommendation {
  icon: string;
  title: string;
  items: string[];
}

export interface DayRecommendations {
  astroCharacter: AstroRecommendation;
  career: AstroRecommendation;
  relationships: AstroRecommendation;
  finance: AstroRecommendation;
  health: AstroRecommendation;
  luckyActions: AstroRecommendation;
  avoid: AstroRecommendation;
}

// Ключи для переводов рекомендаций
const recommendationKeys: Record<number, Record<string, string[]>> = {
  1: {
    astroCharacter: [
      'recommendations.day1.astro1',
      'recommendations.day1.astro2',
      'recommendations.day1.astro3',
      'recommendations.day1.astro4'
    ],
    career: [
      'recommendations.day1.career1',
      'recommendations.day1.career2',
      'recommendations.day1.career3',
      'recommendations.day1.career4'
    ],
    relationships: [
      'recommendations.day1.relation1',
      'recommendations.day1.relation2',
      'recommendations.day1.relation3',
      'recommendations.day1.relation4'
    ],
    finance: [
      'recommendations.day1.finance1',
      'recommendations.day1.finance2',
      'recommendations.day1.finance3',
      'recommendations.day1.finance4'
    ],
    health: [
      'recommendations.day1.health1',
      'recommendations.day1.health2',
      'recommendations.day1.health3',
      'recommendations.day1.health4'
    ],
    luckyActions: [
      'recommendations.day1.lucky1',
      'recommendations.day1.lucky2',
      'recommendations.day1.lucky3',
      'recommendations.day1.lucky4'
    ],
    avoid: [
      'recommendations.day1.avoid1',
      'recommendations.day1.avoid2',
      'recommendations.day1.avoid3',
      'recommendations.day1.avoid4'
    ]
  },
  2: {
    astroCharacter: [
      'recommendations.day2.astro1',
      'recommendations.day2.astro2',
      'recommendations.day2.astro3',
      'recommendations.day2.astro4'
    ],
    career: [
      'recommendations.day2.career1',
      'recommendations.day2.career2',
      'recommendations.day2.career3',
      'recommendations.day2.career4'
    ],
    relationships: [
      'recommendations.day2.relation1',
      'recommendations.day2.relation2',
      'recommendations.day2.relation3',
      'recommendations.day2.relation4'
    ],
    finance: [
      'recommendations.day2.finance1',
      'recommendations.day2.finance2',
      'recommendations.day2.finance3',
      'recommendations.day2.finance4'
    ],
    health: [
      'recommendations.day2.health1',
      'recommendations.day2.health2',
      'recommendations.day2.health3',
      'recommendations.day2.health4'
    ],
    luckyActions: [
      'recommendations.day2.lucky1',
      'recommendations.day2.lucky2',
      'recommendations.day2.lucky3',
      'recommendations.day2.lucky4'
    ],
    avoid: [
      'recommendations.day2.avoid1',
      'recommendations.day2.avoid2',
      'recommendations.day2.avoid3',
      'recommendations.day2.avoid4'
    ]
  },
  3: {
    astroCharacter: [
      'recommendations.day3.astro1',
      'recommendations.day3.astro2',
      'recommendations.day3.astro3',
      'recommendations.day3.astro4'
    ],
    career: [
      'recommendations.day3.career1',
      'recommendations.day3.career2',
      'recommendations.day3.career3',
      'recommendations.day3.career4'
    ],
    relationships: [
      'recommendations.day3.relation1',
      'recommendations.day3.relation2',
      'recommendations.day3.relation3',
      'recommendations.day3.relation4'
    ],
    finance: [
      'recommendations.day3.finance1',
      'recommendations.day3.finance2',
      'recommendations.day3.finance3',
      'recommendations.day3.finance4'
    ],
    health: [
      'recommendations.day3.health1',
      'recommendations.day3.health2',
      'recommendations.day3.health3',
      'recommendations.day3.health4'
    ],
    luckyActions: [
      'recommendations.day3.lucky1',
      'recommendations.day3.lucky2',
      'recommendations.day3.lucky3',
      'recommendations.day3.lucky4'
    ],
    avoid: [
      'recommendations.day3.avoid1',
      'recommendations.day3.avoid2',
      'recommendations.day3.avoid3',
      'recommendations.day3.avoid4'
    ]
  },
  4: {
    astroCharacter: [
      'recommendations.day4.astro1',
      'recommendations.day4.astro2',
      'recommendations.day4.astro3',
      'recommendations.day4.astro4'
    ],
    career: [
      'recommendations.day4.career1',
      'recommendations.day4.career2',
      'recommendations.day4.career3',
      'recommendations.day4.career4'
    ],
    relationships: [
      'recommendations.day4.relation1',
      'recommendations.day4.relation2',
      'recommendations.day4.relation3',
      'recommendations.day4.relation4'
    ],
    finance: [
      'recommendations.day4.finance1',
      'recommendations.day4.finance2',
      'recommendations.day4.finance3',
      'recommendations.day4.finance4'
    ],
    health: [
      'recommendations.day4.health1',
      'recommendations.day4.health2',
      'recommendations.day4.health3',
      'recommendations.day4.health4'
    ],
    luckyActions: [
      'recommendations.day4.lucky1',
      'recommendations.day4.lucky2',
      'recommendations.day4.lucky3',
      'recommendations.day4.lucky4'
    ],
    avoid: [
      'recommendations.day4.avoid1',
      'recommendations.day4.avoid2',
      'recommendations.day4.avoid3',
      'recommendations.day4.avoid4'
    ]
  },
  5: {
    astroCharacter: [
      'recommendations.day5.astro1',
      'recommendations.day5.astro2',
      'recommendations.day5.astro3',
      'recommendations.day5.astro4'
    ],
    career: [
      'recommendations.day5.career1',
      'recommendations.day5.career2',
      'recommendations.day5.career3',
      'recommendations.day5.career4'
    ],
    relationships: [
      'recommendations.day5.relation1',
      'recommendations.day5.relation2',
      'recommendations.day5.relation3',
      'recommendations.day5.relation4'
    ],
    finance: [
      'recommendations.day5.finance1',
      'recommendations.day5.finance2',
      'recommendations.day5.finance3',
      'recommendations.day5.finance4'
    ],
    health: [
      'recommendations.day5.health1',
      'recommendations.day5.health2',
      'recommendations.day5.health3',
      'recommendations.day5.health4'
    ],
    luckyActions: [
      'recommendations.day5.lucky1',
      'recommendations.day5.lucky2',
      'recommendations.day5.lucky3',
      'recommendations.day5.lucky4'
    ],
    avoid: [
      'recommendations.day5.avoid1',
      'recommendations.day5.avoid2',
      'recommendations.day5.avoid3',
      'recommendations.day5.avoid4'
    ]
  },
  6: {
    astroCharacter: [
      'recommendations.day6.astro1',
      'recommendations.day6.astro2',
      'recommendations.day6.astro3',
      'recommendations.day6.astro4'
    ],
    career: [
      'recommendations.day6.career1',
      'recommendations.day6.career2',
      'recommendations.day6.career3',
      'recommendations.day6.career4'
    ],
    relationships: [
      'recommendations.day6.relation1',
      'recommendations.day6.relation2',
      'recommendations.day6.relation3',
      'recommendations.day6.relation4'
    ],
    finance: [
      'recommendations.day6.finance1',
      'recommendations.day6.finance2',
      'recommendations.day6.finance3',
      'recommendations.day6.finance4'
    ],
    health: [
      'recommendations.day6.health1',
      'recommendations.day6.health2',
      'recommendations.day6.health3',
      'recommendations.day6.health4'
    ],
    luckyActions: [
      'recommendations.day6.lucky1',
      'recommendations.day6.lucky2',
      'recommendations.day6.lucky3',
      'recommendations.day6.lucky4'
    ],
    avoid: [
      'recommendations.day6.avoid1',
      'recommendations.day6.avoid2',
      'recommendations.day6.avoid3',
      'recommendations.day6.avoid4'
    ]
  },
  7: {
    astroCharacter: [
      'recommendations.day7.astro1',
      'recommendations.day7.astro2',
      'recommendations.day7.astro3',
      'recommendations.day7.astro4'
    ],
    career: [
      'recommendations.day7.career1',
      'recommendations.day7.career2',
      'recommendations.day7.career3',
      'recommendations.day7.career4'
    ],
    relationships: [
      'recommendations.day7.relation1',
      'recommendations.day7.relation2',
      'recommendations.day7.relation3',
      'recommendations.day7.relation4'
    ],
    finance: [
      'recommendations.day7.finance1',
      'recommendations.day7.finance2',
      'recommendations.day7.finance3',
      'recommendations.day7.finance4'
    ],
    health: [
      'recommendations.day7.health1',
      'recommendations.day7.health2',
      'recommendations.day7.health3',
      'recommendations.day7.health4'
    ],
    luckyActions: [
      'recommendations.day7.lucky1',
      'recommendations.day7.lucky2',
      'recommendations.day7.lucky3',
      'recommendations.day7.lucky4'
    ],
    avoid: [
      'recommendations.day7.avoid1',
      'recommendations.day7.avoid2',
      'recommendations.day7.avoid3',
      'recommendations.day7.avoid4'
    ]
  },
  8: {
    astroCharacter: [
      'recommendations.day8.astro1',
      'recommendations.day8.astro2',
      'recommendations.day8.astro3',
      'recommendations.day8.astro4'
    ],
    career: [
      'recommendations.day8.career1',
      'recommendations.day8.career2',
      'recommendations.day8.career3',
      'recommendations.day8.career4'
    ],
    relationships: [
      'recommendations.day8.relation1',
      'recommendations.day8.relation2',
      'recommendations.day8.relation3',
      'recommendations.day8.relation4'
    ],
    finance: [
      'recommendations.day8.finance1',
      'recommendations.day8.finance2',
      'recommendations.day8.finance3',
      'recommendations.day8.finance4'
    ],
    health: [
      'recommendations.day8.health1',
      'recommendations.day8.health2',
      'recommendations.day8.health3',
      'recommendations.day8.health4'
    ],
    luckyActions: [
      'recommendations.day8.lucky1',
      'recommendations.day8.lucky2',
      'recommendations.day8.lucky3',
      'recommendations.day8.lucky4'
    ],
    avoid: [
      'recommendations.day8.avoid1',
      'recommendations.day8.avoid2',
      'recommendations.day8.avoid3',
      'recommendations.day8.avoid4'
    ]
  },
  9: {
    astroCharacter: [
      'recommendations.day9.astro1',
      'recommendations.day9.astro2',
      'recommendations.day9.astro3',
      'recommendations.day9.astro4'
    ],
    career: [
      'recommendations.day9.career1',
      'recommendations.day9.career2',
      'recommendations.day9.career3',
      'recommendations.day9.career4'
    ],
    relationships: [
      'recommendations.day9.relation1',
      'recommendations.day9.relation2',
      'recommendations.day9.relation3',
      'recommendations.day9.relation4'
    ],
    finance: [
      'recommendations.day9.finance1',
      'recommendations.day9.finance2',
      'recommendations.day9.finance3',
      'recommendations.day9.finance4'
    ],
    health: [
      'recommendations.day9.health1',
      'recommendations.day9.health2',
      'recommendations.day9.health3',
      'recommendations.day9.health4'
    ],
    luckyActions: [
      'recommendations.day9.lucky1',
      'recommendations.day9.lucky2',
      'recommendations.day9.lucky3',
      'recommendations.day9.lucky4'
    ],
    avoid: [
      'recommendations.day9.avoid1',
      'recommendations.day9.avoid2',
      'recommendations.day9.avoid3',
      'recommendations.day9.avoid4'
    ]
  }
};

// Icons for each category
const categoryIcons: Record<string, string> = {
  astroCharacter: '✨',
  career: '💼',
  relationships: '❤️',
  finance: '💰',
  health: '🏃',
  luckyActions: '⭐',
  avoid: '⚠️'
};

// Category title keys
const categoryTitleKeys: Record<string, string> = {
  astroCharacter: 'recommendations.categories.astroCharacter',
  career: 'recommendations.categories.career',
  relationships: 'recommendations.categories.relationships',
  finance: 'recommendations.categories.finance',
  health: 'recommendations.categories.health',
  luckyActions: 'recommendations.categories.luckyActions',
  avoid: 'recommendations.categories.avoid'
};

// Функция для получения рекомендаций по номеру дня с переводами
export function getAstroRecommendations(dayNumber: number, t?: TFunction): DayRecommendations {
  const keys = recommendationKeys[dayNumber] || recommendationKeys[1];
  
  const translateItems = (keyList: string[]): string[] => {
    if (!t) return keyList.map(k => k.split('.').pop() || k);
    return keyList.map(k => t(k, k));
  };
  
  const getTitle = (key: string): string => {
    if (!t) return key;
    return t(categoryTitleKeys[key], categoryTitleKeys[key]);
  };
  
  return {
    astroCharacter: {
      icon: categoryIcons.astroCharacter,
      title: getTitle('astroCharacter'),
      items: translateItems(keys.astroCharacter)
    },
    career: {
      icon: categoryIcons.career,
      title: getTitle('career'),
      items: translateItems(keys.career)
    },
    relationships: {
      icon: categoryIcons.relationships,
      title: getTitle('relationships'),
      items: translateItems(keys.relationships)
    },
    finance: {
      icon: categoryIcons.finance,
      title: getTitle('finance'),
      items: translateItems(keys.finance)
    },
    health: {
      icon: categoryIcons.health,
      title: getTitle('health'),
      items: translateItems(keys.health)
    },
    luckyActions: {
      icon: categoryIcons.luckyActions,
      title: getTitle('luckyActions'),
      items: translateItems(keys.luckyActions)
    },
    avoid: {
      icon: categoryIcons.avoid,
      title: getTitle('avoid'),
      items: translateItems(keys.avoid)
    }
  };
}
