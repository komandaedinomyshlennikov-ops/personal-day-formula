# Оплата через Telegram Bot Payments

Документация: [core.telegram.org/bots/payments](https://core.telegram.org/bots/payments)

## Автопоток

1. Пользователь выбирает план → **«Оплатить в Telegram»**.
2. Открывается бот: `t.me/<Bot>?start=buy_year`.
3. Бот шлёт **invoice** (карта / Apple Pay / Google Pay через провайдера).
4. После оплаты — кнопка **«Открыть доступ»** → `#/unlock?token=v1.…`
5. Приложение: `POST /claim` → Pro. **Код не нужен.**

```
Приложение                    Telegram                 Worker
   │ «Оплатить» ──► t.me/Bot?start=buy_year              │
   │                      │  sendInvoice (provider)      │
   │                      │  pre_checkout → ok           │
   │                      │  successful_payment ────────►│ mint token
   │                      │◄── unlock link               │
   │ POST /claim ───────────────────────────────────────►│ verify
```

## Подключение провайдера

1. BotFather → `/mybots` → bot → **Payments**
2. Stripe TEST MODE (разработка) или LIVE (бой)
3. `wrangler secret put PAYMENT_PROVIDER_TOKEN`

Инструкция: [`telegram-bot/README.md`](../telegram-bot/README.md)

## Цены (USD)

| План | Сумма |
|------|-------|
| Месяц | $10 |
| Год | $50 |
| Навсегда | $100 |

## Переменные

| Где | Что |
|-----|-----|
| Worker secret | `PAYMENT_PROVIDER_TOKEN`, `BOT_TOKEN`, `UNLOCK_SECRET`, `WEBHOOK_SECRET` |
| Pages build | `VITE_TELEGRAM_BOT_USERNAME`, `VITE_PAY_API_URL` |

> Telegram **не** берёт комиссию; комиссия — у Stripe/другого провайдера.  
> iOS может ограничивать оплату цифровых товаров картой — см. docs Telegram / Apple.
