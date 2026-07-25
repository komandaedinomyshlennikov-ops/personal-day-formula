# Telegram Pay Bot — Ammer Pay → unlock

Оплата через [Telegram Bot Payments](https://core.telegram.org/bots/payments)  
с провайдером **[Ammer Pay](https://ammer-tech.github.io/AmmerPayBotDocumentation/)**.

После оплаты бот шлёт `#/unlock?token=v1.…` → приложение `POST /claim` → Pro.

```
/start → план → sendInvoice(provider_token = Ammer Gateway Secret)
       → pre_checkout → ok
       → successful_payment → signed unlock link
```

Официально: [Ammer Telegram Payments](https://ammer.group/telegram_payments) · [docs](https://ammer-tech.github.io/AmmerPayBotDocumentation/)

---

## 1. Аккаунт Ammer

1. [Merchant Hub](https://merchants.ammer.io) — зарегистрироваться (если ещё нет)
2. Подготовить **Ammer Card**, на которую будут падать платежи

## 2. Подключить Ammer к боту (BotFather)

По [Ammer Pay Bot Documentation](https://ammer-tech.github.io/AmmerPayBotDocumentation/):

1. [@BotFather](https://t.me/BotFather) → `/mybots` → **@Sacrum_lab_bot**
2. **Payments**
3. Выбрать **Ammer Pay** → **Connect Ammer Pay Live**
4. Вернуться в BotFather — скопировать **API Key / token** провайдера  
   (в доке Ammer это **Gateway Secret**)
5. Bot Token бота у вас уже есть (`BOT_TOKEN`)

## 3. Sales Channel в Merchant Hub

В Ammer Merchant Hub → Telegram Sales Channel:

| Поле | Что вписать |
|------|-------------|
| Channel type | Telegram Bot |
| Ammer Card | карта для приёма |
| Name | например `AstroNavigator` |
| Bot Token | только если создаёте **новый** shop-bot; для **существующего** `@Sacrum_lab_bot` — по доке можно не трогать item list |
| **Gateway Secret** | token из BotFather (Ammer Pay) |

Подробно: [Ammer docs Step 3](https://ammer-tech.github.io/AmmerPayBotDocumentation/)

## 4. Секреты Worker

```bash
cd telegram-bot
npm install --legacy-peer-deps

npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler secret put UNLOCK_SECRET

# ← Gateway Secret из BotFather / Ammer (это provider_token в sendInvoice)
npx wrangler secret put PAYMENT_PROVIDER_TOKEN

npx wrangler deploy
```

Webhook:

```bash
export BOT_TOKEN=...
export WEBHOOK_SECRET=...
export WORKER_URL=https://astronavigator-pay-bot.astronavigator.workers.dev
npm run set-webhook

curl -s "$WORKER_URL/health"
# ожидайте: "hasProviderToken": true
```

## 5. Цены

`wrangler.toml`:

```toml
PAY_CURRENCY = "USD"
USD_MONTH = "10"      # → 1000 cents в invoice
USD_YEAR = "50"
USD_LIFETIME = "100"
```

## 6. Фронт

```
VITE_TELEGRAM_BOT_USERNAME=Sacrum_lab_bot
VITE_PAY_API_URL=https://astronavigator-pay-bot.astronavigator.workers.dev
```

Кнопка → `https://t.me/Sacrum_lab_bot?start=buy_year`

## 7. Как это стыкуется с кодом

Наш Worker уже шлёт стандартный `sendInvoice`:

- `provider_token` = **Ammer Gateway Secret** (`PAYMENT_PROVIDER_TOKEN`)
- `currency` = `PAY_CURRENCY` (USD)
- `prices[].amount` = доллары × 100 (центы)
- без доставки (`need_shipping_address: false`)

Отдельный SDK Ammer **не нужен**: они — payment provider Telegram, как Stripe.

## Команды бота

| Команда | Действие |
|---------|----------|
| `/start` | меню планов |
| `/start buy_month` | счёт на месяц |
| `/buy` | тарифы |
| `/terms` | условия |
| `/support` | поддержка |
| `/help` | справка |

## API

| Method | Path | Описание |
|--------|------|----------|
| GET | `/health` | `hasProviderToken`, цены |
| POST | `/claim` | unlock token → plan |
| POST | `/webhook/<WEBHOOK_SECRET>` | Telegram updates |

## Если invoice не создаётся

1. `curl …/health` → `hasProviderToken` должен быть `true`
2. Gateway Secret без лишних пробелов/переносов
3. Ammer Live подключён в BotFather и настроен Sales Channel в Hub
4. Валюта `USD` доступна у провайдера; при необходимости смените `PAY_CURRENCY` (и согласуйте с Ammer)
