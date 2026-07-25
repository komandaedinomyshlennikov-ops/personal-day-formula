import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar, Target, AlertTriangle, Star, Moon, Sparkle, Lock, Crown, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMonthRecommendation, getYearRecommendation } from '@/data/monthYearRecommendations';
import { getEnergyInfo } from '@/utils/numerology';
import { getBestWindows, getMonthTopDays } from '@/utils/premiumInsights';
import { dayToPath } from '@/utils/dayInfo';

interface MonthYearDetailProps {
  type: 'month' | 'year';
  number: number;
  onBack: () => void;
  /** Paid Pro (not trial) — unlocks full depth */
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  /** Birth date for real computed planner (Pro) */
  birthDate?: string | null;
  /** Path like /day/2026-07-25 */
  onSelectDay?: (path: string) => void;
}

type TabType = 'overview' | 'astro';

export function MonthYearDetail({
  type,
  number,
  onBack,
  isSubscribed = false,
  onSubscribe,
  birthDate,
  onSelectDay,
}: MonthYearDetailProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';

  const recommendation = type === 'month'
    ? getMonthRecommendation(number, t)
    : getYearRecommendation(number, t);

  const energyInfo = getEnergyInfo(number, t);
  const isMonth = type === 'month';
  // isSubscribed here means PAID Pro (App passes isPaid)
  const isPro = isSubscribed;

  // Trial sees teaser lists; Pro gets full depth
  const visibleFocus = isPro ? recommendation.focus : recommendation.focus.slice(0, 2);
  const visibleOpps = isPro
    ? recommendation.opportunities
    : recommendation.opportunities.slice(0, 2);
  const visibleChallenges = isPro
    ? recommendation.challenges
    : recommendation.challenges.slice(0, 1);

  const visibleAstroEvents = isPro
    ? recommendation.astroEvents
    : recommendation.astroEvents.slice(0, 2);

  const visibleSignificantDates = isPro
    ? recommendation.significantDates
    : [];

  const plannerWindows = useMemo(() => {
    if (!isPro || !birthDate) return [];
    const now = new Date();
    if (type === 'month') {
      return getMonthTopDays(birthDate, now.getFullYear(), now.getMonth() + 1, 6, t);
    }
    return getBestWindows(birthDate, 45, 6, t);
  }, [isPro, birthDate, type, t]);

  // Trial / free: no month/year deep content — only paywall
  if (!isPro) {
    return (
      <div className="min-h-screen pb-20">
        <header className="px-4 py-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
            type="button"
          >
            <ArrowLeft size={22} />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white">
              {isMonth ? t('calendar.personalMonth') : t('calendar.personalYear')}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <Lock size={12} className="text-amber-300" />
              Pro
            </p>
          </div>
        </header>
        <div className="px-4 py-8 flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-4">
            <Lock size={28} className="text-amber-300" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {isMonth ? t('premium.lockMonthTitle') : t('premium.lockYearTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            {isMonth ? t('premium.lockMonthBody') : t('premium.lockYearBody')}
          </p>
          <button
            type="button"
            onClick={onSubscribe}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-black bg-gradient-to-r from-amber-300 to-amber-400"
          >
            {t('premium.subscribeCta')}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 w-full py-2.5 text-sm text-[var(--text-muted)]"
          >
            {t('actions.cancel', { defaultValue: 'Назад' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
        >
          <ArrowLeft size={22} />
        </motion.button>
        <div>
          <h1 className="text-lg font-bold text-white">
            {isMonth ? t('calendar.personalMonth') : t('calendar.personalYear')}
          </h1>
          <p className="text-gray-400 text-sm">{energyInfo.planet}</p>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${energyInfo.color}15, ${energyInfo.color}05)`,
            borderColor: `${energyInfo.color}40`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ 
                backgroundColor: `${energyInfo.color}30`,
                boxShadow: `0 0 30px ${energyInfo.color}40`
              }}
            >
              {energyInfo.icon}
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">
                {isMonth ? t('calendar.personalMonth') : t('calendar.personalYear')}
              </p>
              <h2 className="text-3xl font-bold text-white">{number}</h2>
              <p style={{ color: energyInfo.color }} className="font-medium">
                {energyInfo.planet}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-white/10 border border-white/20 text-white'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Target size={16} />
              {t('recommendations.recommendations')}
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('astro')}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${
              activeTab === 'astro'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 border border-purple-400/50 text-purple-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Moon size={16} />
              {t('recommendations.astroEventsTitle')}
            </span>
          </motion.button>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Title & Description */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="text-white font-semibold mb-2">{recommendation.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {recommendation.description}
                </p>
              </div>

              {/* Focus Areas */}
              <div className="recommendation-section rounded-2xl">
                <h3>
                  <Target size={18} className="text-amber-400" />
                  {t('recommendations.focus')}
                </h3>
                <ul>
                  {visibleFocus.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                {!isPro && recommendation.focus.length > 2 && (
                  <button
                    type="button"
                    onClick={onSubscribe}
                    className="mt-2 text-xs text-amber-300/90 underline-offset-2 hover:underline"
                  >
                    {t('premium.lockedMonthYear')}
                  </button>
                )}
              </div>

              {/* Opportunities */}
              <div className="recommendation-section rounded-2xl">
                <h3>
                  <Star size={18} className="text-green-400" />
                  {t('recommendations.opportunities')}
                </h3>
                <ul>
                  {visibleOpps.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div
                className="recommendation-section rounded-2xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <h3>
                  <AlertTriangle size={18} className="text-red-400" />
                  {t('recommendations.challenges')}
                </h3>
                <ul>
                  {visibleChallenges.map((item, i) => (
                    <li key={i} style={{ color: '#fca5a5' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Pro: real calendar planner from birth date */}
              {isPro && plannerWindows.length > 0 && (
                <div className="glass-card p-4 rounded-2xl border border-emerald-400/25">
                  <h3 className="text-emerald-200 font-semibold mb-1 flex items-center gap-2 text-sm">
                    <CalendarCheck size={16} />
                    {isMonth
                      ? t('premium.monthTopTitle')
                      : t('premium.windowsTitle')}
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                      <Crown size={10} />
                      Pro
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-3">
                    {t('premium.plannerHint')}
                  </p>
                  <ul className="space-y-2">
                    {plannerWindows.map((w) => {
                      const e = getEnergyInfo(w.day.personalNumber, t);
                      const label = w.day.date.toLocaleDateString(locale, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      });
                      const path = dayToPath(w.day.date);
                      return (
                        <li key={path}>
                          <button
                            type="button"
                            onClick={() => onSelectDay?.(path)}
                            className="w-full text-left rounded-xl px-3 py-2 bg-emerald-400/8 border border-emerald-400/20"
                          >
                            <div className="flex items-center gap-2 text-sm text-emerald-50">
                              <span>{e.icon}</span>
                              <span className="font-medium">{label}</span>
                              <span className="opacity-70">№{w.day.personalNumber}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 pl-6 line-clamp-2">
                              {w.tip}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="astro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Astro Events Header */}
              <div className="glass-card p-4 border-purple-400/30 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))' }}
              >
                <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={18} />
                  {isMonth ? t('recommendations.monthAstroEvents') : t('recommendations.yearAstroEvents')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('recommendations.planetaryInfluences')}
                </p>
              </div>

              {/* Astro Events List */}
              {visibleAstroEvents.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-purple-400" />
                    </div>
                    <p className="text-gray-300 text-sm">{event}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* Premium Lock for more astro events */}
              {!isPro && recommendation.astroEvents.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 border-amber-400/30 cursor-pointer rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.03))' }}
                  onClick={onSubscribe}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Lock size={18} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-400 font-medium text-sm flex items-center gap-2">
                        <Crown size={14} />
                        {t('recommendations.premiumFeature')}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {t('recommendations.subscribeToSeeAll', { count: recommendation.astroEvents.length })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Significant Dates Section - Premium Only */}
              {isPro && visibleSignificantDates && visibleSignificantDates.length > 0 && (
                <>
                  <div className="glass-card p-4 border-indigo-400/30 mt-4 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))' }}
                  >
                    <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                      <Sparkle size={18} />
                      {t('recommendations.significantDates')}
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Crown size={10} />
                        PREMIUM
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t('recommendations.significantDatesDesc')}
                    </p>
                  </div>

                  {visibleSignificantDates.map((date, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-card p-4 border-l-4 rounded-2xl ${
                        date.impact === 'positive' 
                          ? 'border-l-green-400 bg-green-500/5' 
                          : date.impact === 'challenging'
                            ? 'border-l-amber-400 bg-amber-500/5'
                            : 'border-l-blue-400 bg-blue-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          date.impact === 'positive' 
                            ? 'bg-green-500/20' 
                            : date.impact === 'challenging'
                              ? 'bg-amber-500/20'
                              : 'bg-blue-500/20'
                        }`}>
                          <span className="text-lg">
                            {date.impact === 'positive' ? '✨' : date.impact === 'challenging' ? '⚡' : '◆'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-indigo-300 font-semibold text-sm">{date.date}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              date.impact === 'positive' 
                                ? 'bg-green-500/20 text-green-400' 
                                : date.impact === 'challenging'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {t(`recommendations.impact.${date.impact}`)}
                            </span>
                          </div>
                          <p className="text-white font-medium text-sm mb-1">{date.title}</p>
                          <p className="text-gray-400 text-xs">{date.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
              
              {/* Premium Lock for Significant Dates */}
              {!isPro && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 border-indigo-400/30 cursor-pointer rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.03))' }}
                  onClick={onSubscribe}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Lock size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-indigo-400 font-medium text-sm flex items-center gap-2">
                        <Crown size={14} />
                        {t('recommendations.significantDates')}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {t('subscription.unlockWithSubscription')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* How it affects you */}
              <div className="glass-card p-4 border-amber-400/20 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.03))' }}
              >
                <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={16} />
                  {t('recommendations.howItAffectsYou')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('recommendations.howItAffectsYouDesc')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
