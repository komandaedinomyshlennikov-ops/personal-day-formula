# Аудит перед публикацией (26 июля 2026)

Полный отчёт мультидисциплинарной команды сохранён как входной артефакт.

## Статус remediation (код)

| ID | Тема | Статус |
|----|------|--------|
| P0.1 | Client paywall / entitlement | **В работе:** signed entitlement + `/verify`, paid fields без entitlement игнорируются |
| P0.2 | Admin birthdate backdoor | **Исправлено:** только `import.meta.env.DEV` или `VITE_ENABLE_ADMIN_UNLOCK=true` |
| P0.3 | Legacy activation codes | **Исправлено:** отключены в production build |
| P0.4 | Telegram digital goods / Stars | **Продукт:** задокументировано; `PAY_MODE=stars\|fiat` |
| P0.5 | UNLOCK_KV one-time claim | **Исправлено:** KV required when `REQUIRE_UNLOCK_KV=true` |
| P0.6 | Coach rate limit | **Исправлено:** IP throttle via Cache API |

## Открытые продуктовые решения

1. Client-trust vs full server-truth subscription (частично closed via entitlement verify)
2. 9 unused locales
3. Legal entity for payments
4. Platforms: PWA only vs Mini App/stores (Stars)
5. Custom domain budget
