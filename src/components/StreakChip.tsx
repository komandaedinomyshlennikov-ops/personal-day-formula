import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StreakChipProps {
  streak: number;
  totalDays?: number;
}

/** Soft habit indicator — only shows when streak ≥ 1 */
export function StreakChip({ streak, totalDays }: StreakChipProps) {
  const { t } = useTranslation();
  if (streak < 1) return null;

  return (
    <div
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-orange-400/25 bg-orange-400/10"
      title={
        totalDays
          ? t('streak.totalHint', { count: totalDays })
          : t('streak.hint')
      }
    >
      <Flame size={11} className="text-orange-300" />
      <span className="text-[10px] font-semibold text-orange-100/95 leading-none">
        {streak === 1
          ? t('streak.oneDay')
          : t('streak.days', { count: streak })}
      </span>
    </div>
  );
}
