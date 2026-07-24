import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CalendarCheck, BarChart3, ChevronRight } from 'lucide-react';
import { getBestWindows, getWeeklyDigest, countWeekTones } from '@/utils/premiumInsights';
import { getEnergyInfo, calculatePersonalYear } from '@/utils/numerology';
import type { DayInfo } from '@/types';

interface YearPerksPanelProps {
  birthDate: string;
  onSelectDay: (day: DayInfo) => void;
  onOpenYear: (yearNumber: number) => void;
}

/** Real utility blocks for year/lifetime subscribers (2026-style) */
export function YearPerksPanel({
  birthDate,
  onSelectDay,
  onOpenYear,
}: YearPerksPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
  const year = new Date().getFullYear();
  const personalYear = calculatePersonalYear(birthDate, year);
  const yearEnergy = getEnergyInfo(personalYear, t);

  const windows = useMemo(() => getBestWindows(birthDate, 30, 5), [birthDate]);
  const digest = useMemo(() => getWeeklyDigest(birthDate), [birthDate]);
  const tones = useMemo(() => countWeekTones(digest), [digest]);

  return (
    <section className="space-y-2.5">
      <div className="home-section-label">
        <h3>{t('premium.yearPanelTitle')}</h3>
        <span className="text-[10px] text-amber-200/80 font-medium">
          {t('premium.yearBadge')}
        </span>
      </div>

      {/* Year compass */}
      <button
        type="button"
        onClick={() => onOpenYear(personalYear)}
        className="w-full glass-card p-3.5 rounded-2xl text-left border border-violet-400/25 flex items-center gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(236,72,153,0.06))',
        }}
      >
        <div className="w-11 h-11 rounded-2xl bg-violet-500/20 flex items-center justify-center text-xl shrink-0">
          {yearEnergy.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-violet-200/85 font-semibold">
            {t('premium.compassTitle')}
          </p>
          <p className="text-white text-sm font-semibold">
            {year} · {personalYear} · {yearEnergy.planet}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
            {yearEnergy.description}
          </p>
        </div>
        <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
      </button>

      {/* Best windows */}
      <div className="glass-card p-3 rounded-2xl border border-emerald-400/20">
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarCheck size={14} className="text-emerald-300" />
          <p className="text-xs font-semibold text-white">{t('premium.windowsTitle')}</p>
        </div>
        {windows.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">{t('premium.windowsEmpty')}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {windows.map((w) => {
              const e = getEnergyInfo(w.day.personalNumber, t);
              const label = w.day.date.toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
              });
              return (
                <button
                  key={w.day.date.toISOString()}
                  type="button"
                  onClick={() => onSelectDay(w.day)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/25 text-[11px] text-emerald-50"
                >
                  <span>{e.icon}</span>
                  <span className="font-medium">{label}</span>
                  <span className="opacity-70">{w.day.personalNumber}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly digest */}
      <div className="glass-card p-3 rounded-2xl border border-amber-400/20">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 size={14} className="text-amber-300" />
          <p className="text-xs font-semibold text-white">{t('premium.digestTitle')}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-2 text-center">
            <p className="text-lg font-display text-emerald-200">{tones.favorable}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.favorable')}</p>
          </div>
          <div className="rounded-xl bg-yellow-400/10 border border-yellow-400/20 p-2 text-center">
            <p className="text-lg font-display text-yellow-100">{tones.neutral}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.neutral')}</p>
          </div>
          <div className="rounded-xl bg-rose-400/10 border border-rose-400/20 p-2 text-center">
            <p className="text-lg font-display text-rose-200">{tones.challenging}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.completion')}</p>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Sparkles size={10} className="text-amber-300" />
          {t('premium.digestHint')}
        </p>
      </div>
    </section>
  );
}
