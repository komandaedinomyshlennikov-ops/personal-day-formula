import { Crown, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PremiumTeaserProps {
  /** Visual density */
  variant?: 'card' | 'inline' | 'banner';
  /** Highlight year-only value */
  yearOnly?: boolean;
  title?: string;
  body?: string;
  bullets?: string[];
  ctaLabel?: string;
  onUpgrade: () => void;
}

export function PremiumTeaser({
  variant = 'card',
  yearOnly = false,
  title,
  body,
  bullets,
  ctaLabel,
  onUpgrade,
}: PremiumTeaserProps) {
  const { t } = useTranslation();

  const resolvedTitle =
    title ||
    (yearOnly ? t('premium.yearTitle') : t('premium.title'));
  const resolvedBody =
    body ||
    (yearOnly ? t('premium.yearBody') : t('premium.body'));
  const resolvedCta = ctaLabel || t('premium.cta');
  const resolvedBullets =
    bullets ||
    (yearOnly
      ? [
          t('premium.yearPerk1'),
          t('premium.yearPerk2'),
          t('premium.yearPerk3'),
        ]
      : [
          t('premium.perk1'),
          t('premium.perk2'),
          t('premium.perk3'),
        ]);

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onUpgrade}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/10 text-left"
      >
        <Lock size={14} className="text-amber-300 shrink-0" />
        <span className="text-xs text-amber-50/95 flex-1 min-w-0">
          {resolvedTitle}
        </span>
        <ChevronRight size={14} className="text-amber-200/80 shrink-0" />
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <button
        type="button"
        onClick={onUpgrade}
        className="w-full glass-card p-3.5 rounded-2xl border border-violet-400/30 text-left flex items-center gap-3"
        style={{
          background:
            'linear-gradient(120deg, rgba(167,139,250,0.16), rgba(245,215,142,0.1))',
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Crown size={18} className="text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold">{resolvedTitle}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
            {resolvedBody}
          </p>
        </div>
        <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
      </button>
    );
  }

  return (
    <div
      className="glass-card p-4 rounded-3xl border border-amber-400/25"
      style={{
        background:
          'linear-gradient(155deg, rgba(245,215,142,0.12), rgba(139,92,246,0.1))',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center shrink-0">
          {yearOnly ? (
            <Sparkles size={20} className="text-amber-300" />
          ) : (
            <Crown size={20} className="text-amber-300" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Lock size={12} className="text-amber-200/80" />
            <span className="text-[10px] uppercase tracking-wider text-amber-200/85 font-semibold">
              {yearOnly ? t('premium.yearBadge') : t('premium.badge')}
            </span>
          </div>
          <h3 className="text-white font-semibold text-[0.95rem] leading-snug">
            {resolvedTitle}
          </h3>
          <p className="text-[var(--text-secondary)] text-xs mt-1 leading-relaxed">
            {resolvedBody}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-3.5">
        {resolvedBullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
          >
            <span className="text-amber-300 mt-0.5">✦</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onUpgrade} className="gradient-button w-full !min-h-[46px] !text-sm">
        <Crown size={16} />
        {resolvedCta}
      </button>
    </div>
  );
}
