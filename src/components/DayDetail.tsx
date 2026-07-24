import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { ArrowLeft, Send, Phone, Mail, BookOpen, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DayInfo } from '@/types';
import { getEnergyInfo, formatDate, getDayOfWeekName, isZeroDay } from '@/utils/numerology';
import { getAstroRecommendations } from '@/data/astroRecommendations';
import { buildDayShareText, shareText } from '@/utils/shareDay';
import { GlossaryTooltip } from './GlossaryTooltip';
import { UseCaseExamples } from './UseCaseExamples';

interface DayDetailProps {
  day: DayInfo;
  onBack: () => void;
}

type TabType = 'personal' | 'universal' | 'examples';

export function DayDetail({ day, onBack }: DayDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [sharing, setSharing] = useState(false);
  
  const generalInfo = getEnergyInfo(day.generalNumber, t);
  const personalInfo = getEnergyInfo(day.personalNumber, t);
  const astroRecs = getAstroRecommendations(day.generalNumber, t);
  const isZero = isZeroDay(day.date);
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
  
  // Get translated day favorability text
  const getFavorableText = () => {
    if (day.isFavorable) return t('calendar.favorable');
    if (day.isUnfavorable) return t('calendar.completion');
    return t('calendar.neutral');
  };
  
  const getFavorableDescription = () => {
    if (day.isFavorable) return t('dayDetail.favorableDesc');
    if (day.isUnfavorable) return t('dayDetail.completionDesc');
    return t('dayDetail.neutralDesc');
  };

  const handleShareDay = async () => {
    if (sharing) return;
    setSharing(true);
    const text = buildDayShareText(day, t, locale);
    const result = await shareText(text);
    if (result === 'shared') toast.success(t('share.sharedDay'));
    else if (result === 'copied') toast.success(t('share.copiedDay'));
    else toast.error(t('share.shareFailed'));
    setSharing(false);
  };

  return (
    <div className="app-shell min-h-screen pb-10">
      <header className="app-header justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-xl text-white leading-tight truncate">
              {formatDate(day.date, locale)}
            </h1>
            <p className="text-[var(--text-muted)] text-xs">{getDayOfWeekName(day.date, t)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleShareDay()}
          className="icon-btn"
          disabled={sharing}
          title={t('share.shareDay')}
          aria-label={t('share.shareDay')}
        >
          <Share2 size={17} />
        </button>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Zero Day Warning */}
        {isZero && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border-indigo-400/40 bg-indigo-500/10 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⏸️</span>
              </div>
              <div>
                <p className="text-indigo-300 font-semibold">{t('dayDetail.zeroDayTitle')}</p>
                <p className="text-gray-400 text-sm">
                  {t('dayDetail.zeroDayDesc')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`tab-pill ${activeTab === 'personal' ? 'tab-pill--on' : ''}`}
          >
            <span className="flex items-center justify-center gap-1">
              <span>{personalInfo.icon}</span>
              <span>
                {day.personalNumber}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('universal')}
            className={`tab-pill ${activeTab === 'universal' ? 'tab-pill--on' : ''}`}
          >
            <span className="flex items-center justify-center gap-1">
              <span>{generalInfo.icon}</span>
              <span>{day.generalNumber}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`tab-pill ${activeTab === 'examples' ? 'tab-pill--on' : ''}`}
          >
            <span className="flex items-center justify-center gap-1">
              <BookOpen size={14} />
              <span>{t('dayDetail.examples')}</span>
            </span>
          </button>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Personal Day Header */}
              <div className="glass-card p-5 border-amber-400/30 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ 
                      backgroundColor: `${personalInfo.color}30`,
                      boxShadow: `0 0 30px ${personalInfo.color}40`
                    }}
                  >
                    {personalInfo.icon}
                  </div>
                  <div>
                    <p className="text-amber-400 text-sm font-medium mb-1">{t('dayDetail.personalDay')}</p>
                    <h2 className="text-3xl font-bold text-white">{day.personalNumber}</h2>
                    <p style={{ color: personalInfo.color }} className="font-medium">
                      <GlossaryTooltip term={personalInfo.planet}>
                        {personalInfo.planet}
                      </GlossaryTooltip>
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Day Description */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="text-white font-semibold mb-2">{personalInfo.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{personalInfo.description}</p>
              </div>

              {/* Personal Recommendations */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                  <span>✦</span>
                  {t('dayDetail.personalRecommendations')}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{t('dayDetail.favorable')}</p>
                    {personalInfo.positive.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{t('dayDetail.avoid')}</p>
                    {personalInfo.negative.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="text-red-400 mt-0.5">✕</span>
                        <span className="text-gray-400 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'universal' && (
            <motion.div
              key="universal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Universal Day Header */}
              <div className="glass-card p-5 border-purple-400/30 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ 
                      backgroundColor: `${generalInfo.color}30`,
                      boxShadow: `0 0 30px ${generalInfo.color}40`
                    }}
                  >
                    {generalInfo.icon}
                  </div>
                  <div>
                    <p className="text-purple-400 text-sm font-medium mb-1">{t('dayDetail.universalDay')}</p>
                    <h2 className="text-3xl font-bold text-white">{day.generalNumber}</h2>
                    <p style={{ color: generalInfo.color }} className="font-medium">
                      <GlossaryTooltip term={generalInfo.planet}>
                        {generalInfo.planet}
                      </GlossaryTooltip>
                    </p>
                  </div>
                </div>
              </div>

              {/* Universal Day Description */}
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="text-white font-semibold mb-2">{generalInfo.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{generalInfo.description}</p>
              </div>

              {/* Astro Recommendations */}
              <h3 className="text-white font-semibold pt-2 flex items-center gap-2">
                <span className="text-purple-400">✦</span>
                {t('dayDetail.universalRecommendations')}
              </h3>

              {/* Astro Character */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.astroCharacter.icon}</span>
                  {astroRecs.astroCharacter.title}
                </h3>
                <ul>
                  {astroRecs.astroCharacter.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Career */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.career.icon}</span>
                  {astroRecs.career.title}
                </h3>
                <ul>
                  {astroRecs.career.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Relationships */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.relationships.icon}</span>
                  {astroRecs.relationships.title}
                </h3>
                <ul>
                  {astroRecs.relationships.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Finance */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.finance.icon}</span>
                  {astroRecs.finance.title}
                </h3>
                <ul>
                  {astroRecs.finance.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Health */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.health.icon}</span>
                  {astroRecs.health.title}
                </h3>
                <ul>
                  {astroRecs.health.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Lucky Actions */}
              <div className="recommendation-section">
                <h3>
                  <span className="text-xl">{astroRecs.luckyActions.icon}</span>
                  {astroRecs.luckyActions.title}
                </h3>
                <ul>
                  {astroRecs.luckyActions.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Avoid */}
              <div 
                className="recommendation-section"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.2)' 
                }}
              >
                <h3>
                  <span className="text-xl">{astroRecs.avoid.icon}</span>
                  {astroRecs.avoid.title}
                </h3>
                <ul>
                  {astroRecs.avoid.items.map((item, i) => (
                    <li key={i} style={{ color: '#fca5a5' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
          {activeTab === 'examples' && (
            <motion.div
              key="examples"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Examples Header */}
              <div className="glass-card p-4 border-green-400/30 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <BookOpen size={24} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-medium mb-1">{t('dayDetail.examples')}</p>
                    <h2 className="text-xl font-bold text-white">{t('dayDetail.howToPlan')}</h2>
                  </div>
                </div>
              </div>

              {/* Use Case Examples Component */}
              <UseCaseExamples />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Favorability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`
            rounded-2xl p-4 border
            ${day.isFavorable 
              ? 'bg-green-500/10 border-green-400/30' 
              : day.isUnfavorable 
                ? 'bg-red-500/10 border-red-400/30'
                : 'bg-yellow-500/10 border-yellow-400/30'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${day.isFavorable 
                ? 'bg-green-500/30' 
                : day.isUnfavorable 
                  ? 'bg-red-500/30'
                  : 'bg-yellow-500/30'
              }
            `}>
              {day.isFavorable ? (
                <span className="text-green-400 text-xl">✓</span>
              ) : day.isUnfavorable ? (
                <span className="text-red-400 text-xl">✕</span>
              ) : (
                <span className="text-yellow-400 text-xl">!</span>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">
                {getFavorableText()}
              </p>
              <p className="text-gray-400 text-sm">
                {getFavorableDescription()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 rounded-2xl"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Send size={18} className="text-amber-400" />
            {t('dayDetail.consultation')}
          </h3>
          
          <div className="space-y-3">
            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="https://t.me/tatianageniush"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Send size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">@tatianageniush</p>
                <p className="text-gray-400 text-xs">Telegram</p>
              </div>
            </motion.a>

            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="tel:+375297801742"
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Phone size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">+375 29 780 1742</p>
                <p className="text-gray-400 text-xs">{t('settings.telegram')}</p>
              </div>
            </motion.a>

            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="mailto:calibrigenus@gmail.com"
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Mail size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">calibrigenus@gmail.com</p>
                <p className="text-gray-400 text-xs">{t('settings.email')}</p>
              </div>
            </motion.a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
