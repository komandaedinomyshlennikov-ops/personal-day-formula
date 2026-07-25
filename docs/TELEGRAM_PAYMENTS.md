# Оплата через Telegram (авто + fallback)

## Автопоток (бот + Stars)

1. Пользователь выбирает план → **«Оплатить в Telegram»**.
2. Открывается бот: `t.me/<Bot>?start=buy_year` (или month / lifetime).
3. Бот шлёт **invoice в Telegram Stars (⭐)**.
4. После оплаты бот присылает кнопку **«Открыть доступ»** →  
   `#/unlock?token=v1.…`
5. Приложение вызывает `POST /claim` на Worker, активирует план.  
   **Код вводить не нужно.**

### Что нужно для авто

| Где | Переменная / секрет |
|-----|---------------------|
| BotFather | `BOT_TOKEN` |
| Worker secrets | `BOT_TOKEN`, `UNLOCK_SECRET`, `WEBHOOK_SECRET` |
| GitHub Pages build | `VITE_TELEGRAM_BOT_USERNAME`, `VITE_PAY_API_URL` |

Инструкция: [`telegram-bot/README.md`](../telegram-bot/README.md).

```
Приложение                    Telegram                 Worker
   │ «Оплатить» ──► t.me/Bot?start=buy_year              │
   │                      │  invoice Stars               │
   │                      │  successful_payment ────────►│ mint token
   │                      │◄── ссылка unlock?token=v1…   │
   │ ◄── open unlock ─────┘                              │
   │ POST /claim ───────────────────────────────────────►│ verify HMAC
   │ ◄── { plan, days } ─────────────────────────────────│
   │ activate local Pro                                  │
```

## Fallback (без бота)

Если `VITE_TELEGRAM_BOT_USERNAME` не задан:

1. Кнопка открывает чат с поддержкой (`@tatianageniush`) с готовым текстом.
2. После оплаты вы вручную шлёте unlock-ссылку (legacy-токен).

### Legacy-ссылки (только личка плательщику)

```
https://komandaedinomyshlennikov-ops.github.io/personal-day-formula/#/unlock?token=MONTH-4915
https://komandaedinomyshlennikov-ops.github.io/personal-day-formula/#/unlock?token=YEAR-4915
https://komandaedinomyshlennikov-ops.github.io/personal-day-formula/#/unlock?token=LIFE-4915
```

Токены в клиенте — только SHA-256. Не публикуйте таблицу в открытых постах.

## Безопасность

- `UNLOCK_SECRET` только на Worker — клиент не умеет подделывать `v1.*`
- С KV (`UNLOCK_KV`) claim одноразовый (`used:<jti>`)
- Webhook path: `/webhook/<WEBHOOK_SECRET>`
