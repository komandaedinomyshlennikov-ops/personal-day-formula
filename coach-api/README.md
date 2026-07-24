# AstroNavigator Coach API (SpaceXAI / xAI Grok)

Server-side proxy so the browser never sees `XAI_API_KEY`.

## Trust model

1. **Formula** — calculated in the app  
2. **Interpretation** — day story in the app  
3. **Coach** — Grok explains / asks questions (does **not** claim destiny)

## Setup

```bash
cd coach-api
npm install
npx wrangler login
npx wrangler secret put XAI_API_KEY   # paste key from https://console.x.ai
npx wrangler deploy
```

Copy the worker URL, e.g. `https://astronavigator-coach.<you>.workers.dev`

## Connect the app

Root of monorepo:

```bash
# .env (git-ignored)
VITE_COACH_API_URL=https://astronavigator-coach.<you>.workers.dev
```

Rebuild and deploy GitHub Pages. If `VITE_COACH_API_URL` is empty, the app uses the **local rule engine** fallback.

## Local dev

```bash
# terminal 1
cd coach-api && npm run dev
# → http://127.0.0.1:8787

# terminal 2
cd .. && VITE_COACH_API_URL=http://127.0.0.1:8787 npm run dev
```

## Test

```bash
curl -s http://127.0.0.1:8787/health
curl -s -X POST http://127.0.0.1:8787/coach \
  -H 'Content-Type: application/json' \
  -d '{"message":"Сегодня важна работа","context":{"personalNumber":7,"dateKey":"2026-07-24","lang":"ru","storyBody":"День анализа"}}'
```
