/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_COACH_API_URL?: string;
  /** Telegram pay bot username without @ — enables Bot Payments checkout deep-links */
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  /** Pay bot Worker base URL (e.g. https://astronavigator-pay-bot.xxx.workers.dev) */
  readonly VITE_PAY_API_URL?: string;
  /**
   * Kill-switch: set to "true" to disable admin birth-date unlock (1991-03-07).
   * Default: admin unlock is ON in all builds.
   */
  readonly VITE_DISABLE_ADMIN_UNLOCK?: string;
  /**
   * Optional passphrase for browser session admin unlock (extra devices).
   * Used with tryUnlockAdminSession().
   */
  readonly VITE_ADMIN_SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
