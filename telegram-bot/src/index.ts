import {
  mintUnlockToken,
  verifyUnlockToken,
  type UnlockPlan,
} from './crypto';
import {
  answerCallback,
  answerPreCheckout,
  sendMessage,
  sendStarsInvoice,
  type TgUpdate,
} from './telegram';

export interface Env {
  BOT_TOKEN: string;
  UNLOCK_SECRET: string;
  WEBHOOK_SECRET: string;
  APP_URL: string;
  BOT_USERNAME?: string;
  STARS_MONTH?: string;
  STARS_YEAR?: string;
  STARS_LIFETIME?: string;
  ALLOWED_ORIGINS?: string;
  /** Optional fiat payment provider token from BotFather */
  PAYMENT_PROVIDER_TOKEN?: string;
  UNLOCK_KV?: KVNamespace;
}

const PLANS: Record<
  UnlockPlan,
  { title: string; desc: string; label: string; starsKey: keyof Env }
> = {
  month: {
    title: 'Астронавигатор — 1 месяц',
    desc: 'Полный Pro: календарь, помощник, экспорт, месяц/год.',
    label: '1 месяц',
    starsKey: 'STARS_MONTH',
  },
  year: {
    title: 'Астронавигатор — 1 год',
    desc: 'Pro + Year-инструменты (компас, окна, дайджест).',
    label: '1 год',
    starsKey: 'STARS_YEAR',
  },
  lifetime: {
    title: 'Астронавигатор — навсегда',
    desc: 'Пожизненный доступ ко всем Year-инструментам.',
    label: 'Навсегда',
    starsKey: 'STARS_LIFETIME',
  },
};

function starsFor(env: Env, plan: UnlockPlan): number {
  const raw = env[PLANS[plan].starsKey] as string | undefined;
  const n = Number(raw || '0');
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 500;
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

function plansKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📅 1 месяц', callback_data: 'buy:month' }],
      [{ text: '✨ 1 год (выгоднее)', callback_data: 'buy:year' }],
      [{ text: '♾️ Навсегда', callback_data: 'buy:lifetime' }],
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
      'Выберите план. Оплата <b>Telegram Stars</b> (⭐) — доступ откроется сразу по ссылке.',
      '',
      'Карточные данные в приложение не вводятся.',
    ].join('\n'),
    { reply_markup: plansKeyboard() }
  );
}

async function sendInvoiceForPlan(env: Env, chatId: number, plan: UnlockPlan) {
  const meta = PLANS[plan];
  const stars = starsFor(env, plan);
  const payload = JSON.stringify({
    plan,
    v: 1,
    ts: Math.floor(Date.now() / 1000),
  });

  try {
    await sendStarsInvoice(env.BOT_TOKEN, chatId, {
      title: meta.title,
      description: meta.desc,
      payload,
      stars,
      label: `${meta.label} · ${stars} ⭐`,
    });
  } catch (e) {
    console.error('sendInvoice failed', e);
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      'Не удалось создать счёт. Проверьте, что боту включены платежи (BotFather → Payments) и Stars.'
    );
  }
}

async function onSuccessfulPayment(
  env: Env,
  chatId: number,
  payloadRaw: string,
  chargeId: string
) {
  let plan: UnlockPlan = 'month';
  try {
    const p = JSON.parse(payloadRaw) as { plan?: string };
    plan = parsePlan(p.plan) || 'month';
  } catch {
    /* default month */
  }

  const token = await mintUnlockToken(env.UNLOCK_SECRET, plan);
  // Store charge id against jti for audit; claim uses used:<jti>
  if (env.UNLOCK_KV) {
    const payload = await verifyUnlockToken(env.UNLOCK_SECRET, token);
    if (payload?.jti) {
      await env.UNLOCK_KV.put(`charge:${payload.jti}`, chargeId, {
        expirationTtl: 60 * 60 * 24 * 14,
      });
    }
  }

  const link = unlockLink(env, token);
  await sendMessage(
    env.BOT_TOKEN,
    chatId,
    [
      '✅ <b>Оплата прошла</b>',
      '',
      `План: <b>${PLANS[plan].label}</b>`,
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
          '2. Оплатите Stars в Telegram',
          '3. Нажмите «Открыть доступ» — подписка активируется в приложении',
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
      msg.successful_payment.telegram_payment_charge_id
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

  if (text === '/help') {
    await sendMessage(
      env.BOT_TOKEN,
      chatId,
      'Команды: /start — меню, /buy — тарифы. Оплата Stars → ссылка на доступ.'
    );
    return;
  }

  // fallback
  await sendMessage(env.BOT_TOKEN, chatId, 'Выберите план:', {
    reply_markup: plansKeyboard(),
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
          stars: {
            month: starsFor(env, 'month'),
            year: starsFor(env, 'year'),
            lifetime: starsFor(env, 'lifetime'),
          },
        },
        200,
        c
      );
    }

    // Claim signed unlock token (called by web app)
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

      // Legacy static tokens still work via app client; signed v1.* go here
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

    // Telegram webhook
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
