# Вшить помощника (LLM) через GitHub

Да — **функции coach API + приложение** можно деплоить автоматически из GitHub.  
Ключ LLM **не** кладётся в код и **не** попадает в браузер.

```
push main
   │
   ├─► workflow deploy-coach.yml
   │      Cloudflare Worker (Llama via Groq)
   │      secret GROQ_API_KEY только на Worker
   │
   └─► workflow deploy-pages.yml
          Vite build + VITE_COACH_API_URL
          → ветка gh-pages (сайт)
```

## Что можно / нельзя

| Через GitHub | Да? |
|--------------|-----|
| Деплой Worker с LLM | ✅ Actions + secrets |
| Сборка сайта с URL API | ✅ `VITE_COACH_API_URL` |
| Хранить `GROQ_API_KEY` в secrets | ✅ только server-side |
| Положить API-ключ в JS фронта | ❌ никогда |
| MCP Cloudflare для Grok-агента | ❌ это настройка **локального** агента, не CI |

## 1. Secrets в GitHub

Репозиторий → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Откуда |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | [Create Token](https://dash.cloudflare.com/profile/api-tokens) → шаблон **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers → правая колонка Account ID |
| `GROQ_API_KEY` | https://console.groq.com → API Keys |
| `VITE_COACH_API_URL` | URL Worker после первого деплоя, например `https://astronavigator-coach.xxx.workers.dev` |

## 2. Первый деплой Worker

1. Добавьте `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GROQ_API_KEY`
2. **Actions → Deploy Coach API → Run workflow** (или push в `coach-api/`)
3. В логе найдите URL Worker
4. Добавьте secret `VITE_COACH_API_URL` = этот URL
5. **Actions → Deploy GitHub Pages → Run workflow**

## 3. GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → branch **`gh-pages`** / root

Сайт:  
`https://komandaedinomyshlennikov-ops.github.io/personal-day-formula/`

## 4. Проверка

```bash
curl -s https://ВАШ-WORKER.workers.dev/health
# {"ok":true,"provider":"groq","hasKey":true,...}
```

В приложении: **Помощник** → статус «Ответ через Llama (Groq)…»

## Workflow-файлы

- `.github/workflows/deploy-coach.yml` — Worker  
- `.github/workflows/deploy-pages.yml` — SPA на `gh-pages`
