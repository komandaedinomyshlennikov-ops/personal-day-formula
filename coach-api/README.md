# AstroNavigator Coach API — free LLM (Groq + Llama)

Server-side proxy so the browser never sees the API key.

**Provider:** [Groq](https://console.groq.com) free tier  
**Default model:** `llama-3.1-8b-instant` (fast, free)  
**Optional:** `llama-3.3-70b-versatile` (better quality, still free-tier)

## Trust model

1. **Formula** — calculated in the app  
2. **Interpretation** — day story in the app  
3. **Coach** — Llama explains / asks questions (does **not** claim destiny)

## Setup (macOS — copy step by step)

> Важно: запускайте из папки проекта, **не** из `~` (домашней).

```bash
# 0) перейти в API
cd ~/personal-day-formula/coach-api

# 1) зависимости (уже можно после git pull)
npm install --legacy-peer-deps

# 2) бесплатный ключ: https://console.groq.com → API Keys → Create API Key
#    скопируйте ключ (gsk_...)

# 3) вход в Cloudflare (откроется браузер — один раз)
npx wrangler login
# когда спросит Ok to proceed? → введите y и Enter

# 4) сохранить ключ на Worker (вставьте gsk_... и Enter, символы не видны — так и надо)
npx wrangler secret put GROQ_API_KEY

# 5) деплой
npx wrangler deploy
```

В конце `deploy` будет URL, например  
`https://astronavigator-coach.XXXX.workers.dev` — **скопируйте его целиком**.

## Connect the app

Root of monorepo `.env`:

```bash
VITE_COACH_API_URL=https://astronavigator-coach.<you>.workers.dev
```

If unset → app uses **local rule engine** (no LLM).

## Local dev

```bash
# terminal 1
cd coach-api && npm run dev

# terminal 2
cd .. && VITE_COACH_API_URL=http://127.0.0.1:8787 npm run dev
```

## Switch model (optional)

In `wrangler.toml`:

```toml
LLM_MODEL = "llama-3.3-70b-versatile"
```

Or any OpenAI-compatible free endpoint via `LLM_BASE_URL` + `GROQ_API_KEY` (or other bearer key).

## Test

```bash
curl -s http://127.0.0.1:8787/health
curl -s -X POST http://127.0.0.1:8787/coach \
  -H 'Content-Type: application/json' \
  -d '{"message":"Сегодня важна работа","context":{"personalNumber":7,"dateKey":"2026-07-24","lang":"ru","storyBody":"День анализа"}}'
```
