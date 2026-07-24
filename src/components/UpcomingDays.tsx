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
    <section className="home-upcoming">
      <div className="home-section-label">
        <h3>{t('calendar.upcomingTitle')}</h3>
        <span className="text-[10px] text-[var(--text-muted)]">{t('calendar.upcomingHint')}</span>
      </div>
      <div className="upcoming-row">
        {days.map((day, index) => {
          const energy = getEnergyInfo(day.personalNumber, t);
          const { action, tone } = getDayActionLine(day.personalNumber, t);
          const weekday = day.date.toLocaleDateString(locale, { weekday: 'short' });
          const dateLabel = day.date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
          });

          const toneClass =
            tone === 'favorable'
              ? 'border-emerald-400/40 bg-emerald-400/[0.07]'
              : tone === 'challenging'
                ? 'border-rose-400/40 bg-rose-400/[0.07]'
                : 'border-amber-400/30 bg-amber-400/[0.06]';

          const toneDot =
            tone === 'favorable'
              ? 'tone-dot tone-dot--fav'
              : tone === 'challenging'
                ? 'tone-dot tone-dot--hard'
                : 'tone-dot tone-dot--neu';

          const dayLabel =
            index === 0
              ? t('dates.tomorrow', { defaultValue: 'Tomorrow' })
              : weekday;

          return (
            <button
              key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
              type="button"
              onClick={() => onSelect(day)}
              className={`upcoming-card ${toneClass}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={toneDot} />
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                  style={{ background: `${energy.color}26` }}
                >
                  {energy.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-[11px] font-semibold capitalize leading-tight truncate">
                    {dayLabel}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] truncate">{dateLabel}</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-200/90 font-semibold leading-tight">
                {t('calendar.personalDayShort', {
                  defaultValue: 'Day {{n}}',
                  n: day.personalNumber,
                })}{' '}
                · {energy.planet}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                {action}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
