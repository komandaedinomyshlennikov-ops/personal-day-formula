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

export type PayPlanId = 'month' | 'year' | 'lifetime';

export const PLAN_PRICES: Record<PayPlanId, { usd: number; labelRu: string; labelEn: string }> = {
  month: { usd: 10, labelRu: '1 месяц', labelEn: '1 month' },
  year: { usd: 50, labelRu: '1 год', labelEn: '1 year' },
  lifetime: { usd: 100, labelRu: 'навсегда', labelEn: 'lifetime' },
};

/**
 * Prefill Telegram chat for payment (no codes — access opens via unlock link after pay).
 */
export function buildTelegramPaymentUrl(
  planId: string,
  lang: 'ru' | 'en' = 'ru'
): string {
  const plan = PLAN_PRICES[planId as PayPlanId];
  if (!plan) return SUPPORT_TELEGRAM;

  const text =
    lang === 'ru'
      ? [
          `Здравствуйте, Татьяна!`,
          ``,
          `Хочу оформить подписку «Астронавигатор».`,
          `План: ${plan.labelRu}`,
          `Сумма: $${plan.usd}`,
          ``,
          `Оплачиваю в Telegram. После оплаты пришлите, пожалуйста, ссылку для открытия доступа (без кода).`,
        ].join('\n')
      : [
          `Hello Tatiana!`,
          ``,
          `I want to subscribe to AstroNavigator.`,
          `Plan: ${plan.labelEn}`,
          `Amount: $${plan.usd}`,
          ``,
          `I'll pay in Telegram. After payment, please send an unlock link (no activation code).`,
        ].join('\n');

  return `https://t.me/tatianageniush?text=${encodeURIComponent(text)}`;
}

/** @deprecated use buildTelegramPaymentUrl */
export const TELEGRAM_PAYMENT_LINKS: Record<string, string> = {
  month: buildTelegramPaymentUrl('month', 'ru'),
  year: buildTelegramPaymentUrl('year', 'ru'),
  lifetime: buildTelegramPaymentUrl('lifetime', 'ru'),
};

/**
 * One-tap unlock URL for admin to send after payment confirmed.
 * Example: buildUnlockUrl('MONTH-4915')
 * (Tokens are the same secrets as before — resolved by hash client-side.)
 */
export function buildUnlockUrl(token: string): string {
  const t = encodeURIComponent(token.trim());
  // HashRouter: path + query inside hash
  return `${SITE_URL}#/unlock?token=${t}`;
}
