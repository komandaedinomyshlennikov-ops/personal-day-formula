import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DISMISS_KEY = 'astronavigator_notify_banner_dismissed';

interface MorningNotifyBannerProps {
  enabled: boolean;
  onEnable: () => void | Promise<void>;
}

/** Soft home prompt: daily morning tip → habit loop */
export function MorningNotifyBanner({ enabled, onEnable }: MorningNotifyBannerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (enabled) {
      setVisible(false);
      return;
    }
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        setVisible(false);
        return;
      }
    } catch {
      /* ignore */
    }
    // Delay so today-story lands first
    const id = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(id);
  }, [enabled]);

  if (!visible || enabled) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="notify-banner">
      <div className="notify-banner__icon">
        <Bell size={18} className="text-amber-200" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-semibold leading-snug">
          {t('notifications.bannerTitle')}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
          {t('notifications.bannerBody')}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void Promise.resolve(onEnable()).finally(() => {
              setBusy(false);
              setVisible(false);
            });
          }}
          className="mt-2 text-xs font-semibold text-amber-200 underline-offset-2 hover:underline disabled:opacity-50"
        >
          {busy ? t('notifications.bannerEnabling') : t('notifications.bannerCta')}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="icon-btn !w-9 !h-9 shrink-0"
        aria-label={t('actions.close')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
