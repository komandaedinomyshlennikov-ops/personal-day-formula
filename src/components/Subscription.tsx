import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Sparkles, Send, X, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SubscriptionPlan } from '@/types';
import { TELEGRAM_PAYMENT_LINKS, SUPPORT_TELEGRAM } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import type { AccessTier } from '@/utils/access';
import { hasYearPerks, isPaidTier, isTrialTier } from '@/utils/access';

interface SubscriptionProps {
  plans: SubscriptionPlan[];
  currentPlanId: string | null;
  accessTier: AccessTier;
  onSelect: (planId: string) => void;
  onBack: () => void;
  trialEndDate: string | null;
}

export function Subscription({
  plans,
  currentPlanId: _currentPlanId,
  accessTier,
  onSelect,
  onBack,
  trialEndDate,
}: SubscriptionProps) {
  void _currentPlanId;
  const { t, i18n } = useTranslation();
  const isTrialActive = isTrialTier(accessTier);
  const isPaid = isPaidTier(accessTier);
  const isYear = hasYearPerks(accessTier);
  const paidPlans = plans.filter((p) => p.id !== 'trial');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US');
  };

  const rows: { key: string; trial: boolean; pro: boolean; year: boolean }[] = [
    { key: 'featToday', trial: true, pro: true, year: true },
    { key: 'featCalendar', trial: true, pro: true, year: true },
    { key: 'featCoach', trial: true, pro: true, year: true },
    { key: 'featDeep', trial: false, pro: true, year: true },
    { key: 'featExport', trial: false, pro: true, year: true },
    { key: 'featNotes', trial: false, pro: true, year: true },
    { key: 'featWindows', trial: false, pro: false, year: true },
    { key: 'featDigest', trial: false, pro: false, year: true },
    { key: 'featCompass', trial: false, pro: false, year: true },
  ];

  const Cell = ({ ok }: { ok: boolean }) =>
    ok ? (
      <Check size={14} className="text-emerald-400 mx-auto" />
    ) : (
      <X size={14} className="text-white/20 mx-auto" />
    );

  return (
    <div className="app-shell min-h-screen pb-12">
      <header className="app-header">
        <button type="button" onClick={onBack} className="icon-btn" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-white">{t('nav.subscription')}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Hero value */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.22))',
              boxShadow: '0 0 36px rgba(139, 92, 246, 0.28)',
            }}
          >
            <Crown size={32} className="text-amber-300" />
          </div>
          <h2 className="font-display text-2xl text-white mb-1.5">
            {isPaid ? t('subscription.activeTitle') : t('subscription.fullAccess')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto">
            {isPaid ? t('subscription.activeDesc') : t('premium.whyBody')}
          </p>
        </div>

        {/* Trial status */}
        {isTrialActive && trialEndDate && (
          <div className="glass-card p-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-300" />
              <p className="text-white font-semibold text-sm">{t('subscription.trialActiveTitle')}</p>
            </div>
            <p className="text-[var(--text-muted)] text-xs mb-2">
              {t('subscription.until')} {formatDate(trialEndDate)}
            </p>
            <p className="text-[11px] text-emerald-100/90 font-medium mb-1.5">
              {t('premium.trialValueTitle')}
            </p>
            <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
              <li>✦ {t('premium.trialValue1')}</li>
              <li>✦ {t('premium.trialValue2')}</li>
              <li>✦ {t('premium.trialValue3')}</li>
            </ul>
          </div>
        )}

        {isPaid && (
          <div className="glass-card p-4 rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-amber-300" />
              <div>
                <p className="text-white font-semibold text-sm">{t('subscription.activeTitle')}</p>
                <p className="text-[var(--text-muted)] text-xs">
                  {t('subscription.accessUntil')}{' '}
                  {trialEndDate ? formatDate(trialEndDate) : t('subscription.unlimited')}
                  {isYear ? ` · ${t('premium.yearBadge')}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why upgrade */}
        {!isPaid && (
          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <h3 className="text-white font-semibold text-sm mb-1.5 flex items-center gap-1.5">
              <Lock size={14} className="text-amber-300" />
              {t('premium.whyTitle')}
            </h3>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-3">
              {t('premium.whyBody')}
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li className="flex gap-2">
                <span className="text-amber-300">✦</span>
                {t('premium.perk1')}
              </li>
              <li className="flex gap-2">
                <span className="text-amber-300">✦</span>
                {t('premium.perk2')}
              </li>
              <li className="flex gap-2">
                <span className="text-amber-300">✦</span>
                {t('premium.perk3')}
              </li>
            </ul>
          </div>
        )}

        {/* Comparison table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-4 gap-0 text-[10px] font-semibold text-center border-b border-white/10 bg-white/[0.03]">
            <div className="p-2 text-left text-[var(--text-muted)]" />
            <div className="p-2 text-[var(--text-muted)]">{t('premium.compareFree')}</div>
            <div className="p-2 text-amber-200">{t('premium.comparePro')}</div>
            <div className="p-2 text-violet-200">{t('premium.compareYear')}</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-4 gap-0 text-[10px] border-b border-white/5 last:border-0 items-center"
            >
              <div className="p-2.5 text-left text-[var(--text-secondary)] leading-snug">
                {t(`premium.${row.key}`)}
              </div>
              <div className="p-2">
                <Cell ok={row.trial} />
              </div>
              <div className="p-2">
                <Cell ok={row.pro} />
              </div>
              <div className="p-2">
                <Cell ok={row.year} />
              </div>
            </div>
          ))}
        </div>

        {/* Year extras callout */}
        <div
          className="glass-card p-4 rounded-2xl border border-violet-400/30"
          style={{
            background:
              'linear-gradient(145deg, rgba(167,139,250,0.14), rgba(245,215,142,0.08))',
          }}
        >
          <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-1.5">
            <Sparkles size={15} className="text-violet-200" />
            {t('premium.yearExtraTitle')}
          </h3>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            <li>✦ {t('premium.yearExtra1')}</li>
            <li>✦ {t('premium.yearExtra2')}</li>
            <li>✦ {t('premium.yearExtra3')}</li>
            <li>✦ {t('premium.yearExtra4')}</li>
          </ul>
        </div>

        {/* Plans — each tier has its own benefit list */}
        {!isPaid && (
          <div className="space-y-3">
            {paidPlans.map((plan, index) => {
              const isPopular = plan.popular || plan.id === 'year';
              const isYearish = plan.id === 'year' || plan.id === 'lifetime';
              const telegramLink = TELEGRAM_PAYMENT_LINKS[plan.id] || SUPPORT_TELEGRAM;
              const planName = t(`subscription.plans.${plan.id}.name`, {
                defaultValue: plan.name,
              });
              const planDesc = t(`subscription.plans.${plan.id}.description`, {
                defaultValue: plan.description,
              });
              const planFeatures = t(`subscription.plans.${plan.id}.features`, {
                returnObjects: true,
                defaultValue: [],
              });
              const features = Array.isArray(planFeatures)
                ? (planFeatures as string[])
                : [];

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`relative p-4 rounded-2xl border ${
                    isPopular
                      ? 'border-emerald-400/35 bg-gradient-to-br from-emerald-500/10 to-transparent'
                      : plan.id === 'lifetime'
                        ? 'border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-transparent'
                        : 'glass-card border-white/10'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-bold">
                      {t('subscription.saveBadge')}
                    </div>
                  )}
                  {plan.id === 'lifetime' && (
                    <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-violet-400 text-black text-[10px] font-bold">
                      {t('subscription.lifetimeBadge')}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{planName}</h3>
                      <p className="text-[var(--text-muted)] text-xs mt-0.5 max-w-[14rem]">
                        {planDesc}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-2xl font-bold text-white">${plan.price}</span>
                      <p className="text-gray-500 text-[10px]">/{plan.period}</p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4 text-xs text-[var(--text-secondary)]">
                    {features.map((item, fi) => {
                      // First line is usually “includes lower tier” — rest are exclusive extras
                      const highlight = isYearish && fi > 0;
                      return (
                        <li key={`${plan.id}-${fi}`} className="flex items-start gap-2">
                          {highlight ? (
                            <Sparkles size={14} className="text-violet-300 shrink-0 mt-0.5" />
                          ) : (
                            <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <span className={highlight ? 'text-violet-100/90' : undefined}>
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="space-y-2">
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="telegram-button w-full"
                      onClick={() => trackEvent('payment_telegram_click', { plan: plan.id })}
                    >
                      <Send size={16} />
                      {t('subscription.payInTelegram')}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('activation_open', { plan: plan.id });
                        onSelect(plan.id);
                      }}
                      className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
                    >
                      {t('subscription.haveCode')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* How to pay */}
        {!isPaid && (
          <ol className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 text-xs text-[var(--text-secondary)]">
            <p className="text-white font-semibold text-sm mb-1">{t('subscription.howToPay')}</p>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold">1.</span>
              {t('subscription.step1')}
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold">2.</span>
              {t('subscription.step2')}
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold">3.</span>
              {t('subscription.step3')}
            </li>
            <p className="text-[10px] text-[var(--text-muted)] pt-1">
              {t('subscription.noCardData')}
            </p>
          </ol>
        )}

        <p className="text-center text-[var(--text-muted)] text-[11px]">
          {t('subscription.paymentInfo')}
          {' · '}
          <Link to="/terms" className="text-amber-300/90 underline">
            {t('legal.terms')}
          </Link>
        </p>
      </div>
    </div>
  );
}
