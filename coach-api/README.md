# AstroNavigator Coach API — free LLM (Groq + Llama)

Server-side proxy so the browser never sees the API key.

**Provider:** [Groq](https://console.groq.com) free tier  
**Default model:** `llama-3.1-8b-instant` (fast, free)  
**Optional:** `llama-3.3-70b-versatile` (better quality, still free-tier)

## Trust model

1. **Formula** — calculated in the app  
2. **Interpretation** — day story in the app  
3. **Coach** — Llama explains / asks questions (does **not** claim destiny)

## Setup

1. Free key: https://console.groq.com → API Keys  
2. Deploy worker:

```bash
cd coach-api
npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler deploy
```

Copy URL, e.g. `https://astronavigator-coach.<you>.workers.dev`

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
