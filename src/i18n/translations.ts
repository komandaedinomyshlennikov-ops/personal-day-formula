// Локализация приложения Астронавигатор
// Используется специализированная терминология для ниш нумерологии и астрологии

export type Language = 'ru' | 'en';

export interface Translations {
  // Общие
  appName: string;
  appSubtitle: string;
  loading: string;
  save: string;
  cancel: string;
  close: string;
  back: string;
  next: string;
  start: string;
  continue: string;
  done: string;
  yes: string;
  no: string;
  
  // Навигация
  nav: {
    home: string;
    calendar: string;
    settings: string;
    subscription: string;
    share: string;
    notes: string;
  };
  
  // Onboarding
  onboarding: {
    slide1Title: string;
    slide1Subtitle: string;
    slide1Description: string;
    slide2Title: string;
    slide2Subtitle: string;
    slide2Description: string;
    slide3Title: string;
    slide3Subtitle: string;
    slide3Description: string;
    birthDateTitle: string;
    birthDateDescription: string;
    startTrial: string;
    trialNote: string;
  };
  
  // Календарь
  calendar: {
    personalYear: string;
    personalMonth: string;
    personalDay: string;
    universalDay: string;
    favorable: string;
    neutral: string;
    completion: string;
    zeroDayHint: string;
    zeroDayWarning: string;
    zeroDayDescription: string;
    swipeHint: string;
    consultation: string;
    share: string;
  };
  
  // Дни недели
  weekdays: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  
  // Месяцы
  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };
  
  // Планеты
  planets: {
    sun: string;
    moon: string;
    jupiter: string;
    rahu: string;
    mercury: string;
    venus: string;
    ketu: string;
    saturn: string;
    mars: string;
  };
  
  // Энергии (числа 1-9)
  energies: {
    1: { name: string; description: string; };
    2: { name: string; description: string; };
    3: { name: string; description: string; };
    4: { name: string; description: string; };
    5: { name: string; description: string; };
    6: { name: string; description: string; };
    7: { name: string; description: string; };
    8: { name: string; description: string; };
    9: { name: string; description: string; };
  };
  
  // Рекомендации
  recommendations: {
    positive: string;
    negative: string;
    warnings: string;
    favorableActions: string;
    avoid: string;
    focus: string;
    opportunities: string;
    challenges: string;
    astroEvents: string;
    significantDates: string;
    howItAffectsYou: string;
  };
  
  // Подписка
  subscription: {
    title: string;
    currentPlan: string;
    trialActive: string;
    trialExpired: string;
    trialDaysLeft: string;
    subscriptionExpired: string;
    subscriptionExpiredMessage: string;
    choosePlan: string;
    activate: string;
    activateWithCode: string;
    enterCode: string;
    codePlaceholder: string;
    invalidCode: string;
    activationSuccess: string;
    plans: {
      trial: { name: string; description: string; };
      month: { name: string; description: string; };
      year: { name: string; description: string; };
      lifetime: { name: string; description: string; };
    };
    paymentInfo: string;
    contactForPayment: string;
    telegramButton: string;
  };
  
  // Настройки
  settings: {
    title: string;
    profile: string;
    theme: string;
    lightTheme: string;
    darkTheme: string;
    autoTheme: string;
    accessibility: string;
    highContrast: string;
    highContrastDesc: string;
    notifications: string;
    notificationsDesc: string;
    language: string;
    russian: string;
    english: string;
    export: string;
    exportPDF: string;
    exportPDFDesc: string;
    exportCSV: string;
    exportCSVDesc: string;
    contacts: string;
    telegram: string;
    instagram: string;
    phone: string;
    email: string;
    account: string;
    logout: string;
    logoutDesc: string;
    deleteData: string;
    deleteDataDesc: string;
    version: string;
  };
  
  // Астрособытия (премиум)
  astroEvents: {
    title: string;
    subtitle: string;
    premiumFeature: string;
    premiumDescription: string;
    unlockWithSubscription: string;
    lunarNodes: string;
    plutoRetrograde: string;
    uranusDirect: string;
    newMoon: string;
    fullMoon: string;
    mercuryRetrograde: string;
    venusInTaurus: string;
    jupiterInPisces: string;
    saturnInAquarius: string;
    marsInAries: string;
  };
  
  // Уведомления
  notifications: {
    trialEnding: string;
    trialEnded: string;
    subscriptionEnding: string;
    subscriptionEnded: string;
    dailyReminder: string;
    dailyReminderBody: string;
  };
  
  // Ошибки
  errors: {
    generic: string;
    network: string;
    invalidDate: string;
    requiredField: string;
  };
}

// Русская локализация
export const ru: Translations = {
  appName: 'Астронавигатор',
  appSubtitle: 'Личный календарь успеха',
  loading: 'Загрузка...',
  save: 'Сохранить',
  cancel: 'Отмена',
  close: 'Закрыть',
  back: 'Назад',
  next: 'Далее',
  start: 'Начать',
  continue: 'Продолжить',
  done: 'Готово',
  yes: 'Да',
  no: 'Нет',
  
  nav: {
    home: 'Главная',
    calendar: 'Календарь',
    settings: 'Настройки',
    subscription: 'Подписка',
    share: 'Поделиться',
    notes: 'Заметки',
  },
  
  onboarding: {
    slide1Title: 'Астронавигатор',
    slide1Subtitle: 'Личный календарь успеха',
    slide1Description: 'Это ваш персональный помощник на каждый день, который даёт возможность грамотно планировать жизнь, бизнес, поездки, встречи и важные события.',
    slide2Title: 'Система 9 энергий',
    slide2Subtitle: 'Планетарные циклы',
    slide2Description: 'Каждая дата имеет свою энергетику под управлением определённой планеты. Понимая энергии, вы сможете прогнозировать события и избегать ошибок.',
    slide3Title: 'Как использовать',
    slide3Subtitle: 'Планируйте с умом',
    slide3Description: 'Календарь подскажет, когда лучше начать проект, заключить сделку или совершить покупку. Вы будете увереннее в своих действиях!',
    birthDateTitle: 'Ваша дата рождения',
    birthDateDescription: 'Введите дату, чтобы мы могли рассчитать ваш личный календарь',
    startTrial: 'Начать 3-дневный пробный период',
    trialNote: 'Пробный период начнётся автоматически',
  },
  
  calendar: {
    personalYear: 'Личный год',
    personalMonth: 'Личный месяц',
    personalDay: 'Личный день',
    universalDay: 'Общий день',
    favorable: 'Благоприятно',
    neutral: 'Нейтрально',
    completion: 'Завершение',
    zeroDayHint: '10, 20, 30 — отложите важное',
    zeroDayWarning: 'Отложите важное',
    zeroDayDescription: 'Даты 10, 20, 30 — время паузы и переосмысления. Не начинайте новых дел, лучше завершите текущие.',
    swipeHint: 'Свайпайте влево/вправо для переключения месяцев',
    consultation: 'Консультация Татьяны Генюш',
    share: 'Поделиться',
  },
  
  weekdays: {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
  },
  
  months: {
    january: 'Январь',
    february: 'Февраль',
    march: 'Март',
    april: 'Апрель',
    may: 'Май',
    june: 'Июнь',
    july: 'Июль',
    august: 'Август',
    september: 'Сентябрь',
    october: 'Октябрь',
    november: 'Ноябрь',
    december: 'Декабрь',
  },
  
  planets: {
    sun: 'Солнце',
    moon: 'Луна',
    jupiter: 'Юпитер',
    rahu: 'Раху',
    mercury: 'Меркурий',
    venus: 'Венера',
    ketu: 'Кету',
    saturn: 'Сатурн',
    mars: 'Марс',
  },
  
  energies: {
    1: {
      name: 'Новая стратегия жизни',
      description: 'Время смелости и действий, решения деловых вопросов, заключения сделок и начала сотрудничества.',
    },
    2: {
      name: 'Отношения и дипломатия',
      description: 'Период спокойный и медленный. Наполнен сомнениями, поэтому не рекомендуется начинать новый бизнес.',
    },
    3: {
      name: 'Системность и успех',
      description: 'Отличный период для запуска новых проектов, подписания договоров. Время анализа и структурности.',
    },
    4: {
      name: 'Цели и задачи',
      description: 'Время креативных решений и перемен. Не бойтесь идти в новое!',
    },
    5: {
      name: 'Масштаб и коммуникация',
      description: 'Лучшее время для проведения важных переговоров. Многие проекты принесут устойчивые результаты.',
    },
    6: {
      name: 'Любовь и комфорт',
      description: 'Время для наслаждения жизнью и завершения старых дел, дорогих покупок и инвестиций.',
    },
    7: {
      name: 'Кризис и трансформация',
      description: 'Период эмоциональных колебаний. Могут срываться планы, люди кажутся раздражительными.',
    },
    8: {
      name: 'Деньги и труд',
      description: 'Отличный период для начала новой деятельности, заключения договоров. Просто работайте и всё получится!',
    },
    9: {
      name: 'Итоги и очищение',
      description: 'Время подведения итогов во всех сферах. Высокий эмоциональный фон.',
    },
  },
  
  recommendations: {
    positive: 'Благоприятно',
    negative: 'Избегать',
    warnings: 'Предостережения',
    favorableActions: 'Благоприятные действия',
    avoid: 'Чего избегать',
    focus: 'На чём сфокусироваться',
    opportunities: 'Возможности',
    challenges: 'Чего остерегаться',
    astroEvents: 'Астрособытия',
    significantDates: 'Значимые даты',
    howItAffectsYou: 'Как это влияет на вас',
  },
  
  subscription: {
    title: 'Подписка',
    currentPlan: 'Текущий план',
    trialActive: 'Пробный период активен',
    trialExpired: 'Пробный период закончился',
    trialDaysLeft: 'Осталось {days} дней',
    subscriptionExpired: 'Подписка закончилась',
    subscriptionExpiredMessage: 'Ваша подписка закончилась. Оформите подписку, чтобы продолжить пользоваться всеми функциями.',
    choosePlan: 'Выберите план подписки',
    activate: 'Активировать',
    activateWithCode: 'Активировать по коду',
    enterCode: 'Введите код активации',
    codePlaceholder: 'Например: MONTH-2026',
    invalidCode: 'Неверный код активации',
    activationSuccess: 'Подписка активирована!',
    plans: {
      trial: {
        name: '3 дня бесплатно',
        description: 'Попробуйте все функции бесплатно',
      },
      month: {
        name: 'Месяц',
        description: 'Базовый доступ',
      },
      year: {
        name: 'Год',
        description: 'Выгода 58%',
      },
      lifetime: {
        name: 'Навсегда',
        description: 'Пожизненный доступ',
      },
    },
    paymentInfo: 'Для оплаты напишите в Telegram',
    contactForPayment: 'Свяжитесь с нами для активации подписки',
    telegramButton: 'Написать в Telegram',
  },
  
  settings: {
    title: 'Настройки',
    profile: 'Ваш профиль',
    theme: 'Тема оформления',
    lightTheme: 'Светлая',
    darkTheme: 'Тёмная',
    autoTheme: 'Авто',
    accessibility: 'Доступность',
    highContrast: 'Увеличенный контраст',
    highContrastDesc: 'Для слабовидящих',
    notifications: 'Уведомления',
    notificationsDesc: 'О важных днях',
    language: 'Язык',
    russian: 'Русский',
    english: 'English',
    export: 'Экспорт данных',
    exportPDF: 'Экспорт в PDF',
    exportPDFDesc: 'Сохранить календарь как PDF',
    exportCSV: 'Экспорт в CSV',
    exportCSVDesc: 'Сохранить данные как CSV',
    contacts: 'Контакты',
    telegram: 'Telegram',
    instagram: 'Instagram',
    phone: 'Телефон',
    email: 'Email',
    account: 'Аккаунт',
    logout: 'Выйти из приложения',
    logoutDesc: 'Сбросить данные и выйти',
    deleteData: 'Удалить все данные',
    deleteDataDesc: 'Сбросить приложение',
    version: 'Астронавигатор v1.0',
  },
  
  astroEvents: {
    title: 'Астрособытия',
    subtitle: 'Планетарные влияния, которые усиливают энергию вашего периода',
    premiumFeature: 'Премиум-функция',
    premiumDescription: 'Детальные астрособытия доступны с подпиской',
    unlockWithSubscription: 'Оформите подписку для разблокировки',
    lunarNodes: 'Узлы Луны активны — судьбоносные события',
    plutoRetrograde: 'Плутон ретроградный — глубинная трансформация',
    uranusDirect: 'Уран прямой — неожиданные изменения',
    newMoon: 'Новолуние — время загадывать желания',
    fullMoon: 'Полнолуние — время завершения дел',
    mercuryRetrograde: 'Меркурий ретроградный — перепроверяйте документы',
    venusInTaurus: 'Венера в Тельце — усиливает чувственность',
    jupiterInPisces: 'Юпитер в Рыбах — усиливает интуицию',
    saturnInAquarius: 'Сатурн в Водолее — структура и дисциплина',
    marsInAries: 'Марс в Овне — энергия и действие',
  },
  
  notifications: {
    trialEnding: 'Пробный период заканчивается',
    trialEnded: 'Пробный период закончился',
    subscriptionEnding: 'Подписка заканчивается',
    subscriptionEnded: 'Подписка закончилась',
    dailyReminder: 'Доброе утро!',
    dailyReminderBody: 'Проверьте рекомендации на сегодня в Астронавигаторе',
  },
  
  errors: {
    generic: 'Что-то пошло не так',
    network: 'Ошибка сети',
    invalidDate: 'Некорректная дата',
    requiredField: 'Обязательное поле',
  },
};

// Английская локализация (специализированная терминология нумерологии/астрологии)
export const en: Translations = {
  appName: 'AstroNavigator',
  appSubtitle: 'Personal Success Calendar',
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  start: 'Start',
  continue: 'Continue',
  done: 'Done',
  yes: 'Yes',
  no: 'No',
  
  nav: {
    home: 'Home',
    calendar: 'Calendar',
    settings: 'Settings',
    subscription: 'Subscription',
    share: 'Share',
    notes: 'Notes',
  },
  
  onboarding: {
    slide1Title: 'AstroNavigator',
    slide1Subtitle: 'Your Personal Success Calendar',
    slide1Description: 'Your daily companion for wisely planning life, business, travel, meetings, and important events through the wisdom of digital psychology and planetary cycles.',
    slide2Title: 'The 9 Energy System',
    slide2Subtitle: 'Planetary Cycles & Vibrations',
    slide2Description: 'Every date carries unique energy governed by a specific planet. Understanding these vibrations allows you to predict events and avoid mistakes.',
    slide3Title: 'How to Use',
    slide3Subtitle: 'Plan with Cosmic Wisdom',
    slide3Description: 'The calendar will guide you on when to start projects, sign deals, or make purchases. Move through life with greater confidence!',
    birthDateTitle: 'Your Birth Date',
    birthDateDescription: 'Enter your date of birth so we can calculate your personal calendar and life path number',
    startTrial: 'Start 3-Day Free Trial',
    trialNote: 'Trial period starts automatically',
  },
  
  calendar: {
    personalYear: 'Personal Year',
    personalMonth: 'Personal Month',
    personalDay: 'Personal Day',
    universalDay: 'Universal Day',
    favorable: 'Favorable',
    neutral: 'Neutral',
    completion: 'Completion',
    zeroDayHint: '10, 20, 30 — postpone important matters',
    zeroDayWarning: 'Postpone Important Matters',
    zeroDayDescription: 'Dates 10, 20, 30 are days of pause and reflection. Avoid starting new ventures; instead, focus on completing current tasks.',
    swipeHint: 'Swipe left/right to change months',
    consultation: 'Consultation with Tatiana Geniush',
    share: 'Share',
  },
  
  weekdays: {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  
  months: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
  
  planets: {
    sun: 'Sun',
    moon: 'Moon',
    jupiter: 'Jupiter',
    rahu: 'Rahu',
    mercury: 'Mercury',
    venus: 'Venus',
    ketu: 'Ketu',
    saturn: 'Saturn',
    mars: 'Mars',
  },
  
  energies: {
    1: {
      name: 'New Life Strategy',
      description: 'A time for courage and action, resolving business matters, closing deals, and initiating partnerships. The Sun illuminates your path.',
    },
    2: {
      name: 'Relationships & Diplomacy',
      description: 'A calm, introspective period filled with intuition. Not recommended for launching new business ventures. The Moon guides emotions.',
    },
    3: {
      name: 'System & Success',
      description: 'Excellent period for launching new projects and signing contracts. Time for analysis, structure, and Jupiter\'s expansive wisdom.',
    },
    4: {
      name: 'Goals & Objectives',
      description: 'A time for creative solutions and transformation. Rahu brings unexpected opportunities. Don\'t be afraid to venture into the new!',
    },
    5: {
      name: 'Scale & Communication',
      description: 'The best time for important negotiations and networking. Mercury supports communication. Many projects will yield stable results.',
    },
    6: {
      name: 'Love & Comfort',
      description: 'Time to enjoy life, complete old tasks, make quality purchases, and investments. Venus brings harmony and beauty.',
    },
    7: {
      name: 'Crisis & Transformation',
      description: 'A period of emotional fluctuations. Plans may change unexpectedly. Ketu calls for spiritual reflection and inner work.',
    },
    8: {
      name: 'Money & Effort',
      description: 'Excellent period for starting new activities and signing contracts. Saturn rewards discipline. Just work hard and success will follow!',
    },
    9: {
      name: 'Completion & Purification',
      description: 'Time to wrap up all areas of life. High emotional intensity. Mars brings energy for finishing what you started.',
    },
  },
  
  recommendations: {
    positive: 'Favorable Actions',
    negative: 'Avoid',
    warnings: 'Cautions',
    favorableActions: 'Lucky Actions',
    avoid: 'What to Avoid',
    focus: 'Focus Areas',
    opportunities: 'Opportunities',
    challenges: 'Challenges',
    astroEvents: 'Astro Events',
    significantDates: 'Significant Dates',
    howItAffectsYou: 'How This Affects You',
  },
  
  subscription: {
    title: 'Subscription',
    currentPlan: 'Current Plan',
    trialActive: 'Trial Active',
    trialExpired: 'Trial Expired',
    trialDaysLeft: '{days} days left',
    subscriptionExpired: 'Subscription Expired',
    subscriptionExpiredMessage: 'Your subscription has expired. Subscribe to continue using all features.',
    choosePlan: 'Choose Your Plan',
    activate: 'Activate',
    activateWithCode: 'Activate with Code',
    enterCode: 'Enter Activation Code',
    codePlaceholder: 'e.g., MONTH-2026',
    invalidCode: 'Invalid activation code',
    activationSuccess: 'Subscription activated!',
    plans: {
      trial: {
        name: '3 Days Free',
        description: 'Try all features for free',
      },
      month: {
        name: 'Monthly',
        description: 'Basic access',
      },
      year: {
        name: 'Yearly',
        description: 'Save 58%',
      },
      lifetime: {
        name: 'Lifetime',
        description: 'Permanent access forever',
      },
    },
    paymentInfo: 'Contact us on Telegram for payment',
    contactForPayment: 'Reach out to activate your subscription',
    telegramButton: 'Message on Telegram',
  },
  
  settings: {
    title: 'Settings',
    profile: 'Your Profile',
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    autoTheme: 'Auto',
    accessibility: 'Accessibility',
    highContrast: 'High Contrast',
    highContrastDesc: 'For visually impaired',
    notifications: 'Notifications',
    notificationsDesc: 'About important days',
    language: 'Language',
    russian: 'Русский',
    english: 'English',
    export: 'Export Data',
    exportPDF: 'Export to PDF',
    exportPDFDesc: 'Save calendar as PDF',
    exportCSV: 'Export to CSV',
    exportCSVDesc: 'Save data as CSV',
    contacts: 'Contacts',
    telegram: 'Telegram',
    instagram: 'Instagram',
    phone: 'Phone',
    email: 'Email',
    account: 'Account',
    logout: 'Logout',
    logoutDesc: 'Reset data and exit',
    deleteData: 'Delete All Data',
    deleteDataDesc: 'Reset the application',
    version: 'AstroNavigator v1.0',
  },
  
  astroEvents: {
    title: 'Astro Events',
    subtitle: 'Planetary influences that amplify your period\'s energy',
    premiumFeature: 'Premium Feature',
    premiumDescription: 'Detailed astro events available with subscription',
    unlockWithSubscription: 'Subscribe to unlock',
    lunarNodes: 'Lunar Nodes active — fateful events unfolding',
    plutoRetrograde: 'Pluto retrograde — deep transformation period',
    uranusDirect: 'Uranus direct — unexpected changes ahead',
    newMoon: 'New Moon — time to set intentions',
    fullMoon: 'Full Moon — time to complete tasks',
    mercuryRetrograde: 'Mercury retrograde — double-check documents',
    venusInTaurus: 'Venus in Taurus — sensuality enhanced',
    jupiterInPisces: 'Jupiter in Pisces — intuition amplified',
    saturnInAquarius: 'Saturn in Aquarius — structure and discipline',
    marsInAries: 'Mars in Aries — energy and action',
  },
  
  notifications: {
    trialEnding: 'Trial Ending Soon',
    trialEnded: 'Trial Period Ended',
    subscriptionEnding: 'Subscription Ending Soon',
    subscriptionEnded: 'Subscription Expired',
    dailyReminder: 'Good Morning!',
    dailyReminderBody: 'Check today\'s recommendations in AstroNavigator',
  },
  
  errors: {
    generic: 'Something went wrong',
    network: 'Network error',
    invalidDate: 'Invalid date',
    requiredField: 'Required field',
  },
};

// Получение переводов по языку
export function getTranslations(lang: Language): Translations {
  return lang === 'en' ? en : ru;
}

// Все доступные языки
export const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'en', name: 'English', nativeName: 'English' },
];
