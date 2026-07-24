/**
 * Client for Coach API (SpaceXAI / xAI via server proxy).
 * Falls back to local rule engine when API is unavailable.
 */

import type { TFunction } from 'i18next';
import {
  generateCoachReply as localReply,
  type CoachContext,
} from '@/utils/coachEngine';
import { getEnergyInfo } from '@/utils/numerology';
import { getPersonalDayStory } from '@/utils/actionableDay';

export type CoachSource = 'xai' | 'local' | 'error-local';

export interface CoachReplyResult {
  text: string;
  source: CoachSource;
}

function apiBase(): string {
  const raw = (import.meta.env.VITE_COACH_API_URL as string | undefined)?.trim();
  if (!raw) return '';
  return raw.replace(/\/$/, '');
}

export function isCoachApiConfigured(): boolean {
  return Boolean(apiBase());
}

function buildRemoteContext(ctx: CoachContext, t: TFunction) {
  const energy = getEnergyInfo(ctx.personalNumber, t);
  const story = getPersonalDayStory(ctx.personalNumber, t);
  return {
    displayName: ctx.displayName,
    personalNumber: ctx.personalNumber,
    dateKey: ctx.dateKey,
    planet: energy.planet,
    storyTitle: story.storyTitle,
    storyBody: story.storyBody,
    tone: story.tone,
    doList: (energy.positive || []).slice(0, 4),
    avoidList: (energy.negative || []).slice(0, 3),
    profile: {
      city: ctx.profile.city,
      work: ctx.profile.work,
      goal: ctx.profile.goal,
      primaryFocus: ctx.profile.primaryFocus,
    },
    recentCheckIns: ctx.checkIns.slice(-8).map((c) => ({
      dateKey: c.dateKey,
      personalNumber: c.personalNumber,
      match: c.match,
      note: c.note,
    })),
    lang: ctx.lang,
  };
}

/** Prefer Grok via worker; on any failure use local interpretive engine. */
export async function generateCoachReplySmart(
  userText: string,
  ctx: CoachContext,
  t: TFunction
): Promise<CoachReplyResult> {
  const base = apiBase();
  if (!base) {
    return { text: localReply(userText, ctx, t), source: 'local' };
  }

  try {
    const history = ctx.recentMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.text,
      }));

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 28000);

    const res = await fetch(`${base}/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText.slice(0, 1200),
        context: buildRemoteContext(ctx, t),
        history,
      }),
      signal: controller.signal,
    });
    window.clearTimeout(timer);

    if (!res.ok) {
      console.warn('[coach] API status', res.status);
      return { text: localReply(userText, ctx, t), source: 'error-local' };
    }

    const data = (await res.json()) as { reply?: string };
    if (!data.reply?.trim()) {
      return { text: localReply(userText, ctx, t), source: 'error-local' };
    }

    return { text: data.reply.trim(), source: 'xai' };
  } catch (e) {
    console.warn('[coach] API failed, local fallback', e);
    return { text: localReply(userText, ctx, t), source: 'error-local' };
  }
}
