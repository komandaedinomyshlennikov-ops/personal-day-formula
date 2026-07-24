# Астронавигатор — ритм дня + личный помощник

Персональный день по дате рождения, спокойная интерпретация и **помощник по обсуждению дня** (не «оракул»).

## Архитектура доверия

1. **Формула** — личный день 1–9  
2. **Интерпретация** — короткий вывод понятным языком  
3. **Помощник** — бесплатная LLM (**Groq + Llama**) через серверный proxy *или* локальный fallback  

ИИ **не предсказывает судьбу** — помогает связать расчёт с вашей ситуацией.

## Стек

- React 19 + TypeScript + Vite 7  
- Tailwind + Framer Motion + i18next  
- Coach API: Cloudflare Worker → **Groq free** (`llama-3.1-8b-instant`)

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

### Подключить бесплатную LLM (опционально)

```bash
# 1) Free key: https://console.groq.com → API Keys
# 2) API (Cloudflare)
cd coach-api && npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy

# 3) Клиент — в корне .env:
# VITE_COACH_API_URL=https://astronavigator-coach.<account>.workers.dev
npm run build
```

Без `VITE_COACH_API_URL` приложение работает на **локальном** помощнике.

Подробно: [coach-api/README.md](coach-api/README.md)

## Деплой

Приложение (SPA) → **GitHub Pages** (`.github/workflows/deploy.yml` на `main`).  
Coach API → Cloudflare Workers (`npm run coach:deploy`).

## Документация

- [Coach API](coach-api/README.md)
- [Анализ AstroNavigator](docs/AstroNavigator_Analysis_and_Recommendations.md)
- [Анализ календаря](docs/Calendar_Analysis_and_Recommendations.md)
- [Аудит локализации](docs/Localization_Audit_Report_AstroNavigator.md)
