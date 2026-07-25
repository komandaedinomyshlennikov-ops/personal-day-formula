import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarRange, AlertTriangle, BookOpen, Download, Sparkles } from 'lucide-react';
import {
  getMonthBalance,
  getMonthTopDays,
  getMonthCautionDays,
} from '@/utils/premiumInsights';
import { getEnergyInfo, calculatePersonalMonth } from '@/utils/numerology';
import type { DayInfo } from '@/types';

interface MonthProPanelProps {
  birthDate: string;
  onSelectDay: (day: DayInfo) => void;
  onOpenMonth: (monthNumber: number) => void;
  onNotes?: () => void;
  onExport?: () => void;
}

/**
 * Pro (month+) home tools: month balance, top action days, caution days.
 * Distinct from Year perks (30-day windows / week digest / year compass).
 */
export function MonthProPanel({
  birthDate,
  onSelectDay,
  onOpenMonth,
  onNotes,
  onExport,
}: MonthProPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const personalMonth = calculatePersonalMonth(birthDate, year, month);
  const monthEnergy = getEnergyInfo(personalMonth, t);

  const balance = useMemo(
    () => getMonthBalance(birthDate, year, month),
    [birthDate, year, month]
  );
  const topDays = useMemo(
    () => getMonthTopDays(birthDate, year, month, 5, t),
    [birthDate, year, month, t]
  );
  const caution = useMemo(
    () => getMonthCautionDays(birthDate, year, month, 3, t),
    [birthDate, year, month, t]
  );

  const monthLabel = now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <section className="space-y-2.5">
      <div className="home-section-label">
        <h3>{t('premium.monthPanelTitle')}</h3>
        <span className="text-[10px] text-amber-200/80 font-medium">
          {t('premium.badge')}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpenMonth(personalMonth)}
        className="w-full glass-card p-3.5 rounded-2xl text-left border border-amber-400/25 flex items-center gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(236,72,153,0.06))',
        }}
      >
        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
          {monthEnergy.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-amber-200/85 font-semibold">
            {t('premium.monthFocusTitle')}
          </p>
          <p className="text-white text-sm font-semibold capitalize">
            {monthLabel} · {personalMonth} · {monthEnergy.planet}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
            {monthEnergy.description}
          </p>
        </div>
        <Sparkles size={16} className="text-amber-300 shrink-0" />
      </button>

      <div className="glass-card p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarRange size={14} className="text-sky-300" />
          <p className="text-xs font-semibold text-white">{t('premium.monthBalanceTitle')}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-2 text-center">
            <p className="text-lg font-display text-emerald-200">{balance.favorable}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.favorable')}</p>
          </div>
          <div className="rounded-xl bg-yellow-400/10 border border-yellow-400/20 p-2 text-center">
            <p className="text-lg font-display text-yellow-100">{balance.neutral}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.neutral')}</p>
          </div>
          <div className="rounded-xl bg-rose-400/10 border border-rose-400/20 p-2 text-center">
            <p className="text-lg font-display text-rose-200">{balance.challenging}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{t('calendar.legend.completion')}</p>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">
          {t('premium.monthBalanceHint', {
            fav: balance.remainingFavorable,
            hard: balance.remainingChallenging,
          })}
        </p>
      </div>

      <div className="glass-card p-3 rounded-2xl border border-emerald-400/20">
        <p className="text-xs font-semibold text-white mb-2">
          {t('premium.monthTopTitle')}
        </p>
        {topDays.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">{t('premium.windowsEmpty')}</p>
        ) : (
          <ul className="space-y-1.5">
            {topDays.map((w) => {
              const e = getEnergyInfo(w.day.personalNumber, t);
              const label = w.day.date.toLocaleDateString(locale, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              return (
                <li key={w.day.date.toISOString()}>
                  <button
                    type="button"
                    onClick={() => onSelectDay(w.day)}
                    className="w-full text-left rounded-xl px-2.5 py-2 bg-emerald-400/8 border border-emerald-400/20 hover:bg-emerald-400/14 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[12px] text-emerald-50">
                      <span>{e.icon}</span>
                      <span className="font-semibold">{label}</span>
                      <span className="opacity-70">№{w.day.personalNumber}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2 pl-6">
                      {w.tip}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {caution.length > 0 && (
        <div className="glass-card p-3 rounded-2xl border border-rose-400/20">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} className="text-rose-300" />
            <p className="text-xs font-semibold text-white">{t('premium.monthCautionTitle')}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {caution.map((w) => {
              const label = w.day.date.toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
              });
              return (
                <button
                  key={w.day.date.toISOString()}
                  type="button"
                  onClick={() => onSelectDay(w.day)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-rose-400/10 border border-rose-400/25 text-[11px] text-rose-50"
                >
                  <span className="font-medium">{label}</span>
                  <span className="opacity-70">№{w.day.personalNumber}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            {t('premium.monthCautionHint')}
          </p>
        </div>
      )}

      {(onNotes || onExport) && (
        <div className="grid grid-cols-2 gap-2">
          {onNotes && (
            <button
              type="button"
              onClick={onNotes}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[11px] text-white/90"
            >
              <BookOpen size={14} className="text-amber-300" />
              {t('premium.monthNotesCta')}
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[11px] text-white/90"
            >
              <Download size={14} className="text-sky-300" />
              {t('premium.monthExportCta')}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
