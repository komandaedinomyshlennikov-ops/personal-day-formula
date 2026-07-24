import { buildSystemPrompt, type CoachApiContext } from './systemPrompt';

export interface Env {
  XAI_API_KEY: string;
  XAI_MODEL?: string;
  XAI_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
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

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  const ok =
    origin &&
    (allowed.includes(origin) ||
      allowed.includes('*') ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(
  data: unknown,
  status: number,
  cors: HeadersInit
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = (env.ALLOWED_ORIGINS || '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json(
        {
          ok: true,
          service: 'astronavigator-coach',
          model: env.XAI_MODEL || 'grok-4.5',
          hasKey: Boolean(env.XAI_API_KEY),
        },
        200,
        cors
      );
    }

    if (request.method !== 'POST' || url.pathname !== '/coach') {
      return json({ error: 'Not found' }, 404, cors);
    }

    if (!env.XAI_API_KEY) {
      return json(
        { error: 'XAI_API_KEY not configured on server' },
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

    const system = buildSystemPrompt({
      ...body.context,
      lang: body.context.lang === 'en' ? 'en' : 'ru',
    });

    const history = (body.history || [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .slice(-MAX_HISTORY)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).slice(0, MAX_MESSAGE),
      }));

    const model = env.XAI_MODEL || 'grok-4.5';
    const base = (env.XAI_BASE_URL || 'https://api.x.ai/v1').replace(/\/$/, '');

    try {
      const xaiRes = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.XAI_API_KEY}`,
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

      if (!xaiRes.ok) {
        const errText = await xaiRes.text();
        console.error('xAI error', xaiRes.status, errText.slice(0, 400));
        return json(
          {
            error: 'Upstream model error',
            status: xaiRes.status,
          },
          502,
          cors
        );
      }

      const data = (await xaiRes.json()) as {
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
          source: 'xai',
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
