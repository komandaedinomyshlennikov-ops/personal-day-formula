import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Copy, Check, Send, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ShareCalendarProps {
  onBack: () => void;
}

export function ShareCalendar({ onBack }: ShareCalendarProps) {
  const [copied, setCopied] = useState(false);
  const { t, i18n } = useTranslation();
  
  const shareUrl = 'https://y5nr5as4xgics.ok.kimi.link/';
  const shareText = i18n.language === 'ru' 
    ? 'Открой свою персональную энергетику с Астронавигатором! 🌟 Мой личный календарь по дате рождения.'
    : 'Check your daily energy with AstroNavigator! 🌟 My personal calendar based on birth date.';
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
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
        <div>
          <h1 className="text-lg font-bold text-white">{t('share.title')}</h1>
          <p className="text-gray-400 text-sm">{t('share.subtitle')}</p>
        </div>
      </header>

      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Share2 size={40} className="text-amber-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('share.title')}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('share.subtitle')}
            </p>
          </div>

          {/* Share Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                }}
              >
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{t('app.name')}</h3>
                <p className="text-gray-400 text-sm">{t('app.tagline')}</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {shareText}
            </p>
            
            {/* Copy Link */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-gray-400 text-sm outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/30 transition-colors"
            >
              <Send size={20} className="text-[#0088cc]" />
              <span className="text-white font-medium">Telegram</span>
            </a>
            
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#25d366]/20 hover:bg-[#25d366]/30 border border-[#25d366]/30 transition-colors"
            >
              <MessageCircle size={20} className="text-[#25d366]" />
              <span className="text-white font-medium">WhatsApp</span>
            </a>
            
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#1da1f2]/20 hover:bg-[#1da1f2]/30 border border-[#1da1f2]/30 transition-colors"
            >
              <Twitter size={20} className="text-[#1da1f2]" />
              <span className="text-white font-medium">Twitter</span>
            </a>
            
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#1877f2]/20 hover:bg-[#1877f2]/30 border border-[#1877f2]/30 transition-colors"
            >
              <Facebook size={20} className="text-[#1877f2]" />
              <span className="text-white font-medium">Facebook</span>
            </a>
          </motion.div>

          {/* Native Share */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => {
                navigator.share({
                  title: t('app.name'),
                  text: shareText,
                  url: shareUrl,
                });
              }}
              className="w-full mt-4 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              {t('share.shareVia')}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
