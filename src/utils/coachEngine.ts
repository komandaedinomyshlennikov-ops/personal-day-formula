/**
 * Interpretive coach — NOT an oracle.
 * Layer 3 of trust: formula → interpretation → helper that asks questions
 * and applies day meaning to the user's situation.
 *
 * Designed so a real LLM backend can replace generateCoachReply later
 * while keeping the same context shape.
 */

import type { TFunction } from 'i18next';
import { getPersonalDayStory, getDayTone, type DayTone } from '@/utils/actionableDay';
import { getEnergyInfo } from '@/utils/numerology';
import type {
  CoachMessage,
  CoachProfile,
  DayCheckIn,
  FocusArea,
} from '@/utils/coachMemory';
import { bestDayNumbers } from '@/utils/coachMemory';

export interface CoachContext {
  displayName?: string;
  personalNumber: number;
  dateKey: string;
  profile: CoachProfile;
  checkIns: DayCheckIn[];
  recentMessages: CoachMessage[];
  lang: 'ru' | 'en';
}

const FOCUS_RU: Record<FocusArea, string> = {
  work: 'работе',
  family: 'семье',
  rest: 'отдыхе',
  money: 'деньгах',
  relations: 'отношениях',
  other: 'том, что сейчас важно',
};

const FOCUS_EN: Record<FocusArea, string> = {
  work: 'work',
  family: 'family',
  rest: 'rest',
  money: 'money',
  relations: 'relationships',
  other: 'what matters most right now',
};

function isRu(lang: string) {
  return lang.startsWith('ru');
}

function pickFocus(text: string): FocusArea | null {
  const t = text.toLowerCase();
  if (/работ|career|job|проект|дел|office|собес|meeting|встреч/.test(t)) return 'work';
  if (/семь|дети|родител|family|home|дом/.test(t)) return 'family';
  if (/отдых|сон|устал|rest|sleep|восстанов/.test(t)) return 'rest';
  if (/деньг|финанс|куп|money|buy|бюджет|зарплат/.test(t)) return 'money';
  if (/отношен|любов|партн|жен|муж|love|partner|друг/.test(t)) return 'relations';
  return null;
}

function softToneLine(tone: DayTone, ru: boolean): string {
  if (tone === 'favorable') {
    return ru
      ? 'По формуле это скорее день для более активных шагов — если вы к ним готовы.'
      : 'By the formula, this leans toward active steps — if you feel ready.';
  }
  if (tone === 'challenging') {
    return ru
      ? 'По формуле сегодня спокойнее не форсировать новое, а закрывать хвосты — если есть выбор.'
      : 'By the formula, it’s calmer not to force new starts and to close open loops — if you have a choice.';
  }
  return ru
    ? 'По формуле день ровный: удобен для текучки без гонки.'
    : 'By the formula, it’s a steady day — good for routine without rushing.';
}

/** Opening message when user opens “Discuss this day”. */
export function buildCoachOpening(
  ctx: CoachContext,
  t: TFunction
): string {
  const ru = isRu(ctx.lang);
  const story = getPersonalDayStory(ctx.personalNumber, t);
  const energy = getEnergyInfo(ctx.personalNumber, t);
  const name = ctx.displayName?.trim();
  const hi = name
    ? ru
      ? `${name}, давайте разберём сегодня спокойно.`
      : `${name}, let’s look at today calmly.`
    : ru
      ? 'Давайте разберём сегодня спокойно.'
      : 'Let’s look at today calmly.';

  const tip = (energy.positive || []).slice(0, 2).join(ru ? '; ' : '; ');

  const memoryBits: string[] = [];
  if (ctx.profile.goal) {
    memoryBits.push(
      ru
        ? `Вы отмечали цель: «${ctx.profile.goal}».`
        : `You noted a goal: “${ctx.profile.goal}”.`
    );
  }
  const lastCheck = [...ctx.checkIns].sort((a, b) => b.dateKey.localeCompare(a.dateKey))[0];
  if (lastCheck?.note) {
    memoryBits.push(
      ru
        ? `В последней заметке вы писали: «${lastCheck.note.slice(0, 80)}${lastCheck.note.length > 80 ? '…' : ''}».`
        : `In your last check-in you wrote: “${lastCheck.note.slice(0, 80)}${lastCheck.note.length > 80 ? '…' : ''}”.`
    );
  }

  const best = bestDayNumbers(ctx.checkIns, 2)[0];
  if (best && best.avgMatch >= 4) {
    memoryBits.push(
      ru
        ? `По вашим отметкам дни №${best.number} чаще совпадали с реальностью (ср. ${best.avgMatch.toFixed(1)}/5).`
        : `From your ratings, day №${best.number} often matched reality (avg ${best.avgMatch.toFixed(1)}/5).`
    );
  }

  const lines = [
    hi,
    '',
    ru
      ? `Сегодня по расчёту — день №${ctx.personalNumber} (${energy.planet}).`
      : `Today by calculation — day №${ctx.personalNumber} (${energy.planet}).`,
    story.storyBody,
    softToneLine(story.tone, ru),
  ];

  if (tip) {
    lines.push(
      '',
      ru ? `Что часто подходит в такие дни: ${tip}.` : `What often fits on such days: ${tip}.`
    );
  }

  if (memoryBits.length) {
    lines.push('', ...memoryBits);
  }

  lines.push(
    '',
    ru
      ? 'Я не предсказываю будущее — помогаю связать расчёт дня с вашей ситуацией.'
      : 'I don’t predict the future — I help connect the day formula to your situation.',
    '',
    ru
      ? 'Что сегодня для вас самое важное? Работа, семья, отдых, деньги, отношения — или напишите своими словами.'
      : 'What matters most today? Work, family, rest, money, relationships — or write in your own words.'
  );

  return lines.join('\n');
}

/** Reply to user — coaching questions + formula-aware soft advice. */
export function generateCoachReply(
  userText: string,
  ctx: CoachContext,
  t: TFunction
): string {
  const ru = isRu(ctx.lang);
  const trimmed = userText.trim();
  const tone = getDayTone(ctx.personalNumber);
  const energy = getEnergyInfo(ctx.personalNumber, t);
  const focus = pickFocus(trimmed) || ctx.profile.primaryFocus || null;
  const focusLabel = focus
    ? ru
      ? FOCUS_RU[focus]
      : FOCUS_EN[focus]
    : null;

  // Stats insight when user asks about patterns
  if (/статистик|pattern|часто|обычно|совпад|history|истор/i.test(trimmed)) {
    const best = bestDayNumbers(ctx.checkIns, 2).slice(0, 3);
    if (!best.length) {
      return ru
        ? 'Пока мало вечерних отметок. Через пару недель смогу показать, в какие дни вам обычно легче.\n\nХотите вечером отметить, насколько день совпал с реальностью?'
        : 'Not enough evening check-ins yet. In a couple of weeks I can show which days usually feel easier for you.\n\nWant to rate how well today matched reality tonight?';
    }
    const list = best
      .map((b) =>
        ru
          ? `• день №${b.number}: ${b.count} раз, совпадение ~${b.avgMatch.toFixed(1)}/5`
          : `• day №${b.number}: ${b.count} times, match ~${b.avgMatch.toFixed(1)}/5`
      )
      .join('\n');
    return (
      (ru
        ? 'Вот что видно по вашим отметкам (это ваша история, не «истина» формулы):\n\n'
        : 'Here’s what your check-ins show (your history, not formula “truth”):\n\n') +
      list +
      (ru
        ? '\n\nХотите связать это с сегодняшним днём?'
        : '\n\nWant to connect this with today?')
    );
  }

  const doList = (energy.positive || []).slice(0, 3);
  const avoid = (energy.negative || []).slice(0, 2);

  const parts: string[] = [];

  if (focusLabel) {
    parts.push(
      ru
        ? `Ок, смотрим через призму ${focusLabel}.`
        : `Okay, looking through the lens of ${focusLabel}.`
    );
  } else {
    parts.push(
      ru
        ? 'Спасибо, что поделились.'
        : 'Thanks for sharing.'
    );
  }

  parts.push(softToneLine(tone, ru));

  if (focus === 'work') {
    parts.push(
      ru
        ? tone === 'challenging'
          ? 'Для работы сегодня я бы приоритизировал закрытие хвостов и подготовку, а важные запуски — если можно перенести — оставил на более «зелёный» день.'
          : 'Для работы можно взять один главный результат на день и не распыляться. Если есть переговоры или собеседование — это как раз может лечь в ритм дня.'
        : tone === 'challenging'
          ? 'For work, I’d prioritize closing open loops and prep; if a major launch can wait, keep it for a greener day.'
          : 'For work, pick one main outcome and don’t scatter. Meetings or interviews may fit today’s rhythm.'
    );
  } else if (focus === 'family' || focus === 'relations') {
    parts.push(
      ru
        ? 'В близких отношениях полезнее тон и пауза, чем «продавить» своё. Если назревает разговор — выберите спокойный формат.'
        : 'With close people, tone and pause beat forcing your point. If a talk is due, choose a calmer setting.'
    );
  } else if (focus === 'rest') {
    parts.push(
      ru
        ? 'Если ресурс низкий — это не «провал дня», а сигнал. Можно сократить вечер и лечь раньше: иногда это лучшее решение.'
        : 'If energy is low, that’s not a failed day — a signal. Shorten the evening and sleep earlier; sometimes that’s the best move.'
    );
  } else if (focus === 'money') {
    parts.push(
      ru
        ? tone === 'challenging'
          ? 'С деньгами сегодня я бы не торопился с крупными необратимыми шагами, если есть выбор. Можно спокойно сверить бюджет и отложить импульс.'
          : 'С финансами можно разобрать цифры и условия. Крупные шаги — только если вы уже всё проверили.'
        : tone === 'challenging'
          ? 'With money, I wouldn’t rush irreversible steps if you have a choice. Review the budget and delay impulse moves.'
          : 'With finances, review numbers and terms. Big moves only if you’ve already checked them.'
    );
  }

  if (doList.length) {
    parts.push(
      '',
      ru ? 'Что обычно хорошо ложится на такой день:' : 'What often fits a day like this:',
      ...doList.map((x) => `• ${x}`)
    );
  }
  if (avoid.length) {
    parts.push(
      '',
      ru ? 'Если можете — мягче с этим:' : 'If you can — go softer on:',
      ...avoid.map((x) => `• ${x}`)
    );
  }

  if (ctx.profile.goal && /цел|goal|план|plan|бизнес|business/i.test(trimmed)) {
    parts.push(
      '',
      ru
        ? `Про цель «${ctx.profile.goal}»: сделайте сегодня один маленький конкретный шаг (письмо, звонок, список) — без давления «закрыть всё».`
        : `About your goal “${ctx.profile.goal}”: take one small concrete step today (email, call, list) — no pressure to finish everything.`
    );
  }

  parts.push(
    '',
    ru
      ? 'Это не приказ — только способ посмотреть на день. Что из этого реально впишется в ваши планы на ближайшие часы?'
      : 'Not an order — just a way to look at the day. What from this can fit the next few hours for you?'
  );

  return parts.join('\n');
}

export const FOCUS_CHIPS: { id: FocusArea; ru: string; en: string }[] = [
  { id: 'work', ru: 'Работа', en: 'Work' },
  { id: 'family', ru: 'Семья', en: 'Family' },
  { id: 'rest', ru: 'Отдых', en: 'Rest' },
  { id: 'money', ru: 'Деньги', en: 'Money' },
  { id: 'relations', ru: 'Отношения', en: 'Relations' },
];
