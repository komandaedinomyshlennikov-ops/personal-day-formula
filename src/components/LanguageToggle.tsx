import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  flag: string;
  label: string;
}

const languages: Language[] = [
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
];

interface LanguageToggleProps {
  variant?: 'pill' | 'minimal';
}

export function LanguageToggle({ variant = 'pill' }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const [currentLang] = useState(i18n.language || 'ru');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработчик клика по кнопке языка
   */
  const handleSwitch = useCallback((newLang: string) => {
    if (newLang === currentLang || isLoading) return;
    
    setIsLoading(true);
    
    // Сохраняем в cookie (работает во всех браузерах)
    document.cookie = `astro-lang=${newLang}; path=/; max-age=31536000`; // 1 год
    
    // Сохраняем в localStorage (если доступен)
    try {
      localStorage.setItem('astronavigator_language', newLang);
    } catch (e) {
      // localStorage не доступен
    }
    
    // Сохраняем в cookie (работает во всех браузерах)
    document.cookie = `astro-lang=${newLang}; path=/; max-age=31536000`; // 1 год
    
    // Перезагружаем страницу
    window.location.reload();
  }, [currentLang, isLoading]);

  // Pill variant - кнопки рядом с анимацией переключения
  if (variant === 'pill') {
    return (
      <div className="relative inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
        {/* Анимированный фон для активного языка */}
        <motion.div
          className="absolute h-[calc(100%-8px)] rounded-full bg-gradient-to-r from-violet-500/50 to-pink-500/50"
          initial={false}
          animate={{
            x: currentLang === 'ru' ? 4 : 'calc(100% + 4px)',
            width: 'calc(50% - 8px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ left: 0 }}
        />
        
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            type="button"
            onClick={() => handleSwitch(lang.code)}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            className={`
              relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-sm font-medium transition-colors duration-200
              ${currentLang === lang.code 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-200'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={lang.code === 'ru' ? 'Русский язык' : 'English language'}
            aria-current={currentLang === lang.code ? 'true' : 'false'}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  // Minimal variant - компактная версия для узких мест
  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          type="button"
          onClick={() => handleSwitch(lang.code)}
          disabled={isLoading}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-lg
            text-xs font-medium transition-all duration-200
            ${currentLang === lang.code 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={lang.code === 'ru' ? 'Русский язык' : 'English language'}
          aria-current={currentLang === lang.code ? 'true' : 'false'}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
