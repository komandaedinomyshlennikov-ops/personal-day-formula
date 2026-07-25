# Telegram Pay Bot — автооплата Stars → unlock

Бот принимает оплату **Telegram Stars** и сразу шлёт ссылку `#/unlock?token=v1.…`.  
Приложение вызывает `POST /claim` и активирует план. Коды вводить не нужно.

```
/start → план → Stars invoice → successful_payment
       → signed token → #/unlock → POST /claim → Pro
```

## Быстрый старт

### 1. Создать бота

1. [@BotFather](https://t.me/BotFather) → `/newbot`
2. Сохранить **BOT_TOKEN** и **username** (без @)
3. Stars-инвойсы: `provider_token` пустой — отдельный эквайринг не нужен

### 2. Секреты + деплой

```bash
cd telegram-bot
npm install --legacy-peer-deps

openssl rand -hex 24   # → WEBHOOK_SECRET
openssl rand -hex 32   # → UNLOCK_SECRET

# Cloudflare login (один раз)
npx wrangler login

npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler secret put UNLOCK_SECRET

# BOT_USERNAME уже: Sacrum_lab_bot
npx wrangler deploy
# → https://astronavigator-pay-bot.<account>.workers.dev
```

### 3. Webhook

```bash
export BOT_TOKEN=...
export WEBHOOK_SECRET=...
export WORKER_URL=https://astronavigator-pay-bot.<account>.workers.dev
npm run set-webhook

curl -s "$WORKER_URL/health"
```

### 4. Фронт (GitHub Secrets + rebuild Pages)

```
VITE_TELEGRAM_BOT_USERNAME=Sacrum_lab_bot
VITE_PAY_API_URL=https://astronavigator-pay-bot.<account>.workers.dev
```

После деплоя Pages кнопка «Оплатить в Telegram» ведёт на:

`https://t.me/Sacrum_lab_bot?start=buy_year`

CI: `.github/workflows/deploy-pay-bot.yml` (код Worker),  
секреты бота **не** из GitHub — только через `wrangler secret put`.

## Цены в Stars

`wrangler.toml` → `STARS_MONTH` / `STARS_YEAR` / `STARS_LIFETIME`.  
Подстройте под курс Stars и маржу.

## Опционально: одноразовые claim

```bash
npx wrangler kv namespace create UNLOCK_TOKENS
# id → wrangler.toml [[kv_namespaces]] binding = "UNLOCK_KV"
```

`/claim` пишет `used:<jti>` — повторное использование ссылки → 409.

## Команды

| Команда | Действие |
|---------|----------|
| `/start` | меню планов |
| `/start buy_month` | счёт на месяц |
| `/buy` | меню |
| `/help` | справка |

## API Worker

| Method | Path | Описание |
|--------|------|----------|
| GET | `/health` | статус + цены Stars |
| POST | `/claim` | `{ "token": "v1.…" }` → `{ ok, plan, days }` |
| POST | `/webhook/<WEBHOOK_SECRET>` | Telegram updates |

## Безопасность

- `WEBHOOK_SECRET` в path — не коммитить
- `UNLOCK_SECRET` только на Worker
- Legacy `MONTH-4915` — только ручной fallback, не в публичных постах

