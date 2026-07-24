import { Crown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TrialBannerProps {
  daysLeft: number;
  isTrial: boolean;
  onOpenSubscription: () => void;
}

export function TrialBanner({
  daysLeft,
  isTrial,
  onOpenSubscription,
}: TrialBannerProps) {
  const { t } = useTranslation();

  if (daysLeft <= 0) return null;

  const urgent = daysLeft <= 1;
  const label = isTrial
    ? daysLeft === 1
      ? t('trial.oneDayLeft')
      : t('trial.daysLeft', { count: daysLeft })
    : daysLeft === 1
      ? t('trial.subOneDayLeft')
      : t('trial.subDaysLeft', { count: daysLeft });

  return (
    <button
      type="button"
      onClick={onOpenSubscription}
      className={`mx-4 mt-2 block glass-card px-3.5 py-2.5 rounded-2xl text-left flex items-center gap-3 border ${
        urgent
          ? 'border-rose-400/40'
          : 'border-amber-400/30'
      }`}
      style={{
        background: urgent
          ? 'linear-gradient(120deg, rgba(248,113,113,0.14), rgba(245,158,11,0.08))'
          : 'linear-gradient(120deg, rgba(245,215,142,0.12), rgba(167,139,250,0.08))',
      }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          urgent ? 'bg-rose-500/20' : 'bg-amber-400/15'
        }`}
      >
        <Crown size={16} className={urgent ? 'text-rose-300' : 'text-amber-300'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-semibold leading-snug">{label}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          {t('trial.bannerHint')}
        </p>
      </div>
      <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
    </button>
  );
}
