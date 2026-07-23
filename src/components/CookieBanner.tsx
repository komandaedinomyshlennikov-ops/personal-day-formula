import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getConsent, setConsent, initAnalytics, getGaId } from '@/lib/analytics';

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getConsent();
    if (status === 'unknown') {
      setVisible(true);
    } else if (status === 'accepted') {
      initAnalytics();
    }
  }, []);

  if (!visible) return null;

  const hasGa = Boolean(getGaId());

  return (
    <div
      role="dialog"
      aria-label={t('legal.cookieTitle', { defaultValue: 'Cookies' })}
      className="fixed bottom-0 inset-x-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="app-shell">
        <div className="glass-card rounded-3xl border-white/15 shadow-2xl p-4 sm:p-5">
          <p className="text-white font-semibold text-sm mb-1 font-display text-lg">
            {t('legal.cookieTitle', { defaultValue: 'Cookies & analytics' })}
          </p>
          <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-3">
            {t('legal.cookieBody', {
              defaultValue:
                'We store your birth date and preferences only in this browser (localStorage). Optional analytics is off until you accept. See Privacy Policy for details.',
            })}
            {hasGa
              ? ''
              : ` ${t('legal.cookieNoGa', {
                  defaultValue:
                    'Analytics ID is not configured — only essential storage is used.',
                })}`}{' '}
            <Link to="/privacy" className="text-amber-200 underline underline-offset-2">
              {t('legal.privacy', { defaultValue: 'Privacy' })}
            </Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="gradient-button flex-1 !min-h-[44px] !py-2.5 !text-sm"
              onClick={() => {
                setConsent('accepted');
                setVisible(false);
              }}
            >
              {t('legal.accept', { defaultValue: 'Accept' })}
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 !min-h-[44px] !py-2.5 !text-sm"
              onClick={() => {
                setConsent('declined');
                setVisible(false);
              }}
            >
              {t('legal.decline', { defaultValue: 'Essential only' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
