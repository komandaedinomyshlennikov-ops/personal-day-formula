import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';

/** App supports only RU + EN fully (100% key parity). */
export const availableLanguages = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' as const },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' as const },
] as const;

export type LanguageCode = (typeof availableLanguages)[number]['code'];

export const SUPPORTED_LANGS: LanguageCode[] = ['ru', 'en'];

/** Normalize browser/i18n codes like en-US, ru-RU → en | ru */
export function normalizeLanguage(code?: string | null): LanguageCode {
  if (!code) return 'ru';
  const base = code.toLowerCase().split('-')[0];
  return base === 'en' ? 'en' : 'ru';
}

export const getLanguageInfo = (code: string) => {
  const normalized = normalizeLanguage(code);
  return availableLanguages.find((lang) => lang.code === normalized) || availableLanguages[0];
};

export const isRTL = (_lang: string): boolean => false;

const STORAGE_KEY = 'astronavigator_language';
const COOKIE_KEY = 'astro-lang';

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Persist + switch language without page reload.
 * Updates i18n, html lang, localStorage, cookie.
 */
export async function setAppLanguage(code: string): Promise<LanguageCode> {
  const lang = normalizeLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }
  writeCookie(COOKIE_KEY, lang);
  await i18n.changeLanguage(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
  }
  return lang;
}

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations },
};

void i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en'],
  nonExplicitSupportedLngs: true,
  load: 'languageOnly',
  debug: false,
  // Prefer explicit stored language; avoid flash of wrong locale
  detection: {
    order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
    caches: ['localStorage', 'cookie'],
    lookupLocalStorage: STORAGE_KEY,
    lookupCookie: COOKIE_KEY,
    convertDetectedLanguage: (lng) => normalizeLanguage(lng),
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
    // Re-render all bound components immediately on language change
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
  },
  returnNull: false,
  returnEmptyString: false,
  // Never show raw keys when missing
  parseMissingKeyHandler: (key) => {
    if (import.meta.env.DEV) {
      console.warn('[i18n] missing key:', key);
    }
    return '';
  },
});

// Ensure we start on a supported language only
const initial = normalizeLanguage(i18n.language);
if (i18n.language !== initial) {
  void i18n.changeLanguage(initial);
}

i18n.on('languageChanged', (lng) => {
  const lang = normalizeLanguage(lng);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = normalizeLanguage(i18n.language);
  document.documentElement.dir = 'ltr';
}

export default i18n;
