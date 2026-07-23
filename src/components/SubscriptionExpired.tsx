import { motion } from 'framer-motion';
import { AlertTriangle, Crown, Send, Clock, Calendar } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

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
  daysOverdue = 0 
}: SubscriptionExpiredProps) {
  const { t } = useLocalization();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.2))',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
          }}
        >
          <AlertTriangle size={48} className="text-amber-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          {isTrial ? t.subscription.trialExpired : t.subscription.subscriptionExpired}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-gray-400 text-center mb-6"
        >
          {t.subscription.subscriptionExpiredMessage}
        </motion.p>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-6 border-amber-400/20"
          style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.03))' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                {isTrial ? 'Пробный период' : 'Подписка'}
              </p>
              <p className="text-red-400 text-sm">
                {daysOverdue > 0 
                  ? `Просрочено на ${daysOverdue} ${daysOverdue === 1 ? 'день' : 'дня'}`
                  : 'Закончилась сегодня'
                }
              </p>
            </div>
          </div>
          
          <div className="h-px bg-white/10 my-3" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">{t.subscription.choosePlan}</p>
              <p className="text-gray-400 text-sm">Месяц, Год или Навсегда</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <button
            onClick={onSubscribe}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30"
          >
            <Crown size={20} />
            {t.subscription.choosePlan}
          </button>

          <a
            href="https://t.me/tatianageniush"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onContactSupport}
            className="w-full py-4 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/30 text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Send size={20} className="text-[#0088cc]" />
            {t.subscription.telegramButton}
          </a>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-xs text-center mt-6"
        >
          {t.subscription.paymentInfo}
        </motion.p>
      </motion.div>
    </div>
  );
}
