import { Crown, ChevronRight, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UpgradeBarProps {
  daysLeft: number;
  isTrial: boolean;
  onOpenSubscription: () => void;
  /** P1.4: end of trial — 1-tap Telegram pay (popular plan) */
  onPayTelegram?: () => void;
}

/**
 * Single primary paywall strip for home.
 * End of trial (≤1 day): dual CTA — pay in Telegram + see plans.
 */
export function UpgradeBar({
  daysLeft,
  isTrial,
  onOpenSubscription,
  onPayTelegram,
}: UpgradeBarProps) {
  const { t } = useTranslation();
  if (daysLeft <= 0) return null;

  const urgent = daysLeft <= 1;
  const endOfTrial = isTrial && urgent && Boolean(onPayTelegram);

  const label = isTrial
    ? daysLeft === 1
      ? t('trial.oneDayLeft')
      : t('trial.daysLeft', { count: daysLeft })
    : daysLeft === 1
      ? t('trial.subOneDayLeft')
      : t('trial.subDaysLeft', { count: daysLeft });

  if (endOfTrial) {
    return (
      <div className={`upgrade-bar upgrade-bar--stack upgrade-bar--urgent`}>
        <div className="flex items-center gap-2.5 w-full">
          <div className="upgrade-bar__icon upgrade-bar__icon--urgent">
            <Crown size={14} className="text-rose-300" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-white text-[12px] font-semibold leading-snug">{label}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {t('premium.upgradeBarEndTrialHint')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={onPayTelegram}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-black bg-gradient-to-r from-amber-300 to-amber-400"
          >
            <Send size={13} />
            {t('premium.payTelegramCta')}
          </button>
          <button
            type="button"
            onClick={onOpenSubscription}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-amber-100 border border-amber-400/35 bg-amber-400/10"
          >
            {t('premium.seePlansCta')}
          </button>
        </div>
      </div>
    );
  }

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
