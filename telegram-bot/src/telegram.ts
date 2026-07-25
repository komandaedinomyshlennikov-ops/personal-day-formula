/** Minimal Telegram Bot API client */

export interface TgUser {
  id: number;
  first_name?: string;
  username?: string;
  language_code?: string;
}

export interface TgMessage {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
  successful_payment?: {
    currency: string;
    total_amount: number;
    invoice_payload: string;
    telegram_payment_charge_id: string;
    provider_payment_charge_id: string;
  };
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  pre_checkout_query?: {
    id: string;
    from: TgUser;
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
  callback_query?: {
    id: string;
    from: TgUser;
    data?: string;
    message?: TgMessage;
  };
}

export async function tgApi(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; description?: string; result?: unknown };
  if (!data.ok) {
    console.error('Telegram API error', method, data.description);
    throw new Error(data.description || method);
  }
  return data.result;
}

export async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {}
) {
  return tgApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  });
}

export async function answerCallback(token: string, id: string, text?: string) {
  return tgApi(token, 'answerCallbackQuery', {
    callback_query_id: id,
    text,
  });
}

export async function answerPreCheckout(token: string, id: string, ok = true, error?: string) {
  return tgApi(token, 'answerPreCheckoutQuery', {
    pre_checkout_query_id: id,
    ok,
    error_message: error,
  });
}

/**
 * Fiat invoice via Telegram Bot Payments API.
 * https://core.telegram.org/bots/payments
 *
 * - provider_token: from BotFather → Bot Settings → Payments
 * - amount: integer in the smallest currency unit (e.g. cents for USD)
 * - For digital goods on iOS Apple may restrict card checkout; prefer LIVE token after test.
 */
export async function sendPaymentInvoice(
  token: string,
  chatId: number,
  opts: {
    title: string;
    description: string;
    payload: string;
    currency: string;
    providerToken: string;
    /** Amount in minor units (cents for USD/EUR). */
    amount: number;
    label: string;
  }
) {
  return tgApi(token, 'sendInvoice', {
    chat_id: chatId,
    title: opts.title,
    description: opts.description,
    payload: opts.payload,
    currency: opts.currency,
    provider_token: opts.providerToken,
    prices: [{ label: opts.label, amount: opts.amount }],
    // Digital access product — no shipping
    need_name: false,
    need_phone_number: false,
    need_email: false,
    need_shipping_address: false,
    is_flexible: false,
  });
}
