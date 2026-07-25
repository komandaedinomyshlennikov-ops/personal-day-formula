/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_COACH_API_URL?: string;
  /** Telegram pay bot username without @ — enables auto Stars checkout deep-links */
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  /** Pay bot Worker base URL (e.g. https://astronavigator-pay-bot.xxx.workers.dev) */
  readonly VITE_PAY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
