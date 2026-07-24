import { useTranslation } from 'react-i18next';
import { getEnergyInfo } from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';
import type { DayInfo } from '@/types';

interface UpcomingDaysProps {
  days: DayInfo[];
  onSelect: (day: DayInfo) => void;
}

export function UpcomingDays({ days, onSelect }: UpcomingDaysProps) {
  const { t, i18n } = useTranslation();
  if (!days.length) return null;

  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';

  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h3 className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] font-medium">
          {t('calendar.upcomingTitle')}
        </h3>
        <span className="text-[10px] text-[var(--text-muted)] opacity-80">
          {t('calendar.upcomingHint')}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-none">
        {days.map((day) => {
          const energy = getEnergyInfo(day.personalNumber, t);
          const { action, tone } = getDayActionLine(day.personalNumber, t);
          const weekday = day.date.toLocaleDateString(locale, { weekday: 'short' });
          const dateLabel = day.date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
          });

          const border =
            tone === 'favorable'
              ? 'border-emerald-400/25'
              : tone === 'challenging'
                ? 'border-rose-400/25'
                : 'border-white/10';

          return (
            <button
              key={day.date.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              className={`glass-card shrink-0 w-[148px] p-3 rounded-2xl text-left border ${border} active:scale-[0.98] transition-transform`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: `${energy.color}22` }}
                >
                  {energy.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold capitalize leading-tight">
                    {weekday}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">{dateLabel}</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-200/90 font-medium mb-1">
                {day.personalNumber} · {energy.planet}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                {action}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
