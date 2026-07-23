import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Send, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_TELEGRAM } from '@/config/site';

interface ActivationCodeProps {
  onActivate: (code: string) => boolean | Promise<boolean>;
  onBack: () => void;
}

export function ActivationCode({ onActivate, onBack }: ActivationCodeProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError(t('activation.empty'));
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const ok = await onActivate(code.trim().toUpperCase());
      if (!ok) {
        setError(t('activation.invalid'));
      }
    } catch {
      setError(t('activation.error'));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="app-shell min-h-screen pb-10">
      <header className="app-header">
        <button type="button" onClick={onBack} className="icon-btn" aria-label={t('nav.back')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-white">{t('activation.title')}</h1>
      </header>

      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.25)',
              }}
            >
              <Key size={36} className="text-amber-300" />
            </motion.div>

            <h2 className="font-display text-2xl text-white mb-2">{t('activation.heading')}</h2>
            <p className="text-[var(--text-muted)] text-sm">{t('activation.hint')}</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder={t('activation.placeholder')}
                  maxLength={14}
                  disabled={isChecking}
                  className="w-full px-4 py-4 text-center text-lg tracking-widest bg-white/5 border border-white/10 text-white rounded-2xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors uppercase placeholder:text-gray-600"
                  autoComplete="one-time-code"
                />
                {isChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={20} className="text-amber-400 animate-spin" />
                  </div>
                )}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChecking || !code.trim()}
              className="gradient-button w-full disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('activation.checking')}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {t('activation.submit')}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl glass-card">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
              <Send size={16} className="text-amber-300" />
              {t('activation.howTitle')}
            </h3>
            <ol className="space-y-2 text-[var(--text-secondary)] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-300 font-bold">1.</span>
                <span>{t('activation.how1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 font-bold">2.</span>
                <span>{t('activation.how2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 font-bold">3.</span>
                <span>{t('activation.how3')}</span>
              </li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <a
              href={SUPPORT_TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button inline-flex"
            >
              <Send size={18} />
              {t('subscription.payInTelegram')}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
