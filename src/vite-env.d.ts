/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_COACH_API_URL?: string;
  /** Telegram pay bot username without @ — enables Bot Payments checkout deep-links */
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  /** Pay bot Worker base URL (e.g. https://astronavigator-pay-bot.xxx.workers.dev) */
  readonly VITE_PAY_API_URL?: string;
  /**
   * Private builds only: enable admin birth-date full unlock (1991-03-07).
   * Never set on public GitHub Pages.
   */
  readonly VITE_ENABLE_ADMIN_UNLOCK?: string;
  /**
   * Optional passphrase for browser session admin unlock (private builds).
   * Used with tryUnlockAdminSession(); do not ship on public Pages.
   */
  readonly VITE_ADMIN_SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
