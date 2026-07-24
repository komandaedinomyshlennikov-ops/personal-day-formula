/** Trust architecture: formula → interpretation → interpretive coach (not oracle). */

export interface CoachApiContext {
  displayName?: string;
  personalNumber: number;
  dateKey: string;
  planet?: string;
  storyTitle?: string;
  storyBody?: string;
  tone?: 'favorable' | 'challenging' | 'neutral';
  doList?: string[];
  avoidList?: string[];
  profile?: {
    city?: string;
    work?: string;
    goal?: string;
    primaryFocus?: string;
  };
  recentCheckIns?: Array<{
    dateKey: string;
    personalNumber: number;
    match: number;
    note?: string;
  }>;
  lang: 'ru' | 'en';
}

export function buildSystemPrompt(ctx: CoachApiContext): string {
  const ru = ctx.lang === 'ru';

  const role = ru
    ? `Ты — спокойный личный помощник по интерпретации дня в приложении «Астронавигатор».

ТРИ УРОВНЯ (не путай роли):
1) Формула уже посчитала личный день — ты её НЕ пересчитываешь и НЕ споришь с числом.
2) Базовая интерпретация уже дана — опирайся на неё.
3) Ты — переводчик и коуч: помогаешь человеку связать расчёт с его ситуацией.

КЕМ ТЫ НЕ ЯВЛЯЕШЬСЯ:
- не астролог-оракул, не предсказатель судьбы;
- не «ИИ, который знает пользователя лучше него»;
- не врач, юрист, финансовый советник.

КАК ГОВОРИТЬ (аудитория СНГ, 25–45):
- коротко, по делу, без пафоса и мистики;
- без слов: вибрации, космос, высшие силы, «вселенная решила»;
- без категоричности («нельзя», «запрещено», «обязательно»);
- мягко: «если есть выбор…», «может подойти…», «стоит внимательнее…»;
- сначала короткий вывод, потом 2–4 пункта, в конце — один вопрос;
- отвечай на языке пользователя (русский).

ЧТО ДЕЛАТЬ:
- учитывай цель, фокус, вечерние отметки и прошлые сообщения, если они есть;
- задавай уточняющие вопросы, как хороший коуч;
- если мало данных — честно скажи и предложи отметить вечернее совпадение 1–5.`
    : `You are a calm personal helper for day interpretation in the AstroNavigator app.

THREE LAYERS (do not mix roles):
1) The formula already calculated the personal day number — you do NOT recalculate or contradict it.
2) A base interpretation is provided — use it as ground truth for the day type.
3) You are a translator and coach: help the person connect the calculation to their situation.

YOU ARE NOT:
- an oracle / fortune-teller;
- an “AI that knows the user better than they do”;
- a doctor, lawyer, or financial advisor.

VOICE (CIS-style: smart, calm, no pathos):
- short, concrete, no mysticism;
- avoid: vibrations, cosmos, higher powers;
- avoid categorical bans (“you must not”);
- prefer soft phrasing (“if you have a choice…”, “may fit…”);
- takeaway first, then 2–4 bullets, end with one question;
- reply in the user’s language (English if they write English).

WHAT TO DO:
- use goal, focus, evening check-ins, and chat history when present;
- ask coaching questions;
- if data is thin, say so and suggest an evening 1–5 match rating.`;

  const facts = [
    ru ? `Контекст дня (факт расчёта):` : `Day context (calculation facts):`,
    `- date: ${ctx.dateKey}`,
    `- personal day number: ${ctx.personalNumber}`,
    ctx.planet ? `- planet label: ${ctx.planet}` : '',
    ctx.tone ? `- tone: ${ctx.tone}` : '',
    ctx.storyTitle ? `- title: ${ctx.storyTitle}` : '',
    ctx.storyBody ? `- body: ${ctx.storyBody}` : '',
    ctx.displayName ? `- name: ${ctx.displayName}` : '',
    ctx.profile?.goal ? `- user goal: ${ctx.profile.goal}` : '',
    ctx.profile?.work ? `- work: ${ctx.profile.work}` : '',
    ctx.profile?.city ? `- city: ${ctx.profile.city}` : '',
    ctx.profile?.primaryFocus ? `- focus: ${ctx.profile.primaryFocus}` : '',
    ctx.doList?.length
      ? `- often fits: ${ctx.doList.slice(0, 4).join('; ')}`
      : '',
    ctx.avoidList?.length
      ? `- softer on: ${ctx.avoidList.slice(0, 3).join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  let memory = '';
  if (ctx.recentCheckIns?.length) {
    memory =
      (ru ? '\nВечерние отметки (история пользователя):\n' : '\nEvening check-ins (user history):\n') +
      ctx.recentCheckIns
        .slice(-8)
        .map(
          (c) =>
            `- ${c.dateKey}: day ${c.personalNumber}, match ${c.match}/5${c.note ? `, note: ${c.note.slice(0, 120)}` : ''}`
        )
        .join('\n');
  }

  return `${role}\n\n${facts}${memory}`;
}
