# Telegram Pay Bot — Bot Payments (карта) → unlock

Оплата через [Telegram Bot Payments API](https://core.telegram.org/bots/payments)  
(карта / Apple Pay / Google Pay у провайдера — **не** Telegram Stars).

После оплаты бот шлёт `#/unlock?token=v1.…` → приложение делает `POST /claim`.

```
/start → план → sendInvoice(provider_token)
       → pre_checkout_query → answer ok
       → successful_payment → signed token → unlock
```

## 1. Бот + провайдер

1. [@BotFather](https://t.me/BotFather) → `/mybots` → **Sacrum_lab_bot**
2. **Bot Settings → Payments**
3. Подключить провайдера (для разработки: **Stripe TEST MODE**)
4. Скопировать **provider token**
5. Для боя: **LIVE** token (в строке обычно есть `:LIVE:`)

Документация: https://core.telegram.org/bots/payments

Тестовые карты Stripe: https://stripe.com/docs/testing#cards  
(например `4242 4242 4242 4242`)

## 2. Секреты + деплой

```bash
cd telegram-bot
npm install --legacy-peer-deps

npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler secret put UNLOCK_SECRET
npx wrangler secret put PAYMENT_PROVIDER_TOKEN   # ← токен из BotFather Payments

npx wrangler deploy
# https://astronavigator-pay-bot.astronavigator.workers.dev
```

Webhook:

```bash
export BOT_TOKEN=...
export WEBHOOK_SECRET=...
export WORKER_URL=https://astronavigator-pay-bot.astronavigator.workers.dev
npm run set-webhook
```

## 3. Цены

`wrangler.toml` → `USD_MONTH` / `USD_YEAR` / `USD_LIFETIME` (доллары).  
В invoice уходит **×100** (центы). Валюта: `PAY_CURRENCY` (по умолчанию `USD`).

| План     | Цена |
|----------|------|
| Месяц    | $10  |
| Год      | $50  |
| Навсегда | $100 |

## 4. Фронт (GitHub Secrets)

```
VITE_TELEGRAM_BOT_USERNAME=Sacrum_lab_bot
VITE_PAY_API_URL=https://astronavigator-pay-bot.astronavigator.workers.dev
```

Кнопка → `https://t.me/Sacrum_lab_bot?start=buy_year`

## 5. Live checklist (обязательно перед LIVE)

По [docs](https://core.telegram.org/bots/payments#going-live):

- `/terms` и `/support` в боте (уже есть)
- 2FA на аккаунте владельца бота
- Стабильный webhook / бэкап
- Правила провайдера (Stripe prohibited businesses)

> **iOS / digital goods:** Apple historically limited card payments for digital goods.  
> Если iOS-оплата блокируется, используйте десктоп/Android Telegram или уточните политику провайдера.

## Команды

| Команда | Действие |
|---------|----------|
| `/start` | меню планов |
| `/start buy_month` | счёт на месяц |
| `/buy` | меню |
| `/terms` | условия |
| `/support` | поддержка |
| `/help` | справка |

## API Worker

| Method | Path | Описание |
|--------|------|----------|
| GET | `/health` | статус + цены + hasProviderToken |
| POST | `/claim` | `{ "token": "v1.…" }` → `{ ok, plan, days }` |
| POST | `/webhook/<WEBHOOK_SECRET>` | Telegram updates |
