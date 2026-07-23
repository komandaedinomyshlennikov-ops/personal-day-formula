import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, setAppLanguage, type LanguageCode } from '@/i18n';

/**
 * Thin adapter around react-i18next so legacy callers stay in sync
 * with the global language (no separate store / no page reload).
 */
export function useLocalization() {
  const { i18n, t: i18nT } = useTranslation();
  const language = normalizeLanguage(i18n.language);

  const setLanguage = useCallback((lang: LanguageCode) => {
    void setAppLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    void setAppLanguage(language === 'ru' ? 'en' : 'ru');
  }, [language]);

  const format = useCallback((text: string, values: Record<string, string | number>) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() ?? match;
    });
  }, []);

  // Compatibility: string key path via i18n.t
  const t = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === 'toString') return () => '';
        return new Proxy(
          {},
          {
            get(_t2, prop2: string) {
              return i18nT(`${prop}.${prop2}`);
            },
          }
        );
      },
    }
  ) as Record<string, Record<string, string>>;

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    format,
    isLoaded: true,
    isRussian: language === 'ru',
    isEnglish: language === 'en',
  };
}
