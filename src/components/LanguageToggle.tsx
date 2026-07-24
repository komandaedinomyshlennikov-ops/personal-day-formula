import { useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, setAppLanguage, type LanguageCode } from '@/i18n';

interface LanguageToggleProps {
  variant?: 'pill' | 'minimal';
  /** Persist into user profile (settings / app state) */
  onLanguageChange?: (lang: LanguageCode) => void;
}

const languages: { code: LanguageCode; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
];

export function LanguageToggle({
  variant = 'pill',
  onLanguageChange,
}: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const currentLang = normalizeLanguage(i18n.language);
  const [isPending, startTransition] = useTransition();

  const handleSwitch = useCallback(
    (newLang: LanguageCode) => {
      if (newLang === currentLang || isPending) return;

      startTransition(() => {
        void setAppLanguage(newLang).then((lang) => {
          onLanguageChange?.(lang);
        });
      });
    },
    [currentLang, isPending, onLanguageChange]
  );

  if (variant === 'pill') {
    return (
      <div
        className="lang-toggle relative inline-flex items-center p-0.5 bg-black/40 border border-white/15 rounded-full backdrop-blur-md shadow-lg shrink-0"
        role="group"
        aria-label={t('settings.language', { defaultValue: 'Language' })}
      >
        <motion.div
          className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-violet-500/55 to-pink-500/55"
          initial={false}
          animate={{
            left: currentLang === 'ru' ? 2 : 'calc(50%)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />

        {languages.map((lang) => {
          const active = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSwitch(lang.code)}
              disabled={isPending}
              className={`
                relative z-10 flex items-center justify-center gap-1 min-w-[2.75rem] min-h-9 px-2.5 py-1.5 rounded-full
                text-xs font-semibold transition-colors duration-150
                ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
                ${isPending ? 'opacity-70' : 'cursor-pointer'}
              `}
              aria-label={lang.code === 'ru' ? 'Русский' : 'English'}
              aria-pressed={active}
            >
              <span className="text-sm leading-none" aria-hidden>
                {lang.flag}
              </span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t('settings.language', { defaultValue: 'Language' })}
    >
      {languages.map((lang) => {
        const active = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSwitch(lang.code)}
            disabled={isPending}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all
              ${
                active
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }
            `}
            aria-label={lang.code === 'ru' ? 'Русский' : 'English'}
            aria-pressed={active}
          >
            <span aria-hidden>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
