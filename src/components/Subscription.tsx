import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Sparkles, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SubscriptionPlan } from '@/types';

interface SubscriptionProps {
  plans: SubscriptionPlan[];
  currentPlanId: string | null;
  onSelect: (planId: string) => void;
  onBack: () => void;
  trialEndDate: string | null;
}

// Telegram ссылки для каждого типа подписки
const telegramLinks: Record<string, string> = {
  month: 'https://t.me/tatianageniush?text=Hello%20Tatiana!%20I%20want%20to%20subscribe%20to%20AstroNavigator%20for%20a%20month%20(%2410).%20Please%20send%20payment%20details.',
  year: 'https://t.me/tatianageniush?text=Hello%20Tatiana!%20I%20want%20to%20subscribe%20to%20AstroNavigator%20for%20a%20year%20(%2450).%20Please%20send%20payment%20details.',
  lifetime: 'https://t.me/tatianageniush?text=Hello%20Tatiana!%20I%20want%20to%20subscribe%20to%20AstroNavigator%20lifetime%20(%24100).%20Please%20send%20payment%20details.',
};

export function Subscription({ 
  plans, 
  currentPlanId, 
  onSelect, 
  onBack,
  trialEndDate 
}: SubscriptionProps) {
  const { t, i18n } = useTranslation();
  const isTrialActive = currentPlanId === 'trial' && trialEndDate;
  const isSubscribed = currentPlanId === 'active';

  // Фильтруем планы (убираем trial из списка, он отдельно)
  const paidPlans = plans.filter(p => p.id !== 'trial');

  // Форматирование даты согласно локали
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">{t('nav.subscription')}</h1>
      </header>

      <div className="px-4 py-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
            }}
          >
            <Crown size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSubscribed ? t('subscription.activeTitle') : t('subscription.fullAccess')}
          </h2>
          <p className="text-gray-400">
            {isSubscribed 
              ? t('subscription.activeDesc')
              : t('subscription.choosePlan')}
          </p>
        </motion.div>

        {/* Trial Status */}
        {isTrialActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-green-400" />
              <div>
                <p className="text-white font-semibold">{t('subscription.trialActiveTitle')}</p>
                <p className="text-gray-400 text-sm">
                  {t('subscription.until')} {trialEndDate ? formatDate(trialEndDate) : ''}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Subscription Status */}
        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/30"
          >
            <div className="flex items-center gap-3">
              <Check size={24} className="text-amber-400" />
              <div>
                <p className="text-white font-semibold">{t('subscription.activeTitle')}</p>
                <p className="text-gray-400 text-sm">
                  {t('subscription.accessUntil')} {trialEndDate ? formatDate(trialEndDate) : t('subscription.unlimited')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trial Card (if not active) */}
        {!isTrialActive && !isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/30"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">{t('subscription.plans.trial.name')}</h3>
                <p className="text-gray-400 text-sm">{t('subscription.trialPeriod')}</p>
              </div>
              <span className="text-amber-400 font-bold text-xl">$0</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">{t('subscription.trialDesc')}</p>
            <button
              onClick={() => onSelect('trial')}
              className="w-full py-3 rounded-xl bg-amber-400 text-black font-semibold hover:bg-amber-500 transition-colors"
            >
              {t('subscription.startTrial')}
            </button>
          </motion.div>
        )}

        {/* Paid Plans */}
        {!isSubscribed && (
          <div className="space-y-4">
            {paidPlans.map((plan, index) => {
              const isPopular = plan.popular;
              const telegramLink = telegramLinks[plan.id];

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative p-5 rounded-2xl
                    ${isPopular
                      ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/30'
                      : 'glass-card'
                    }
                  `}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-green-500 text-black text-xs font-bold">
                      {t('subscription.saveBadge')}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">${plan.price}</span>
                      <p className="text-gray-500 text-xs">/{plan.period}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{t('subscription.features.personalCalendar')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{t('subscription.features.dailyRecommendations')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{t('subscription.features.personalDayMonthYear')}</span>
                    </div>
                    {plan.id !== 'month' && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{t('subscription.features.dataExport')}</span>
                      </div>
                    )}
                    {plan.id === 'lifetime' && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{t('subscription.features.personalConsultation')}</span>
                      </div>
                    )}
                  </div>

                  {/* Telegram Button */}
                  <div className="space-y-2">
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="telegram-button w-full"
                    >
                      <Send size={18} />
                      {t('subscription.payInTelegram')}
                    </a>
                    <button
                      onClick={() => onSelect(plan.id)}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors text-sm"
                    >
                      {t('subscription.haveCode')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info */}
        {!isSubscribed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 text-xs mt-6"
          >
            {t('subscription.paymentInfo')}
          </motion.p>
        )}
      </div>
    </div>
  );
}
