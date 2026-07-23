import { motion } from 'framer-motion';
import { AlertTriangle, Crown, Send, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionExpiredProps {
  onSubscribe: () => void;
  onContactSupport: () => void;
  isTrial?: boolean;
  daysOverdue?: number;
}

export function SubscriptionExpired({
  onSubscribe,
  onContactSupport,
  isTrial = false,
  daysOverdue = 0,
}: SubscriptionExpiredProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.2))',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)',
          }}
        >
          <AlertTriangle size={40} className="text-amber-300" />
        </motion.div>

        <h1 className="font-display text-2xl text-white text-center mb-2">
          {isTrial ? t('subscription.trialExpired') : t('subscription.subscriptionExpired')}
        </h1>

        <p className="text-[var(--text-secondary)] text-center mb-6 text-sm leading-relaxed">
          {t('subscription.subscriptionExpiredMessage')}
        </p>

        <div
          className="glass-card p-4 mb-6 border-amber-400/20"
          style={{
            background:
              'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.03))',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {isTrial ? t('subscription.trialLabel') : t('subscription.subLabel')}
              </p>
              <p className="text-red-400 text-sm">
                {daysOverdue > 0
                  ? t('subscription.overdueDays', { count: daysOverdue })
                  : t('subscription.endedToday')}
              </p>
            </div>
          </div>

          <div className="h-px bg-white/10 my-3" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Calendar size={18} className="text-purple-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{t('subscription.choosePlan')}</p>
              <p className="text-[var(--text-muted)] text-sm">{t('subscription.plansShort')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={onSubscribe} className="gradient-button w-full">
            <Crown size={18} />
            {t('subscription.choosePlan')}
          </button>
          <button type="button" onClick={onContactSupport} className="btn-secondary w-full">
            <Send size={16} />
            {t('subscription.payInTelegram')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
