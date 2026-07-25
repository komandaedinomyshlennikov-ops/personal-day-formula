import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  CalendarCheck,
  BarChart3,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getBestWindows,
  getWeeklyDigest,
  countWeekTones,
  getYearFocusAreas,
  formatWeeklyDigestText,
} from '@/utils/premiumInsights';
import { getEnergyInfo, calculatePersonalYear } from '@/utils/numerology';
import type { DayInfo } from '@/types';

interface YearPerksPanelProps {
  birthDate: string;
  onSelectDay: (day: DayInfo) => void;
  onOpenYear: (yearNumber: number) => void;
}

/** Real utility blocks for year/lifetime subscribers */
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
  const [copied, setCopied] = useState(false);

  const windows = useMemo(
    () => getBestWindows(birthDate, 30, 5, t),
    [birthDate, t]
  );
  const digest = useMemo(() => getWeeklyDigest(birthDate, t), [birthDate, t]);
  const tones = useMemo(() => countWeekTones(digest), [digest]);
  const focus = useMemo(() => getYearFocusAreas(personalYear), [personalYear]);

  const handleCopyDigest = async () => {
    const text = formatWeeklyDigestText(birthDate, locale, t);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('premium.digestCopied'));
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t('share.shareFailed', { defaultValue: 'Could not copy' }));
    }
  };

  const focusLabel = (key: string) =>
    t(`premium.focus.${key}`, {
      defaultValue:
        key === 'career'
          ? 'Career'
          : key === 'relations'
            ? 'Relations'
            : key === 'resource'
              ? 'Money'
              : key === 'home'
                ? 'Home'
                : 'Growth',
    });

  return (
    <section className="space-y-2.5">
      <div className="home-section-label">
        <h3>{t('premium.yearPanelTitle')}</h3>
        <span className="text-[10px] text-amber-200/80 font-medium">
          {t('premium.yearBadge')}
        </span>
      </div>

      {/* Year compass + focus weights */}
      <button
        type="button"
        onClick={() => onOpenYear(personalYear)}
        className="w-full glass-card p-3.5 rounded-2xl text-left border border-violet-400/25"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(236,72,153,0.06))',
        }}
      >
        <div className="flex items-center gap-3">
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
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {focus.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-400/15 border border-violet-400/25 text-[10px] text-violet-100"
            >
              {focusLabel(f.key)}
              <span className="opacity-70">{'★'.repeat(f.weight)}</span>
            </span>
          ))}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          {t('premium.compassHint')}
        </p>
      </button>

      {/* Best windows with tips */}
      <div className="glass-card p-3 rounded-2xl border border-emerald-400/20">
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarCheck size={14} className="text-emerald-300" />
          <p className="text-xs font-semibold text-white">{t('premium.windowsTitle')}</p>
        </div>
        {windows.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">{t('premium.windowsEmpty')}</p>
        ) : (
          <ul className="space-y-1.5">
            {windows.map((w) => {
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
                      {w.reason === 'favorable' && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100">
                          {t('calendar.legend.favorable')}
                        </span>
                      )}
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

      {/* Weekly digest — day chips + copy */}
      <div className="glass-card p-3 rounded-2xl border border-amber-400/20">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 size={14} className="text-amber-300" />
          <p className="text-xs font-semibold text-white flex-1">{t('premium.digestTitle')}</p>
          <button
            type="button"
            onClick={() => void handleCopyDigest()}
            className="inline-flex items-center gap-1 text-[10px] text-amber-100/90 px-2 py-1 rounded-lg border border-amber-400/25 bg-amber-400/10"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {t('premium.digestCopy')}
          </button>
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
        <div className="flex flex-wrap gap-1">
          {digest.map((d) => {
            const label = d.day.date.toLocaleDateString(locale, {
              weekday: 'short',
              day: 'numeric',
            });
            const toneCls =
              d.tone === 'favorable'
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50'
                : d.tone === 'challenging'
                  ? 'border-rose-400/30 bg-rose-400/10 text-rose-50'
                  : 'border-white/15 bg-white/5 text-white/85';
            return (
              <button
                key={d.day.date.toISOString()}
                type="button"
                title={d.tip}
                onClick={() => onSelectDay(d.day)}
                className={`px-2 py-1 rounded-lg border text-[10px] ${toneCls}`}
              >
                {label} · {d.day.personalNumber}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-2">
          <Sparkles size={10} className="text-amber-300" />
          {t('premium.digestHint')}
        </p>
      </div>
    </section>
  );
}
