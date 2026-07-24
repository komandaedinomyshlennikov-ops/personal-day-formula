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

  const storyTitle =
    tone === 'favorable'
      ? t('calendar.storyTitleFavorable', {
          defaultValue: 'A day of opportunity',
          planet: energy.planet,
          number: personalNumber,
        })
      : tone === 'challenging'
        ? t('calendar.storyTitleHard', {
            defaultValue: 'A day to protect your energy',
            planet: energy.planet,
            number: personalNumber,
          })
        : t('calendar.storyTitleNeutral', {
            defaultValue: 'A steady, balanced day',
            planet: energy.planet,
            number: personalNumber,
          });

  const storyBody =
    tone === 'favorable'
      ? t('calendar.storyBodyFavorable', {
          defaultValue:
            'Your personal energy today is stronger than average — good for starts, talks, and bold moves.',
          action,
          planet: energy.planet,
        })
      : tone === 'challenging'
        ? t('calendar.storyBodyHard', {
            defaultValue:
              'Today asks for finish-lines and rest, not new starts. Pace yourself and close open loops.',
            action,
            planet: energy.planet,
          })
        : t('calendar.storyBodyNeutral', {
            defaultValue:
              'A calm personal rhythm — ideal for routine, focus work, and small progress without pressure.',
            action,
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
