import { useState, useEffect, useCallback } from 'react';
import { type Language, getTranslations } from '@/i18n/translations';

const STORAGE_KEY = 'astronavigator_language';

export function useLocalization() {
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка языка из localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'ru' || stored === 'en')) {
      setLanguageState(stored as Language);
    }
    setIsLoaded(true);
  }, []);

  // Сохранение языка в localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language, isLoaded]);

  // Установка языка
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Переключение языка
  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'ru' ? 'en' : 'ru');
  }, []);

  // Получение переводов
  const t = getTranslations(language);

  // Функция форматирования с плейсхолдерами
  const format = useCallback((text: string, values: Record<string, string | number>) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key]?.toString() ?? match;
    });
  }, []);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    format,
    isLoaded,
    isRussian: language === 'ru',
    isEnglish: language === 'en',
  };
}
