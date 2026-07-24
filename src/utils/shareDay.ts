import type { TFunction } from 'i18next';
import { getEnergyInfo } from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';
import { SITE_URL } from '@/config/site';
import type { DayInfo } from '@/types';

export function buildDayShareText(
  day: DayInfo,
  t: TFunction,
  locale: string = 'ru-RU'
): string {
  const energy = getEnergyInfo(day.personalNumber, t);
  const { action } = getDayActionLine(day.personalNumber, t);
  const dateLabel = day.date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const weekday = day.date.toLocaleDateString(locale, { weekday: 'long' });

  const tone = day.isFavorable
    ? t('share.dayFavorable', { defaultValue: 'favorable day' })
    : day.isUnfavorable
      ? t('share.dayChallenging', { defaultValue: 'completion day' })
      : t('share.dayNeutral', { defaultValue: 'steady day' });

  return [
    t('share.dayTitle', {
      defaultValue: 'My personal day in AstroNavigator',
    }),
    `${dateLabel} (${weekday})`,
    `${energy.icon} ${day.personalNumber} · ${energy.planet} — ${tone}`,
    action,
    '',
    t('share.dayFooter', {
      defaultValue: 'Calculate yours by birth date:',
    }),
    SITE_URL,
  ].join('\n');
}

export async function shareText(text: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (e) {
    // user cancel is not failure
    if ((e as Error)?.name === 'AbortError') return 'failed';
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
