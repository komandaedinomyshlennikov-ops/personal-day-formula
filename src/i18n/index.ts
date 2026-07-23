import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import only RU and EN translations
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

// Available languages with metadata
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
] as const;

export type LanguageCode = typeof availableLanguages[number]['code'];

// Get language info
export const getLanguageInfo = (code: string) => {
  return availableLanguages.find(lang => lang.code === code) || availableLanguages[1]; // Default to RU
};

/**
 * Получение значения cookie по имени
 */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Расширение Window для __INITIAL_LANG__
declare global {
  interface Window {
    __INITIAL_LANG__?: string;
  }
}

/**
 * Определение начального языка (приоритет: Cookie > localStorage > Browser > RU)
 */
const detectInitialLanguage = (): string => {
  // Проверяем cookie
  const cookieLang = getCookie('astro-lang');
  if (cookieLang && ['ru', 'en'].includes(cookieLang)) {
    return cookieLang;
  }
  
  // Проверяем localStorage
  try {
    const savedLang = localStorage.getItem('astronavigator_language');
    if (savedLang && ['ru', 'en'].includes(savedLang)) {
      return savedLang;
    }
  } catch (e) {
    // localStorage не доступен
  }
  
  // Проверяем язык браузера
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (['ru', 'en'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'ru'; // Default
};

// Resources object
const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectInitialLanguage(), // Определяем язык при инициализации
    fallbackLng: 'ru',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

// Set HTML lang attribute
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
