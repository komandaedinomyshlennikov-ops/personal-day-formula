/**
 * Set Telegram webhook after deploy.
 *
 * Usage:
 *   BOT_TOKEN=... WEBHOOK_SECRET=... WORKER_URL=https://astronavigator-pay-bot.xxx.workers.dev \
 *     node scripts/set-webhook.mjs
 */

const token = process.env.BOT_TOKEN;
const secret = process.env.WEBHOOK_SECRET;
const worker = (process.env.WORKER_URL || '').replace(/\/$/, '');

if (!token || !secret || !worker) {
  console.error('Need BOT_TOKEN, WEBHOOK_SECRET, WORKER_URL');
  process.exit(1);
}

const url = `${worker}/webhook/${secret}`;
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url,
    allowed_updates: ['message', 'pre_checkout_query', 'callback_query'],
    drop_pending_updates: true,
  }),
});
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);
console.log('Webhook set to', url);
