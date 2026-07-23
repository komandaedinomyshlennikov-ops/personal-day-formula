/** Canonical public site config (GitHub Pages). */
export const SITE_URL = 'https://komandaedinomyshlennikov-ops.github.io/personal-day-formula/';
export const SITE_ORIGIN = 'https://komandaedinomyshlennikov-ops.github.io';
export const SITE_PATH = '/personal-day-formula/';
export const SITE_NAME = 'Астронавигатор';
export const SITE_NAME_EN = 'AstroNavigator';
export const SITE_AUTHOR = 'Татьяна Генюш';
export const SUPPORT_TELEGRAM = 'https://t.me/tatianageniush';
export const SITE_EMAIL = ''; // optional contact email
export const OG_IMAGE = `${SITE_URL}icon-512x512.png`;

/** Telegram payment deep-links by plan */
export const TELEGRAM_PAYMENT_LINKS: Record<string, string> = {
  month:
    'https://t.me/tatianageniush?text=' +
    encodeURIComponent(
      'Hello Tatiana! I want to subscribe to AstroNavigator for 1 month ($10). Please send payment details.'
    ),
  year:
    'https://t.me/tatianageniush?text=' +
    encodeURIComponent(
      'Hello Tatiana! I want to subscribe to AstroNavigator for 1 year ($50). Please send payment details.'
    ),
  lifetime:
    'https://t.me/tatianageniush?text=' +
    encodeURIComponent(
      'Hello Tatiana! I want lifetime access to AstroNavigator ($100). Please send payment details.'
    ),
};
