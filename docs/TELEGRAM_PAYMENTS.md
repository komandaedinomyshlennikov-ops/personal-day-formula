# Оплата через Telegram + Ammer Pay

- Telegram API: [Bot Payments](https://core.telegram.org/bots/payments)  
- Провайдер: [Ammer Pay Bot Documentation](https://ammer-tech.github.io/AmmerPayBotDocumentation/)  
- Сайт: [ammer.group/telegram_payments](https://ammer.group/telegram_payments)

## Поток

1. В приложении — **«Оплатить в Telegram»** → `t.me/Sacrum_lab_bot?start=buy_…`
2. Бот шлёт **invoice** с `provider_token` = Ammer **Gateway Secret**
3. Пользователь платит в Telegram (Ammer / Ammer Card)
4. `successful_payment` → ссылка `#/unlock?token=v1.…`
5. Приложение: `POST /claim` → Pro

## Подключение Ammer (кратко)

1. Аккаунт [Merchant Hub](https://merchants.ammer.io)
2. BotFather → bot → **Payments** → **Ammer Pay** → Connect Live → скопировать **Gateway Secret**
3. Merchant Hub → Telegram Sales Channel: Ammer Card + Gateway Secret
4. Worker:

```bash
printf '%s' 'GATEWAY_SECRET' | npx wrangler secret put PAYMENT_PROVIDER_TOKEN
```

Полная инструкция: [`telegram-bot/README.md`](../telegram-bot/README.md)

## Цены (USD)

| План | Сумма |
|------|-------|
| Месяц | $10 |
| Год | $50 |
| Навсегда | $100 |

## Secrets

| Secret | Назначение |
|--------|------------|
| `BOT_TOKEN` | токен @Sacrum_lab_bot |
| `PAYMENT_PROVIDER_TOKEN` | **Ammer Gateway Secret** (BotFather) |
| `UNLOCK_SECRET` | подпись unlock-ссылок |
| `WEBHOOK_SECRET` | path webhook |
| Pages: `VITE_TELEGRAM_BOT_USERNAME`, `VITE_PAY_API_URL` | deep-link + claim |
