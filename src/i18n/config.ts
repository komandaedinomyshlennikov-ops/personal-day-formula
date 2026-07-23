/**
 * Re-export unified i18n (RU/EN only).
 * Kept so older imports of `@/i18n/config` resolve without dual init.
 */
export {
  default,
  availableLanguages,
  getLanguageInfo,
  isRTL,
  normalizeLanguage,
  setAppLanguage,
  SUPPORTED_LANGS,
  type LanguageCode,
} from './index';
export { default as i18n } from './index';
