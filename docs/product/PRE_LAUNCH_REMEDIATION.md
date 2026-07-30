# Remediation: аудит 2026-07-26

Связанный отчёт: `PRE_LAUNCH_AUDIT_2026-07-26.md`

## Сделано в коде

### P0.1 Paywall
- Paid-тарифы **без** `entitlement` → `accessTier = none` (правка `localStorage` больше не даёт lifetime).
- `/claim` возвращает long-lived **`entitlement`** (`ent.v1…`).
- `POST /verify` на pay Worker — ревалидация HMAC.
- Клиент: `revalidateEntitlement()` при наличии entitlement.

### P0.2 Admin backdoor
- **Обновлено (продуктовое решение):** дата `1991-03-07` (Андрей) даёт lifetime **по умолчанию** во всех билдах.
- Kill-switch: `VITE_DISABLE_ADMIN_UNLOCK=true`, если нужно полностью убрать path перед жёстким public launch.

### P0.3 Legacy codes
- `activation.ts`: в **production** `resolveActivationCode` всегда `null`.
- Unlock path: legacy только в DEV.

### P0.5 One-time claim
- KV `UNLOCK_KV` создан, id в `telegram-bot/wrangler.toml`.
- `REQUIRE_UNLOCK_KV=true` — `/claim` 503 без KV.

### P0.6 Coach rate limit + crisis
- ~20 req/min/IP через Cache API.
- Safety fallback на маркеры кризиса (RU/EN) без вызова LLM.

## Не закрыто кодом (нужно решение владельца)

### P0.4 Telegram digital goods
- Сейчас: **Ammer/fiat** (`PAY_MODE=fiat`).
- Аудит: для digital goods Telegram может требовать **Stars**.
- Варианты: A) Stars (`PAY_MODE=stars` + доработка invoice), B) оплата вне бота.
- **Нужно явное решение** перед рекламой.

### P1–P2
- E2E Playwright, React.lazy, i18n locales, юрлицо, custom domain — backlog.

## Деплой после merge

```bash
cd telegram-bot && npx wrangler deploy
cd coach-api && npx wrangler deploy
# Pages rebuild подтянет client entitlement logic
```

## Вопросы владельцу (из §7 аудита)

1. Оставляем entitlement+verify как MVP server-truth, или полный аккаунт?
2. 9 локалей — удалять или доводить?
3. Юрлицо/ИП?
4. Только PWA или Mini App/stores?
5. Бюджет на домен?
