import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar, Target, AlertTriangle, Star, Moon, Sparkle, Lock, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMonthRecommendation, getYearRecommendation } from '@/data/monthYearRecommendations';
import { getEnergyInfo } from '@/utils/numerology';

interface MonthYearDetailProps {
  type: 'month' | 'year';
  number: number;
  onBack: () => void;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
}

type TabType = 'overview' | 'astro';

export function MonthYearDetail({ type, number, onBack, isSubscribed = true, onSubscribe }: MonthYearDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const recommendation = type === 'month' 
    ? getMonthRecommendation(number, t) 
    : getYearRecommendation(number, t);
  
  const energyInfo = getEnergyInfo(number, t);
  const isMonth = type === 'month';
  
  // Limit visible astro events for non-subscribers
  const visibleAstroEvents = isSubscribed 
    ? recommendation.astroEvents 
    : recommendation.astroEvents.slice(0, 2);
  
  // Significant dates only for subscribers
  const visibleSignificantDates = isSubscribed 
    ? recommendation.significantDates 
    : [];

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
                  {recommendation.focus.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="recommendation-section rounded-2xl">
                <h3>
                  <Star size={18} className="text-green-400" />
                  {t('recommendations.opportunities')}
                </h3>
                <ul>
                  {recommendation.opportunities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div 
                className="recommendation-section rounded-2xl"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.2)' 
                }}
              >
                <h3>
                  <AlertTriangle size={18} className="text-red-400" />
                  {t('recommendations.challenges')}
                </h3>
                <ul>
                  {recommendation.challenges.map((item, i) => (
                    <li key={i} style={{ color: '#fca5a5' }}>{item}</li>
                  ))}
                </ul>
              </div>
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
              {!isSubscribed && recommendation.astroEvents.length > 2 && (
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
              {isSubscribed && visibleSignificantDates && visibleSignificantDates.length > 0 && (
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
              {!isSubscribed && (
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
