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
      className="fixed bottom-0 inset-x-0 z-[100] p-4"
    >
      <div className="max-w-lg mx-auto rounded-2xl border border-white/15 bg-[#12121a]/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <p className="text-white font-semibold text-sm mb-1">
          {t('legal.cookieTitle', { defaultValue: 'Cookies & analytics' })}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed mb-3">
          {t('legal.cookieBody', {
            defaultValue:
              'We store your birth date and preferences only in this browser (localStorage). Optional analytics is off until you accept. See Privacy Policy for details.',
          })}
          {hasGa ? '' : ` ${t('legal.cookieNoGa', { defaultValue: 'Analytics ID is not configured — only essential storage is used.' })}`}
          {' '}
          <Link to="/privacy" className="text-amber-400 underline underline-offset-2">
            {t('legal.privacy', { defaultValue: 'Privacy' })}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
            onClick={() => {
              setConsent('accepted');
              setVisible(false);
            }}
          >
            {t('legal.accept', { defaultValue: 'Accept' })}
          </button>
          <button
            type="button"
            className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
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
  );
}
