import { buildSystemPrompt, type CoachApiContext } from './systemPrompt';

export interface Env {
  /** Free tier: https://console.groq.com */
  GROQ_API_KEY?: string;
  LLM_MODEL?: string;
  LLM_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
  /** @deprecated use GROQ_API_KEY */
  XAI_API_KEY?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CoachRequestBody {
  message: string;
  context: CoachApiContext;
  history?: ChatMessage[];
}

const MAX_MESSAGE = 1200;
const MAX_HISTORY = 16;
/** Per-IP soft limit via Cache API (audit P0.6) */
const RATE_LIMIT_PER_MINUTE = 20;

/** Free default: Groq + Llama (OpenAI-compatible) */
const DEFAULT_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

const CRISIS_MARKERS =
  /суицид|самоубий|покончить с собой|убить себя|suicid|kill myself|end my life|self[- ]?harm|самоповрежд/i;

function crisisFallback(lang: string): string {
  if (lang === 'en') {
    return [
      'I’m really sorry you’re going through this. I’m not a crisis service and can’t help in an emergency.',
      'Please reach out to people nearby or a local emergency number, or the IASP resources: https://www.iasp.info/suicidalthoughts/',
      'You matter. When you’re ready, we can talk about ordinary day planning — but your safety comes first.',
    ].join('\n');
  }
  return [
    'Мне жаль, что вам сейчас так тяжело. Я не служба экстренной помощи и не могу заменить её.',
    'Пожалуйста, обратитесь к близким или по местному номеру экстренной помощи. Ресурсы IASP: https://www.iasp.info/suicidalthoughts/',
    'Вы важны. Когда будете готовы — можем говорить о спокойном плане дня, но безопасность — прежде всего.',
  ].join('\n');
}

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  // Fail closed: if allow-list is empty, only localhost
  const list = allowed.length ? allowed : [];
  const ok =
    origin &&
    (list.includes(origin) ||
      list.includes('*') ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : list[0] || 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

async function rateLimitOk(request: Request): Promise<boolean> {
  try {
    const ip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      'unknown';
    const bucket = Math.floor(Date.now() / 60_000);
    const keyUrl = `https://astronavigator-coach.rate-limit.internal/${ip}/${bucket}`;
    const cache = caches.default;
    const cacheKey = new Request(keyUrl);
    const hit = await cache.match(cacheKey);
    let count = 0;
    if (hit) {
      count = Number(await hit.text()) || 0;
    }
    if (count >= RATE_LIMIT_PER_MINUTE) return false;
    const res = new Response(String(count + 1), {
      headers: { 'Cache-Control': 'max-age=120' },
    });
    await cache.put(cacheKey, res);
    return true;
  } catch {
    // If cache unavailable, allow (don't take coach offline)
    return true;
  }
}

function json(data: unknown, status: number, cors: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
    },
  });
}

function resolveApiKey(env: Env): string | undefined {
  return env.GROQ_API_KEY || env.XAI_API_KEY;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = (env.ALLOWED_ORIGINS || '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, allowed);
    const apiKey = resolveApiKey(env);
    const model = env.LLM_MODEL || DEFAULT_MODEL;
    const base = (env.LLM_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json(
        {
          ok: true,
          service: 'astronavigator-coach',
          provider: 'groq',
          model,
          hasKey: Boolean(apiKey),
        },
        200,
        cors
      );
    }

    if (request.method !== 'POST' || url.pathname !== '/coach') {
      return json({ error: 'Not found' }, 404, cors);
    }

    if (!(await rateLimitOk(request))) {
      return json({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, cors);
    }

    if (!apiKey) {
      return json(
        {
          error:
            'GROQ_API_KEY not configured. Get a free key at https://console.groq.com and run: wrangler secret put GROQ_API_KEY',
        },
        503,
        cors
      );
    }

    let body: CoachRequestBody;
    try {
      body = (await request.json()) as CoachRequestBody;
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const message = (body.message || '').trim();
    if (!message || message.length > MAX_MESSAGE) {
      return json({ error: 'Invalid message' }, 400, cors);
    }
    if (!body.context || typeof body.context.personalNumber !== 'number') {
      return json({ error: 'Missing context' }, 400, cors);
    }

    const lang = body.context.lang === 'en' ? 'en' : 'ru';
    if (CRISIS_MARKERS.test(message)) {
      return json(
        {
          reply: crisisFallback(lang),
          model: 'safety-fallback',
          source: 'safety',
          provider: 'local',
        },
        200,
        cors
      );
    }

    const system = buildSystemPrompt({
      ...body.context,
      lang,
    });

    const history = (body.history || [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-MAX_HISTORY)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).slice(0, MAX_MESSAGE),
      }));

    try {
      const llmRes = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 700,
          messages: [
            { role: 'system', content: system },
            ...history,
            { role: 'user', content: message },
          ],
        }),
      });

      if (!llmRes.ok) {
        const errText = await llmRes.text();
        console.error('LLM error', llmRes.status, errText.slice(0, 400));
        return json(
          {
            error: 'Upstream model error',
            status: llmRes.status,
          },
          502,
          cors
        );
      }

      const data = (await llmRes.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        return json({ error: 'Empty model reply' }, 502, cors);
      }

      return json(
        {
          reply,
          model,
          source: 'llm',
          provider: 'groq',
        },
        200,
        cors
      );
    } catch (e) {
      console.error('coach fetch failed', e);
      return json({ error: 'Coach request failed' }, 500, cors);
    }
  },
};
