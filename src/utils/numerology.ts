// Утилиты для расчётов цифровой психологии (timezone-safe)

import type { DayInfo } from '@/types';
import type { TFunction } from 'i18next';
import { fromLocalDate, requireDateOnly, toLocalDate } from '@/utils/date';

export type { DayInfo };

// Расчёт Числа Жизненного Пути (постоянное число на всю жизнь)
// Складываем день + месяц + год рождения и сводим к одной цифре
export function calculateLifePathNumber(birthDate: string): number {
  const { day, month, year } = requireDateOnly(birthDate);
  return reduceToSingleDigit(day + month + year);
}

// Расчёт личного года
export function calculatePersonalYear(birthDate: string, year: number): number {
  const { day, month } = requireDateOnly(birthDate);
  return reduceToSingleDigit(day + month + year);
}

// Расчёт личного месяца
export function calculatePersonalMonth(birthDate: string, year: number, month: number): number {
  const personalYear = calculatePersonalYear(birthDate, year);
  return reduceToSingleDigit(personalYear + month);
}

// Расчёт личного дня: личный месяц + число дня
export function calculatePersonalDay(birthDate: string, date: Date): number {
  const { year, month, day } = fromLocalDate(date);
  return calculatePersonalDayFromNumbers(birthDate, year, month, day);
}

// Расчёт личного дня (версия с отдельными параметрами)
export function calculatePersonalDayFromNumbers(
  birthDate: string,
  year: number,
  month: number,
  day: number
): number {
  const personalMonth = calculatePersonalMonth(birthDate, year, month);
  return reduceToSingleDigit(personalMonth + day);
}

// Расчёт общего дня (универсальный день) — local calendar parts
export function calculateUniversalDay(date: Date): number {
  const { year, month, day } = fromLocalDate(date);
  return calculateUniversalDayFromParts(year, month, day);
}

export function calculateUniversalDayFromParts(
  year: number,
  month: number,
  day: number
): number {
  return reduceToSingleDigit(day + month + year);
}

// Сведение к однозначному числу
export function reduceToSingleDigit(num: number): number {
  if (num <= 9) return num;
  
  let sum = num;
  while (sum > 9) {
    sum = String(sum)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum;
}

// Информация об энергиях с переводами
export function getEnergyInfo(number: number, t?: TFunction) {
  // Получаем переводы из JSON или используем значения по умолчанию
  const getTranslation = (key: string, defaultValue: string): string => {
    if (!t) return defaultValue;
    const result = t(key, { defaultValue });
    return result || defaultValue;
  };

  // Получаем массив переводов
  const getArrayTranslation = (key: string, defaults: string[]): string[] => {
    if (!t) return defaults;
    const result = t(key, { returnObjects: true, defaultValue: defaults }) as unknown;
    if (Array.isArray(result) && result.length > 0 && result.every(item => typeof item === 'string')) {
      return result as string[];
    }
    return defaults;
  };

  const energies: Record<number, {
    name: string;
    planet: string;
    icon: string;
    color: string;
    description: string;
    positive: string[];
    negative: string[];
  }> = {
    1: {
      name: getTranslation('energies.1.name', 'Солнце'),
      planet: getTranslation('energies.1.name', 'Солнце'),
      icon: '☀️',
      color: '#fbbf24',
      description: getTranslation('energies.1.description', 'Время яркости и самовыражения. Начинайте новые проекты.'),
      positive: getArrayTranslation('energies.1.positive', [
        'Начинать новые проекты',
        'Подписывать договоры',
        'Принимать важные решения',
        'Делать крупные покупки'
      ]),
      negative: getArrayTranslation('energies.1.negative', [
        'Бояться действовать',
        'Откладывать важное',
        'Избегать ответственности'
      ])
    },
    2: {
      name: getTranslation('energies.2.name', 'Луна'),
      planet: getTranslation('energies.2.name', 'Луна'),
      icon: '🌙',
      color: '#c0c0c0',
      description: getTranslation('energies.2.description', 'Время интуиции и дипломатии. Стройте отношения.'),
      positive: getArrayTranslation('energies.2.positive', [
        'Дипломатия и переговоры',
        'Творческая работа',
        'Медитация',
        'Семейное время'
      ]),
      negative: getArrayTranslation('energies.2.negative', [
        'Избегать конфликтов',
        'Не принимать больших решений',
        'Избегать эмоциональных трат'
      ])
    },
    3: {
      name: getTranslation('energies.3.name', 'Юпитер'),
      planet: getTranslation('energies.3.name', 'Юпитер'),
      icon: '⚡',
      color: '#f59e0b',
      description: getTranslation('energies.3.description', 'Время роста и расширения. Учитесь и путешествуйте.'),
      positive: getArrayTranslation('energies.3.positive', [
        'Обучение и курсы',
        'Юридические вопросы',
        'Долгосрочные инвестиции',
        'Планирование путешествий'
      ]),
      negative: getArrayTranslation('energies.3.negative', [
        'Избегать азартных игр',
        'Не переоценивать возможности',
        'Избегать быстрой спекуляции'
      ])
    },
    4: {
      name: getTranslation('energies.4.name', 'Раху'),
      planet: getTranslation('energies.4.name', 'Раху'),
      icon: '🔮',
      color: '#3b82f6',
      description: getTranslation('energies.4.description', 'Время неожиданностей и перемен. Будьте гибкими.'),
      positive: getArrayTranslation('energies.4.positive', [
        'Креативные решения',
        'Исследовательская работа',
        'Стратегическое планирование',
        'Ставить амбициозные цели'
      ]),
      negative: getArrayTranslation('energies.4.negative', [
        'Избегать обмана',
        'Не доверять слепо',
        'Быть осторожным с финансами'
      ])
    },
    5: {
      name: getTranslation('energies.5.name', 'Меркурий'),
      planet: getTranslation('energies.5.name', 'Меркурий'),
      icon: '💬',
      color: '#06b6d4',
      description: getTranslation('energies.5.description', 'Время коммуникации и обучения. Ведите переговоры.'),
      positive: getArrayTranslation('energies.5.positive', [
        'Вести переговоры',
        'Писать документы',
        'Покупать гаджеты',
        'Нетворкинг'
      ]),
      negative: getArrayTranslation('energies.5.negative', [
        'Избегать пустых обещаний',
        'Не сплетничать',
        'Проверять информацию'
      ])
    },
    6: {
      name: getTranslation('energies.6.name', 'Венера'),
      planet: getTranslation('energies.6.name', 'Венера'),
      icon: '💕',
      color: '#ec4899',
      description: getTranslation('energies.6.description', 'Время любви и красоты. Наслаждайтесь жизнью.'),
      positive: getArrayTranslation('energies.6.positive', [
        'Романтические свидания',
        'Покупка искусства',
        'Процедуры красоты',
        'Творческие проекты'
      ]),
      negative: getArrayTranslation('energies.6.negative', [
        'Избегать перерасхода',
        'Не лениться',
        'Избегать переедания сладкого'
      ])
    },
    7: {
      name: getTranslation('energies.7.name', 'Кету'),
      planet: getTranslation('energies.7.name', 'Кету'),
      icon: '🧘',
      color: '#6366f1',
      description: getTranslation('energies.7.description', 'Время духовности и самопознания. Медитируйте.'),
      positive: getArrayTranslation('energies.7.positive', [
        'Медитация',
        'Самоанализ',
        'Чтение',
        'Йога'
      ]),
      negative: getArrayTranslation('energies.7.negative', [
        'Не начинать новые проекты',
        'Избегать важных решений',
        'Не одалживать деньги'
      ])
    },
    8: {
      name: getTranslation('energies.8.name', 'Сатурн'),
      planet: getTranslation('energies.8.name', 'Сатурн'),
      icon: '🏛️',
      color: '#78716c',
      description: getTranslation('energies.8.description', 'Время дисциплины и работы. Будьте ответственны.'),
      positive: getArrayTranslation('energies.8.positive', [
        'Упорная работа',
        'Финансовое планирование',
        'Недвижимость',
        'Долгосрочные инвестиции'
      ]),
      negative: getArrayTranslation('energies.8.negative', [
        'Избегать нарушения правил',
        'Не лениться',
        'Избегать shortcuts'
      ])
    },
    9: {
      name: getTranslation('energies.9.name', 'Марс'),
      planet: getTranslation('energies.9.name', 'Марс'),
      icon: '🔥',
      color: '#ef4444',
      description: getTranslation('energies.9.description', 'Время действий и завершения. Завершайте дела.'),
      positive: getArrayTranslation('energies.9.positive', [
        'Завершать задачи',
        'Спорт',
        'Защищать интересы',
        'Благотворительность'
      ]),
      negative: getArrayTranslation('energies.9.negative', [
        'Не начинать новые проекты',
        'Избегать конфликтов',
        'Контролировать гнев'
      ])
    }
  };

  return energies[number] || energies[1];
}

// Цвета для дней календаря (1-9)
export function getDayColor(number: number): string {
  const colors: Record<number, string> = {
    1: '#fbbf24', // amber-400
    2: '#94a3b8', // slate-400
    3: '#a78bfa', // violet-400
    4: '#f87171', // red-400
    5: '#60a5fa', // blue-400
    6: '#f472b6', // pink-400
    7: '#818cf8', // indigo-400
    8: '#4ade80', // green-400
    9: '#fb923c', // orange-400
  };
  return colors[number] || '#ffffff';
}

// Цвет для нулевых дней (10, 20, 30)
export function getZeroDayColor(): string {
  return '#4f46e5'; // indigo-600 для нулевых дней
}

// Форматирование даты с поддержкой локализации
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Название дня недели с поддержкой локализации
export function getDayOfWeekName(date: Date, t?: (key: string) => string): string {
  const dayIndex = date.getDay();
  const dayKeys = [
    'weekdays.sunday', 'weekdays.monday', 'weekdays.tuesday', 
    'weekdays.wednesday', 'weekdays.thursday', 'weekdays.friday', 'weekdays.saturday'
  ];
  
  if (t) {
    return t(dayKeys[dayIndex]);
  }
  
  // Fallback to English
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

// Название месяца с поддержкой локализации
export function getMonthName(month: number, t?: (key: string) => string): string {
  const monthKeys = [
    'months.january', 'months.february', 'months.march', 'months.april',
    'months.may', 'months.june', 'months.july', 'months.august',
    'months.september', 'months.october', 'months.november', 'months.december'
  ];
  
  if (t) {
    return t(monthKeys[month - 1]);
  }
  
  // Fallback to English
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

// Генерация данных для месяца (local dates, no UTC shift)
export function generateMonthData(
  birthDate: string,
  year: number,
  month: number
): DayInfo[] {
  // Validate birth date early
  requireDateOnly(birthDate);

  const daysInMonth = new Date(year, month, 0).getDate();
  const data: DayInfo[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = toLocalDate({ year, month, day });
    const personalNumber = calculatePersonalDayFromNumbers(birthDate, year, month, day);
    const generalNumber = calculateUniversalDayFromParts(year, month, day);

    const isFavorable = [1, 3, 5, 6].includes(personalNumber);
    const isUnfavorable = [4, 8, 9].includes(personalNumber);

    data.push({
      date,
      personalNumber,
      generalNumber,
      isFavorable,
      isUnfavorable,
    } as DayInfo);
  }

  return data;
}

// Проверка на нулевой день (10, 20, 30)
export function isZeroDay(date: Date): boolean {
  const day = date.getDate();
  return day === 10 || day === 20 || day === 30;
}

// Проверка на благоприятный день
export function isFavorableDay(personalNumber: number): boolean {
  return [1, 3, 5, 6].includes(personalNumber);
}

// Проверка на сложный день
export function isChallengingDay(personalNumber: number): boolean {
  return [4, 8, 9].includes(personalNumber);
}
