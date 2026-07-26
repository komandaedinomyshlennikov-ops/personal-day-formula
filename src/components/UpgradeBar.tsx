import { Crown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UpgradeBarProps {
  daysLeft: number;
  isTrial: boolean;
  onOpenSubscription: () => void;
}

/**
 * Single primary paywall strip for home (replaces trial banner + extra premium cards).
 */
export function UpgradeBar({
  daysLeft,
  isTrial,
  onOpenSubscription,
}: UpgradeBarProps) {
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
      className={`upgrade-bar ${urgent ? 'upgrade-bar--urgent' : ''}`}
    >
      <div className={`upgrade-bar__icon ${urgent ? 'upgrade-bar__icon--urgent' : ''}`}>
        <Crown size={14} className={urgent ? 'text-rose-300' : 'text-amber-300'} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-white text-[12px] font-semibold leading-snug truncate">{label}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
          {isTrial ? t('premium.upgradeBarTrialHint') : t('premium.upgradeBarSubHint')}
        </p>
      </div>
      <span className="upgrade-bar__cta shrink-0">
        {t('premium.subscribeCta')}
        <ChevronRight size={14} />
      </span>
    </button>
  );
}
