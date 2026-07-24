import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Calendar, Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OnboardingProps {
  onComplete: (birthDate: string, name?: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showDateInput, setShowDateInput] = useState(false);
  const [error, setError] = useState('');

  const slides = [
    {
      icon: Sparkles,
      title: t('onboarding.slide1Title'),
      subtitle: t('onboarding.slide1Subtitle'),
      description: t('onboarding.slide1Description'),
      color: '#8b5cf6'
    },
    {
      icon: Calendar,
      title: t('onboarding.slide2Title'),
      subtitle: t('onboarding.slide2Subtitle'),
      description: t('onboarding.slide2Description'),
      color: '#f59e0b'
    },
    {
      icon: Star,
      title: t('onboarding.slide3Title'),
      subtitle: t('onboarding.slide3Subtitle'),
      description: t('onboarding.slide3Description'),
      color: '#ec4899'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowDateInput(true);
    }
  };

  const handleStart = () => {
    if (!birthDate) {
      setError(t('errors.requiredField'));
      return;
    }

    // YYYY-MM-DD from input[type=date] — parse without timezone shift
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    if (!match) {
      setError(t('errors.invalidDate'));
      return;
    }
    const year = Number(match[1]);
    const age = new Date().getFullYear() - year;

    if (age < 0 || age > 120) {
      setError(t('errors.invalidDate'));
      return;
    }

    onComplete(birthDate, displayName.trim() || undefined);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <AnimatePresence mode="wait">
        {!showDateInput ? (
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
              style={{ 
                background: `linear-gradient(135deg, ${slides[currentSlide].color}40, ${slides[currentSlide].color}20)`,
                boxShadow: `0 0 40px ${slides[currentSlide].color}40`
              }}
            >
              <CurrentIcon size={48} style={{ color: slides[currentSlide].color }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-lg font-medium mb-4"
              style={{ color: slides[currentSlide].color }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-base leading-relaxed mb-8"
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* Slide indicators */}
            <div className="flex gap-2 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentSlide ? slides[currentSlide].color : '#374151',
                    width: index === currentSlide ? '24px' : '8px'
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="gradient-button rounded-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${slides[currentSlide].color}, ${slides[currentSlide].color}80)`
                }}
              >
                {currentSlide < slides.length - 1 ? t('actions.next') : t('actions.start')}
                <ChevronRight className="ml-2" size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="date-input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <User size={40} className="text-amber-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {t('onboarding.birthDateTitle')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-gray-400 text-sm mb-6"
            >
              {t('onboarding.birthDateDescription')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full mb-3"
            >
              <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2 text-left">
                {t('onboarding.nameLabel')}
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
                  placeholder={t('onboarding.namePlaceholder')}
                  autoComplete="given-name"
                  className="w-full pl-10 pr-4 py-3.5 text-white bg-white/5 border border-white/10 rounded-2xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-gray-600"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="w-full mb-4"
            >
              <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2 text-left">
                {t('onboarding.birthDateTitle')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-4 text-lg text-center bg-white/5 border border-white/10 text-white rounded-2xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                max={new Date().toISOString().split('T')[0]}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="gradient-button w-full rounded-2xl"
              >
                {t('onboarding.startTrial')}
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-xs mt-4"
            >
              {t('onboarding.trialNote')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
