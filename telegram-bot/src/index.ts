import {
  mintUnlockToken,
  verifyUnlockToken,
  type UnlockPlan,
} from './crypto';
import {
  answerCallback,
  answerPreCheckout,
  sendMessage,
  sendPaymentInvoice,
  type TgUpdate,
} from './telegram';

export interface Env {
  BOT_TOKEN: string;
  UNLOCK_SECRET: string;
  WEBHOOK_SECRET: string;
  APP_URL: string;
  BOT_USERNAME?: string;
  /**
   * Ammer Pay "Gateway Secret" from BotFather → Payments → Ammer Pay
   * (also called provider_token in Telegram Bot Payments API).
   * https://ammer-tech.github.io/AmmerPayBotDocumentation/
   * https://core.telegram.org/bots/payments
   */
  PAYMENT_PROVIDER_TOKEN?: string;
  /** ISO 4217, default USD. Amounts are in minor units (cents). */
  PAY_CURRENCY?: string;
  /** Prices in major units as strings, e.g. "10" → $10.00 → 1000 cents */
  USD_MONTH?: string;
  USD_YEAR?: string;
  USD_LIFETIME?: string;
  ALLOWED_ORIGINS?: string;
  UNLOCK_KV?: KVNamespace;
}

const PLANS: Record<
  UnlockPlan,
  {
    title: string;
    desc: string;
    label: string;
    usdKey: keyof Env;
    defaultUsd: number;
  }
> = {
  month: {
    title: 'Астронавигатор — 1 месяц',
    desc: 'Полный Pro: календарь, помощник без лимита, экспорт, месяц/год.',
    label: '1 месяц',
    usdKey: 'USD_MONTH',
    defaultUsd: 10,
  },
  year: {
    title: 'Астронавигатор — 1 год',
    desc: 'Pro + Year-инструменты (компас, окна, дайджест, умные напоминания).',
    label: '1 год',
    usdKey: 'USD_YEAR',
    defaultUsd: 50,
  },
  lifetime: {
    title: 'Астронавигатор — навсегда',
    desc: 'Пожизненный доступ ко всем Year-инструментам.',
    label: 'Навсегда',
    usdKey: 'USD_LIFETIME',
    defaultUsd: 100,
  },
};

function currency(env: Env): string {
  return (env.PAY_CURRENCY || 'USD').toUpperCase();
}

/** Major-unit price (e.g. 10 for $10). */
function usdFor(env: Env, plan: UnlockPlan): number {
  const raw = env[PLANS[plan].usdKey] as string | undefined;
  const n = Number(raw || '0');
  return Number.isFinite(n) && n > 0 ? n : PLANS[plan].defaultUsd;
}

/** Minor units for Telegram invoice (cents for USD/EUR). */
function amountMinor(env: Env, plan: UnlockPlan): number {
  const major = usdFor(env, plan);
  // Most currencies use 2 decimal places; Telegram expects integer minor units.
  return Math.round(major * 100);
}

function formatMoney(env: Env, plan: UnlockPlan): string {
  const cur = currency(env);
  const major = usdFor(env, plan);
  if (cur === 'USD') return `$${major}`;
  if (cur === 'EUR') return `€${major}`;
  if (cur === 'RUB') return `${major} ₽`;
  return `${major} ${cur}`;
}

function priceLine(env: Env, plan: UnlockPlan): string {
  return formatMoney(env, plan);
}

function formatPlanPrice(env: Env, plan: UnlockPlan): string {
  return `${PLANS[plan].label}: <b>${priceLine(env, plan)}</b>`;
}

function appBase(env: Env): string {
  const u = (env.APP_URL || '').replace(/\/?$/, '/');
  return u;
}

function unlockLink(env: Env, token: string): string {
  return `${appBase(env)}#/unlock?token=${encodeURIComponent(token)}`;
}

function cors(env: Env, origin: string | null): HeadersInit {
  const allowed = (env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const ok =
    !origin ||
    allowed.includes('*') ||
    allowed.includes(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(data: unknown, status: number, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function parsePlan(s: string | undefined): UnlockPlan | null {
  if (s === 'month' || s === 'year' || s === 'lifetime') return s;
  return null;
}

function plansKeyboard(env: Env) {
  return {
    inline_keyboard: [
      [
        {
          text: `📅 1 месяц · ${priceLine(env, 'month')}`,
          callback_data: 'buy:month',
        },
      ],
      [
        {
          text: `✨ 1 год · ${priceLine(env, 'year')} (выгоднее)`,
          callback_data: 'buy:year',
        },
      ],
      [
        {
          text: `♾️ Навсегда · ${priceLine(env, 'lifetime')}`,
          callback_data: 'buy:lifetime',
        },
      ],
      [{ text: 'ℹ️ Как это работает', callback_data: 'help' }],
    ],
  };
}

async function handleStart(env: Env, chatId: number, startArg?: string) {
  const plan = parsePlan(startArg?.replace(/^buy_/, '') || startArg);
  if (plan) {
    await sendInvoiceForPlan(env, chatId, plan);
    return;
  }
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    [
      '<b>Астронавигатор</b> — оплата подписки',
      '',
      'Оплата картой прямо в Telegram (Bot Payments).',
      'Данные карты обрабатывает платёжный провайдер — не мы и не приложение.',
      '',
      `• ${formatPlanPrice(env, 'month')}`,
      `• ${formatPlanPrice(env, 'year')}`,
      `• ${formatPlanPrice(env, 'lifetime')}`,
      '',
      'После оплаты придёт кнопка «Открыть доступ» — код вводить не нужно.',
    ].join('\n'),
    { reply_markup: plansKeyboard(env) }
  );
}

async function sendInvoiceForPlan(env: Env, chatId: number, plan: UnlockPlan) {
  const meta = PLANS[plan];
  const providerToken = (env.PAYMENT_PROVIDER_TOKEN || '').trim();
  if (!providerToken) {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        '⚠️ Платёжный провайдер ещё не подключён.',
        '',
        'Админу: BotFather → Payments → <b>Ammer Pay</b> → Connect Live',
        'Скопировать Gateway Secret и выполнить:',
        '<code>wrangler secret put PAYMENT_PROVIDER_TOKEN</code>',
        '',
        'Ammer: https://ammer-tech.github.io/AmmerPayBotDocumentation/',
        'Telegram: https://core.telegram.org/bots/payments',
      ].join('\n')
    );
    return;
  }

  const money = formatMoney(env, plan);
  const amount = amountMinor(env, plan);
  const payload = JSON.stringify({
    plan,
    v: 2,
    currency: currency(env),
    amount,
    ts: Math.floor(Date.now() / 1000),
  });

  try {
    await sendPaymentInvoice(env.BOT_TOKEN, chatId, {
      title: meta.title,
      description: `${meta.desc} Цена: ${money}.`,
      payload,
      currency: currency(env),
      providerToken,
      amount,
      label: `${meta.label} · ${money}`,
    });
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        `💳 <b>${meta.label}</b> — <b>${money}</b>`,
        '',
        'Нажмите <b>Pay</b> на счёте выше.',
        'После успешной оплаты откроется доступ по ссылке.',
      ].join('\n')
    );
  } catch (e) {
    console.error('sendInvoice failed', e);
    const err = e instanceof Error ? e.message : String(e);
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        'Не удалось создать счёт.',
        '',
        'Проверьте: BotFather → Payments (provider token), валюту и суммы.',
        `Детали: <code>${err.slice(0, 200)}</code>`,
      ].join('\n')
    );
  }
}

async function onSuccessfulPayment(
  env: Env,
  chatId: number,
  payloadRaw: string,
  chargeId: string,
  totalAmount?: number,
  payCurrency?: string
) {
  let plan: UnlockPlan = 'month';
  try {
    const p = JSON.parse(payloadRaw) as { plan?: string };
    plan = parsePlan(p.plan) || 'month';
  } catch {
    /* default month */
  }

  const token = await mintUnlockToken(env.UNLOCK_SECRET, plan);
  if (env.UNLOCK_KV) {
    const payload = await verifyUnlockToken(env.UNLOCK_SECRET, token);
    if (payload?.jti) {
      await env.UNLOCK_KV.put(
        `charge:${payload.jti}`,
        JSON.stringify({
          chargeId,
          totalAmount,
          currency: payCurrency,
          at: Date.now(),
        }),
        { expirationTtl: 60 * 60 * 24 * 14 }
      );
    }
  }

  const link = unlockLink(env, token);
  const paidLabel =
    typeof totalAmount === 'number' && payCurrency
      ? payCurrency === 'USD'
        ? `$${(totalAmount / 100).toFixed(2)}`
        : `${(totalAmount / 100).toFixed(2)} ${payCurrency}`
      : priceLine(env, plan);

  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    [
      '✅ <b>Оплата прошла</b>',
      '',
      `План: <b>${PLANS[plan].label}</b> (${paidLabel})`,
      '',
      'Нажмите кнопку ниже — доступ откроется в приложении автоматически.',
      '',
      `<a href="${link}">Или откройте ссылку вручную</a>`,
      '',
      'Ссылка действует 7 дней. Не пересылайте её посторонним.',
    ].join('\n'),
    {
      reply_markup: {
        inline_keyboard: [[{ text: '🔓 Открыть доступ', url: link }]],
      },
    }
  );
}

async function handleUpdate(env: Env, update: TgUpdate) {
  if (update.pre_checkout_query) {
    // Must answer within 10s — confirm stock / accept payment
    await answerPreCheckout(env.BOT_TOKEN, update.pre_checkout_query.id, true);
    return;
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    const data = cq.data || '';
    const chatId = cq.message?.chat.id || cq.from.id;
    await answerCallback(env.BOT_TOKEN, cq.id);

    if (data === 'help') {
      await sendMessage(
        env.BOT_TOKEN,
        chatId,
        [
          '<b>Как купить</b>',
          '1. Выберите план',
          '2. Оплатите счёт картой в Telegram (Pay)',
          '3. Нажмите «Открыть доступ» — подписка активируется сама',
          '',
          '<b>Цены</b>',
          `• ${formatPlanPrice(env, 'month')}`,
          `• ${formatPlanPrice(env, 'year')}`,
          `• ${formatPlanPrice(env, 'lifetime')}`,
          '',
          'Карточные данные уходят только платёжному провайдеру.',
          'Telegram не берёт комиссию; провайдер — по своему тарифу.',
          '',
          'Вопросы: @tatianageniush',
        ].join('\n')
      );
      return;
    }
    if (data.startsWith('buy:')) {
      const plan = parsePlan(data.slice(4));
      if (plan) await sendInvoiceForPlan(env, chatId, plan);
      return;
    }
  }

  const msg = update.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (msg.successful_payment) {
    await onSuccessfulPayment(
      env,
      chatId,
      msg.successful_payment.invoice_payload,
      msg.successful_payment.telegram_payment_charge_id,
      msg.successful_payment.total_amount,
      msg.successful_payment.currency
    );
    return;
  }

  if (text.startsWith('/start')) {
    const arg = text.split(/\s+/)[1];
    await handleStart(env, chatId, arg);
    return;
  }

  if (text === '/buy' || text === '/plans') {
    await handleStart(env, chatId);
    return;
  }

  if (text === '/terms') {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        '<b>Условия оплаты</b>',
        'Покупка открывает цифровой доступ к приложению «Астронавигатор» на выбранный срок.',
        'Оплата через Telegram Bot Payments; спорные случаи — через поддержку продавца.',
        'Возвраты: напишите @tatianageniush в разумный срок, если доступ не открылся после оплаты.',
        '',
        'Приложение: ' + appBase(env),
      ].join('\n')
    );
    return;
  }

  if (text === '/support') {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      'Поддержка по оплате и доступу: @tatianageniush\nTelegram Support не помогает с покупками через сторонних ботов.'
    );
    return;
  }

  if (text === '/help') {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      [
        'Команды: /start — меню, /buy — тарифы, /terms — условия, /support — поддержка.',
        'Оплата: карта в Telegram (Bot Payments).',
        '',
        `• ${formatPlanPrice(env, 'month')}`,
        `• ${formatPlanPrice(env, 'year')}`,
        `• ${formatPlanPrice(env, 'lifetime')}`,
      ].join('\n')
    );
    return;
  }

  await sendMessage(env.BOT_TOKEN, chatId, 'Выберите план:', {
    reply_markup: plansKeyboard(env),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const c = cors(env, origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: c });
    }

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json(
        {
          ok: true,
          service: 'astronavigator-pay-bot',
          hasBot: Boolean(env.BOT_TOKEN),
          payments: {
            mode: 'bot_payments',
            hasProviderToken: Boolean((env.PAYMENT_PROVIDER_TOKEN || '').trim()),
            currency: currency(env),
          },
          prices: {
            month: { major: usdFor(env, 'month'), minor: amountMinor(env, 'month') },
            year: { major: usdFor(env, 'year'), minor: amountMinor(env, 'year') },
            lifetime: {
              major: usdFor(env, 'lifetime'),
              minor: amountMinor(env, 'lifetime'),
            },
          },
        },
        200,
        c
      );
    }

    if (request.method === 'POST' && url.pathname === '/claim') {
      if (!env.UNLOCK_SECRET) {
        return json({ error: 'UNLOCK_SECRET missing' }, 503, c);
      }
      let body: { token?: string };
      try {
        body = (await request.json()) as { token?: string };
      } catch {
        return json({ error: 'Invalid JSON' }, 400, c);
      }
      const token = (body.token || '').trim();
      if (!token) return json({ error: 'token required' }, 400, c);

      if (!token.startsWith('v1.')) {
        return json({ error: 'not_signed', legacy: true }, 422, c);
      }

      const payload = await verifyUnlockToken(env.UNLOCK_SECRET, token);
      if (!payload) return json({ error: 'invalid_or_expired' }, 403, c);

      if (env.UNLOCK_KV) {
        const used = await env.UNLOCK_KV.get(`used:${payload.jti}`);
        if (used) return json({ error: 'already_used' }, 409, c);
        await env.UNLOCK_KV.put(`used:${payload.jti}`, '1', {
          expirationTtl: 60 * 60 * 24 * 30,
        });
      }

      return json(
        {
          ok: true,
          plan: payload.plan,
          days: payload.days,
        },
        200,
        c
      );
    }

    if (request.method === 'POST' && url.pathname.startsWith('/webhook/')) {
      const secret = url.pathname.replace('/webhook/', '');
      if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
        return json({ error: 'forbidden' }, 403);
      }
      if (!env.BOT_TOKEN || !env.UNLOCK_SECRET) {
        return json({ error: 'bot not configured' }, 503);
      }
      try {
        const update = (await request.json()) as TgUpdate;
        await handleUpdate(env, update);
      } catch (e) {
        console.error('webhook handler', e);
      }
      return json({ ok: true }, 200);
    }

    return json({ error: 'not found' }, 404, c);
  },
};
