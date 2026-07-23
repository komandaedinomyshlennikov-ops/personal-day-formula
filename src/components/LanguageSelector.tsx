import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { availableLanguages, getLanguageInfo, type LanguageCode } from '@/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'compact';
  showLabel?: boolean;
  onChange?: (lang: LanguageCode) => void;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'dropdown', 
  showLabel = true,
  onChange,
  className = ''
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLang = i18n.language as LanguageCode;
  const currentLangInfo = getLanguageInfo(currentLang);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    onChange?.(langCode);
    setIsOpen(false);
  };

  // Compact variant (just flag + chevron for header)
  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={t('actions.changeLanguage')}
        >
          <span className="text-lg">{currentLangInfo.flag}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="max-h-64 overflow-y-auto py-1">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                      ${currentLang === lang.code 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'hover:bg-white/5 text-gray-300'
                      }
                    `}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1 text-sm">{lang.nativeName}</span>
                    {currentLang === lang.code && (
                      <Check size={16} className="text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Buttons variant (grid of language buttons)
  if (variant === 'buttons') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as LanguageCode)}
            className={`
              flex items-center gap-2 p-3 rounded-xl transition-all border
              ${currentLang === lang.code 
                ? 'bg-amber-500/20 border-amber-400/50 text-white' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="text-left">
              <p className="text-sm font-medium">{lang.nativeName}</p>
              <p className="text-xs opacity-60">{lang.name}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {t('settings.language')}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
          ${isOpen 
            ? 'bg-amber-500/10 border-amber-400/50' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
          }
        `}
      >
        <Globe size={20} className="text-amber-400" />
        <span className="text-lg">{currentLangInfo.flag}</span>
        <span className="flex-1 text-left text-white">{currentLangInfo.nativeName}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto"
          >
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${currentLang === lang.code 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'hover:bg-white/5 text-gray-300'
                  }
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm">{lang.nativeName}</p>
                  <p className="text-xs opacity-60">{lang.name}</p>
                </div>
                {currentLang === lang.code && (
                  <Check size={18} className="text-amber-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
