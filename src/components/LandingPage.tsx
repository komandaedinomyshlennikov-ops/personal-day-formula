import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, CalendarHeart, Stars, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { LanguageToggle } from './LanguageToggle';
import type { LanguageCode } from '@/i18n';

interface LandingPageProps {
  onStart: () => void;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export function LandingPage({ onStart, onLanguageChange }: LandingPageProps) {
  const { t, i18n } = useTranslation();

  const energies = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => ({
        num,
        planet: t(`energies.${num}.name`),
        eng: ['SUN', 'MOON', 'JUPITER', 'RAHU', 'MERCURY', 'VENUS', 'KETU', 'SATURN', 'MARS'][
          num - 1
        ],
        color: [
          '#f5d78e',
          '#d4d4d8',
          '#fbbf24',
          '#60a5fa',
          '#22d3ee',
          '#f472b6',
          '#818cf8',
          '#a8a29e',
          '#f87171',
        ][num - 1],
        desc: t(`energies.${num}.shortDesc`),
      })),
    [t, i18n.language]
  );

  const features = useMemo(
    () => [
      {
        icon: <Stars size={18} className="text-amber-300" />,
        title: t('landing.features.personalYear'),
        desc: t('landing.features.personalYearDesc'),
      },
      {
        icon: <CalendarHeart size={18} className="text-pink-300" />,
        title: t('landing.features.personalMonth'),
        desc: t('landing.features.personalMonthDesc'),
      },
      {
        icon: <Compass size={18} className="text-violet-300" />,
        title: t('landing.features.personalDay'),
        desc: t('landing.features.personalDayDesc'),
      },
      {
        icon: <Sparkles size={18} className="text-amber-200" />,
        title: t('landing.features.planetaryYear'),
        desc: t('landing.features.planetaryYearDesc'),
      },
    ],
    [t, i18n.language]
  );

  const steps = useMemo(
    () => [
      { num: '01', title: t('landing.step1'), desc: t('landing.step1Desc') },
      { num: '02', title: t('landing.step2'), desc: t('landing.step2Desc') },
      { num: '03', title: t('landing.step3'), desc: t('landing.step3Desc') },
      { num: '04', title: t('landing.step4'), desc: t('landing.step4Desc') },
    ],
    [t, i18n.language]
  );

  return (
    <div className="app-shell pb-28 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none">
        <div className="app-shell flex justify-between items-center pointer-events-auto">
          <div className="chip border-white/10 bg-black/20 backdrop-blur-md">
            <Sparkles size={12} className="text-amber-300" />
            <span className="text-[11px] tracking-wide">{t('landing.badge')}</span>
          </div>
          <LanguageToggle variant="pill" onLanguageChange={onLanguageChange} />
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-5 pt-24 pb-10 text-center min-h-[88vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm mx-auto w-full"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mb-8 w-20 h-20 rounded-[28px] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(145deg, rgba(245,215,142,0.25), rgba(167,139,250,0.2), rgba(244,114,182,0.15))',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 48px rgba(139,92,246,0.25)',
            }}
          >
            <span className="text-4xl" aria-hidden>
              ✨
            </span>
          </motion.div>

          <h1 className="font-display text-[2.75rem] sm:text-5xl leading-[1.05] mb-3 text-white">
            {t('landing.title1')}
          </h1>
          <h1 className="font-display text-[2.75rem] sm:text-5xl leading-[1.05] mb-5 gradient-text">
            {t('landing.title2')}
          </h1>

          <p className="text-amber-200/90 font-medium text-base mb-3 tracking-wide">
            {t('landing.subtitle')}
          </p>
          <p className="text-[var(--text-secondary)] text-[0.95rem] leading-relaxed mb-9 max-w-[20rem] mx-auto">
            {t('landing.description')}
          </p>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="gradient-button w-full"
          >
            {t('landing.startButton')}
            <ChevronRight size={18} />
          </motion.button>

          <p className="mt-8 text-[var(--text-muted)] text-sm">
            {t('landing.footer.author')}
          </p>
        </motion.div>
      </section>

      {/* What is */}
      <section className="px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 max-w-sm mx-auto text-center"
        >
          <h2 className="section-title mb-3">{t('landing.whatIs')}</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {t('landing.whatIsDesc')}
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-5 py-8">
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="glass-card p-4 rounded-2xl"
            >
              <div className="mb-3 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">
                {feature.title}
              </h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="px-5 py-10">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto text-center px-4"
        >
          <p className="font-display text-xl italic text-[var(--text-secondary)] leading-relaxed">
            “{t('landing.quote')}”
          </p>
        </motion.blockquote>
      </section>

      {/* Steps */}
      <section className="px-5 py-12">
        <div className="max-w-sm mx-auto">
          <h2 className="section-title text-center mb-8">{t('landing.howItWorks')}</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="flex items-start gap-4 glass-card p-4 rounded-2xl"
              >
                <span className="font-display text-2xl gradient-text min-w-[2.2rem]">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 text-[0.95rem]">{step.title}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Energies */}
      <section className="px-5 py-12">
        <div className="max-w-sm mx-auto">
          <h2 className="section-title text-center mb-2">{t('landing.energiesTitle')}</h2>
          <p className="text-center text-[var(--text-muted)] text-sm mb-8">
            {t('landing.energiesDesc')}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {energies.map((energy, index) => (
              <motion.div
                key={energy.num}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="energy-card !p-3"
              >
                <div
                  className="text-2xl font-bold mb-1 font-display"
                  style={{
                    color: energy.color,
                    textShadow: `0 0 18px ${energy.color}55`,
                  }}
                >
                  {energy.num}
                </div>
                <h3 className="text-white text-xs font-semibold leading-tight mb-0.5">
                  {energy.planet}
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  {energy.eng}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-14 text-center">
        <div className="max-w-sm mx-auto glass-card p-7 rounded-3xl">
          <h2 className="section-title mb-2">{t('landing.ready')}</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{t('landing.readyDesc')}</p>
          <motion.button whileTap={{ scale: 0.98 }} onClick={onStart} className="gradient-button w-full">
            {t('landing.freeButton')}
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </section>

      <footer className="px-5 py-10 border-t border-white/5">
        <div className="max-w-sm mx-auto text-center">
          <p className="font-display text-lg text-white mb-0.5">{t('landing.footer.title')}</p>
          <p className="text-[var(--text-muted)] text-sm mb-4">{t('landing.footer.author')}</p>
          <div className="flex justify-center gap-4 mb-5 text-sm">
            <a
              href="https://t.me/tatianageniush"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200/80 hover:text-amber-200 transition-colors"
            >
              {t('landing.footer.consultation')}
            </a>
            <a href="tel:+375297801742" className="text-[var(--text-muted)] hover:text-white transition-colors">
              +375 29 780 1742
            </a>
          </div>
          <p className="text-[var(--text-muted)] text-[11px] opacity-70">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none">
        <div className="app-shell pointer-events-auto">
          <button type="button" onClick={onStart} className="gradient-button w-full shadow-2xl">
            {t('landing.startButton')}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
