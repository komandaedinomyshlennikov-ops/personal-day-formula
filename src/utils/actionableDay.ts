import type { TFunction } from 'i18next';
import { getEnergyInfo } from '@/utils/numerology';
import { isFavorableDay, isChallengingDay } from '@/utils/numerology';

/** One clear verb-style action for the day (for home strip / notifications). */
export function getDayActionLine(
  personalNumber: number,
  t: TFunction
): { action: string; tone: 'favorable' | 'challenging' | 'neutral' } {
  const energy = getEnergyInfo(personalNumber, t);
  const primary =
    energy.positive?.[0] ||
    energy.description ||
    t('calendar.actionFallback', { defaultValue: 'Check recommendations for the day' });

  const tone = isFavorableDay(personalNumber)
    ? 'favorable'
    : isChallengingDay(personalNumber)
      ? 'challenging'
      : 'neutral';

  const prefix =
    tone === 'favorable'
      ? t('calendar.actionDo', { defaultValue: 'Today is good for' })
      : tone === 'challenging'
        ? t('calendar.actionCareful', { defaultValue: 'Today better to' })
        : t('calendar.actionNeutral', { defaultValue: 'Today focus on' });

  // positive items are already action-like ("Начинать новые проекты")
  const actionBody = primary.charAt(0).toLowerCase() + primary.slice(1);

  return {
    action: `${prefix}: ${actionBody}`,
    tone,
  };
}
