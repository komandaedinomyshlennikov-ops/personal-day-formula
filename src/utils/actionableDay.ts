import type { TFunction } from 'i18next';
import { getEnergyInfo, isFavorableDay, isChallengingDay } from '@/utils/numerology';

export type DayTone = 'favorable' | 'challenging' | 'neutral';

export function getDayTone(personalNumber: number): DayTone {
  if (isFavorableDay(personalNumber)) return 'favorable';
  if (isChallengingDay(personalNumber)) return 'challenging';
  return 'neutral';
}

/** One clear verb-style action for the day (for home strip / notifications). */
export function getDayActionLine(
  personalNumber: number,
  t: TFunction
): { action: string; tone: DayTone } {
  const energy = getEnergyInfo(personalNumber, t);
  const primary =
    energy.positive?.[0] ||
    energy.description ||
    t('calendar.actionFallback', { defaultValue: 'Check recommendations for the day' });

  const tone = getDayTone(personalNumber);

  const prefix =
    tone === 'favorable'
      ? t('calendar.actionDo', { defaultValue: 'Today is good for' })
      : tone === 'challenging'
        ? t('calendar.actionCareful', { defaultValue: 'Today better to' })
        : t('calendar.actionNeutral', { defaultValue: 'Today focus on' });

  const actionBody = primary.charAt(0).toLowerCase() + primary.slice(1);

  return {
    action: `${prefix}: ${actionBody}`,
    tone,
  };
}

/** Emotional personal “story of the day” for home / day detail. */
export function getPersonalDayStory(
  personalNumber: number,
  t: TFunction
): {
  tone: DayTone;
  storyTitle: string;
  storyBody: string;
  doList: string[];
  toneLabel: string;
} {
  const energy = getEnergyInfo(personalNumber, t);
  const tone = getDayTone(personalNumber);
  const { action } = getDayActionLine(personalNumber, t);

  // First line = clear verdict for the user; then soft explanation
  const storyTitle = t('calendar.storyTitleDay', {
    defaultValue: 'Today is your day №{{number}}',
    number: personalNumber,
    planet: energy.planet,
  });

  const storyBody =
    tone === 'favorable'
      ? t('calendar.storyBodyFavorable', {
          defaultValue:
            'A good moment for starts, talks, and moves you have been postponing — if you feel ready.',
          action,
          number: personalNumber,
          planet: energy.planet,
        })
      : tone === 'challenging'
        ? t('calendar.storyBodyHard', {
            defaultValue:
              'Worth slowing down a little: finish what you started and leave big new launches for another day if you can.',
            action,
            number: personalNumber,
            planet: energy.planet,
          })
        : t('calendar.storyBodyNeutral', {
            defaultValue:
              'A calm day without extremes — good for routine, focused work, and small steps without pressure.',
            action,
            number: personalNumber,
            planet: energy.planet,
          });

  const toneLabel =
    tone === 'favorable'
      ? t('calendar.favorable')
      : tone === 'challenging'
        ? t('calendar.completion')
        : t('calendar.neutral');

  const doList = (energy.positive || []).slice(0, 3);

  return { tone, storyTitle, storyBody, doList, toneLabel };
}
