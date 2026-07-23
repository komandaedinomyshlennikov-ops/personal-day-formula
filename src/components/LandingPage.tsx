import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { LanguageToggle } from './LanguageToggle';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, i18n } = useTranslation();

  // Energy data with translations - пересчитывается при смене языка
  const energies = useMemo(() => [
    { 
      num: 1, 
      planet: t('energies.1.name'), 
      eng: 'SUN',
      color: '#fbbf24',
      desc: t('energies.1.shortDesc')
    },
    { 
      num: 2, 
      planet: t('energies.2.name'), 
      eng: 'MOON',
      color: '#c0c0c0',
      desc: t('energies.2.shortDesc')
    },
    { 
      num: 3, 
      planet: t('energies.3.name'), 
      eng: 'JUPITER',
      color: '#f59e0b',
      desc: t('energies.3.shortDesc')
    },
    { 
      num: 4, 
      planet: t('energies.4.name'), 
      eng: 'RAHU',
      color: '#3b82f6',
      desc: t('energies.4.shortDesc')
    },
    { 
      num: 5, 
      planet: t('energies.5.name'), 
      eng: 'MERCURY',
      color: '#06b6d4',
      desc: t('energies.5.shortDesc')
    },
    { 
      num: 6, 
      planet: t('energies.6.name'), 
      eng: 'VENUS',
      color: '#ec4899',
      desc: t('energies.6.shortDesc')
    },
    { 
      num: 7, 
      planet: t('energies.7.name'), 
      eng: 'KETU',
      color: '#6366f1',
      desc: t('energies.7.shortDesc')
    },
    { 
      num: 8, 
      planet: t('energies.8.name'), 
      eng: 'SATURN',
      color: '#78716c',
      desc: t('energies.8.shortDesc')
    },
    { 
      num: 9, 
      planet: t('energies.9.name'), 
      eng: 'MARS',
      color: '#ef4444',
      desc: t('energies.9.shortDesc')
    },
  ], [t, i18n.language]);

  const features = useMemo(() => [
    { title: t('landing.features.personalYear'), desc: t('landing.features.personalYearDesc') },
    { title: t('landing.features.personalMonth'), desc: t('landing.features.personalMonthDesc') },
    { title: t('landing.features.personalDay'), desc: t('landing.features.personalDayDesc') },
    { title: t('landing.features.planetaryYear'), desc: t('landing.features.planetaryYearDesc') },
  ], [t, i18n.language]);

  const steps = useMemo(() => [
    { num: '01', title: t('landing.step1'), desc: t('landing.step1Desc') },
    { num: '02', title: t('landing.step2'), desc: t('landing.step2Desc') },
    { num: '03', title: t('landing.step3'), desc: t('landing.step3Desc') },
    { num: '04', title: t('landing.step4'), desc: t('landing.step4Desc') },
  ], [t, i18n.language]);

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Header with Language Toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-end">
          <LanguageToggle variant="pill" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-12 text-center min-h-[80vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-sm text-gray-400">{t('landing.badge')}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold mb-2 tracking-tight"
          >
            <span className="text-white">{t('landing.title1')}</span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold mb-6 tracking-tight gradient-text"
          >
            {t('landing.title2')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-amber-400 font-medium mb-4"
          >
            {t('landing.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm mx-auto"
          >
            {t('landing.description')}
          </motion.p>

          {/* CTA Button - Pill shape with extra rounding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="gradient-button w-full max-w-xs px-10 py-5"
              style={{ borderRadius: '9999px' }}
            >
              {t('landing.startButton')}
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>

          {/* Author */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 text-gray-500 text-sm"
          >
            {t('landing.footer.author')}
          </motion.p>
        </motion.div>
      </section>

      {/* What is Section */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {t('landing.whatIs')}
          </h2>
          <p className="text-gray-400 text-center leading-relaxed">
            {t('landing.whatIsDesc')}
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <p className="text-gray-400 italic leading-relaxed">
            "{t('landing.quote')}"
          </p>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            {t('landing.howItWorks')}
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="text-3xl font-bold gradient-text">{step.num}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 9 Energies Section */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {t('landing.energiesTitle')}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            {t('landing.energiesDesc')}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {energies.map((energy, index) => (
              <motion.div
                key={energy.num}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="energy-card rounded-xl"
              >
                <div 
                  className="text-4xl font-bold mb-3"
                  style={{ 
                    color: energy.color,
                    textShadow: `0 0 20px ${energy.color}40`
                  }}
                >
                  {energy.num}
                </div>
                <h3 className="text-white font-semibold mb-1">{energy.planet}</h3>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{energy.eng}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{energy.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('landing.ready')}
          </h2>
          <p className="text-gray-400 mb-8">
            {t('landing.readyDesc')}
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="gradient-button px-10 py-5"
            style={{ borderRadius: '9999px' }}
          >
            {t('landing.freeButton')}
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-md mx-auto text-center">
          <p className="text-white font-semibold mb-1">{t('landing.footer.title')}</p>
          <p className="text-gray-500 text-sm mb-4">{t('landing.footer.author')}</p>
          
          <div className="flex justify-center gap-4 mb-6">
            <a 
              href="https://t.me/tatianageniush" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-400 transition-colors text-sm"
            >
              {t('landing.footer.consultation')}
            </a>
            <a 
              href="tel:+375297801742" 
              className="text-gray-400 hover:text-amber-400 transition-colors text-sm"
            >
              +375 29 780 1742
            </a>
          </div>
          
          <p className="text-gray-600 text-xs">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
