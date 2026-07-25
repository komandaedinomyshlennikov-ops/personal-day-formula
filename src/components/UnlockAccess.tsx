import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Loader2, Send, XCircle } from 'lucide-react';
import { SUPPORT_TELEGRAM } from '@/config/site';

interface UnlockAccessProps {
  onUnlock: (token: string) => Promise<boolean>;
}

/**
 * One-tap activation after Telegram payment.
 * Opened via: #/unlock?token=… (signed v1.* from pay bot, or legacy admin token).
 * No manual code typing.
 */
export function UnlockAccess({ onUnlock }: UnlockAccessProps) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = (params.get('token') || params.get('t') || '').trim();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'fail'>(
    token ? 'loading' : 'fail'
  );

  useEffect(() => {
    if (!token) {
      setStatus('fail');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    void onUnlock(token).then((ok) => {
      if (cancelled) return;
      if (ok) {
        setStatus('ok');
        window.setTimeout(() => navigate('/calendar', { replace: true }), 1400);
      } else {
        setStatus('fail');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, onUnlock, navigate]);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-6 rounded-3xl text-center border border-white/10"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 text-amber-300 animate-spin" size={36} />
            <h1 className="font-display text-xl text-white mb-2">
              {t('unlock.loadingTitle')}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{t('unlock.loadingBody')}</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-300" size={28} />
            </div>
            <h1 className="font-display text-xl text-white mb-2">{t('unlock.okTitle')}</h1>
            <p className="text-sm text-[var(--text-muted)]">{t('unlock.okBody')}</p>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-400/15 border border-rose-400/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-rose-300" size={28} />
            </div>
            <h1 className="font-display text-xl text-white mb-2">{t('unlock.failTitle')}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-5">{t('unlock.failBody')}</p>
            <a
              href={SUPPORT_TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button w-full"
            >
              <Send size={16} />
              {t('unlock.writeTelegram')}
            </a>
            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="mt-3 w-full py-3 text-sm text-[var(--text-secondary)]"
            >
              {t('unlock.backPlans')}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
