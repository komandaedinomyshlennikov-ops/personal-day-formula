import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Copy, Check, Send, MessageCircle, Facebook, Twitter, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SITE_URL } from '@/config/site';
import { calculatePersonalDay, getEnergyInfo } from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';
import { buildDayShareText, shareText } from '@/utils/shareDay';
import { getPersonalDayStory } from '@/utils/actionableDay';
import { renderDayShareCard, shareDayCardImage } from '@/utils/shareCardImage';
import { fromLocalDate, toLocalDate } from '@/utils/date';
import {
  calculateUniversalDayFromParts,
  isChallengingDay,
  isFavorableDay,
} from '@/utils/numerology';
import type { DayInfo } from '@/types';

interface ShareCalendarProps {
  onBack: () => void;
  birthDate?: string;
  displayName?: string;
}

function buildTodayDayInfo(birthDate: string): DayInfo {
  const now = new Date();
  const parts = fromLocalDate(now);
  const personalNumber = calculatePersonalDay(birthDate, now);
  const generalNumber = calculateUniversalDayFromParts(
    parts.year,
    parts.month,
    parts.day
  );
  return {
    date: toLocalDate(parts),
    personalNumber,
    generalNumber,
    isFavorable: isFavorableDay(personalNumber),
    isUnfavorable: isChallengingDay(personalNumber),
    isNeutral: !isFavorableDay(personalNumber) && !isChallengingDay(personalNumber),
    generalPlanet: '',
    personalPlanet: '',
  };
}

export function ShareCalendar({ onBack, birthDate, displayName }: ShareCalendarProps) {
  const [copied, setCopied] = useState(false);
  const [copiedDay, setCopiedDay] = useState(false);
  const [sharingCard, setSharingCard] = useState(false);
  const { t, i18n } = useTranslation();

  const shareUrl = SITE_URL;
  const shareTextApp = t('share.message');
  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';

  const todayDay = useMemo(
    () => (birthDate ? buildTodayDayInfo(birthDate) : null),
    [birthDate]
  );

  const todayPreview = useMemo(() => {
    if (!todayDay) return null;
    const energy = getEnergyInfo(todayDay.personalNumber, t);
    const { action } = getDayActionLine(todayDay.personalNumber, t);
    return { energy, action, number: todayDay.personalNumber };
  }, [todayDay, t, i18n.language]);

  const dayShareText = useMemo(
    () => (todayDay ? buildDayShareText(todayDay, t, locale) : ''),
    [todayDay, t, locale]
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('share.shareFailed'));
    }
  };

  const handleShareToday = async () => {
    if (!dayShareText) return;
    const result = await shareText(dayShareText);
    if (result === 'shared') toast.success(t('share.sharedDay'));
    else if (result === 'copied') {
      setCopiedDay(true);
      toast.success(t('share.copiedDay'));
      setTimeout(() => setCopiedDay(false), 2000);
    } else toast.error(t('share.shareFailed'));
  };

  const handleShareCardImage = async () => {
    if (!todayDay || sharingCard) return;
    setSharingCard(true);
    try {
      const story = getPersonalDayStory(todayDay.personalNumber, t);
      const energy = getEnergyInfo(todayDay.personalNumber, t);
      const { action } = getDayActionLine(todayDay.personalNumber, t);
      const canvas = renderDayShareCard({
        day: todayDay,
        name: displayName,
        storyTitle: story.storyTitle,
        action,
        doList: story.doList,
        tone: story.tone,
        toneLabel: story.toneLabel,
        planet: energy.planet,
        icon: energy.icon,
        brand: t('landing.footer.title', { defaultValue: 'AstroNavigator' }),
        footer: t('share.cardFooter'),
        locale,
      });
      const result = await shareDayCardImage(canvas);
      if (result === 'shared') toast.success(t('share.sharedCard'));
      else if (result === 'downloaded') toast.success(t('share.downloadedCard'));
      else toast.error(t('share.shareFailed'));
    } catch {
      toast.error(t('share.shareFailed'));
    }
    setSharingCard(false);
  };

  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTextApp)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTextApp + ' ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTextApp)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className="app-shell min-h-screen pb-10">
      <header className="app-header">
        <button type="button" onClick={onBack} className="icon-btn" aria-label={t('nav.back')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl text-white">{t('share.title')}</h1>
          <p className="text-[var(--text-muted)] text-xs">{t('share.subtitle')}</p>
        </div>
      </header>

      <div className="px-5 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Share TODAY energy — primary viral loop */}
          {todayPreview && todayDay && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 rounded-3xl border-amber-400/25"
              style={{
                background:
                  'linear-gradient(145deg, rgba(245,215,142,0.12), rgba(167,139,250,0.08))',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-amber-200/85 mb-3">
                {t('share.todayCard')}
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: `${todayPreview.energy.color}28` }}
                >
                  {todayPreview.energy.icon}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {todayPreview.number} · {todayPreview.energy.planet}
                  </p>
                  <p className="text-[var(--text-secondary)] text-xs leading-snug line-clamp-2">
                    {todayPreview.action}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void handleShareCardImage()}
                  disabled={sharingCard}
                  className="gradient-button w-full !min-h-[48px] !text-sm"
                >
                  <Sparkles size={16} />
                  {sharingCard ? t('share.sharingCard') : t('share.shareCard')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShareToday()}
                  className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {copiedDay ? <Check size={16} /> : <Share2 size={16} />}
                  {t('share.shareDay')}
                </button>
              </div>
            </motion.div>
          )}

          {/* App link card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-5 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{t('share.appLink')}</h3>
                <p className="text-[var(--text-muted)] text-xs">{t('app.tagline')}</p>
              </div>
            </div>

            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
              {shareTextApp}
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-[var(--text-muted)] text-xs outline-none min-w-0"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="p-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
                aria-label="Copy"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/25 transition-colors"
            >
              <Send size={18} className="text-[#0088cc]" />
              <span className="text-white text-sm font-medium">Telegram</span>
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#25d366]/15 hover:bg-[#25d366]/25 border border-[#25d366]/25 transition-colors"
            >
              <MessageCircle size={18} className="text-[#25d366]" />
              <span className="text-white text-sm font-medium">WhatsApp</span>
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#1da1f2]/15 hover:bg-[#1da1f2]/25 border border-[#1da1f2]/25 transition-colors"
            >
              <Twitter size={18} className="text-[#1da1f2]" />
              <span className="text-white text-sm font-medium">X</span>
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#1877f2]/15 hover:bg-[#1877f2]/25 border border-[#1877f2]/25 transition-colors"
            >
              <Facebook size={18} className="text-[#1877f2]" />
              <span className="text-white text-sm font-medium">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
