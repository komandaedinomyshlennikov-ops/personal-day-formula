import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  CalendarHeart,
  Stars,
  Compass,
  Shield,
  Clock,
  Gift,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { LanguageToggle } from './LanguageToggle';
import type { LanguageCode } from '@/i18n';
import { calculateUniversalDay, getEnergyInfo } from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';

interface LandingPageProps {
  onStart: () => void;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export function LandingPage({ onStart, onLanguageChange }: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const [energiesOpen, setEnergiesOpen] = useState(false);

  const demo = useMemo(() => {
    const num = calculateUniversalDay(new Date());
    const energy = getEnergyInfo(num, t);
    const { action, tone } = getDayActionLine(num, t);
    return { num, energy, action, tone };
  }, [t, i18n.language]);

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

  const toneBorder =
    demo.tone === 'favorable'
      ? 'border-emerald-400/40'
      : demo.tone === 'challenging'
        ? 'border-rose-400/40'
        : 'border-amber-400/35';

  return (
    <div className="app-shell pb-28 overflow-x-hidden">
      <header className="landing-topbar">
        <div className="landing-topbar__inner">
          <div className="landing-topbar__badge" title={t('landing.badge')}>
            <Gift size={12} className="text-emerald-300 shrink-0" />
            <span className="truncate">{t('landing.badge')}</span>
          </div>
          <div className="landing-topbar__lang">
            <LanguageToggle variant="pill" onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </header>

      {/* HERO — visual hierarchy: title → value → colors → CTA */}
      <section className="relative px-5 landing-hero pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm mx-auto w-full"
        >
          <p className="landing-kicker mb-3">{t('landing.kicker')}</p>

          <h1 className="font-display landing-hero-title text-white mb-4">
            {t('landing.heroTitle')}
            <span className="block gradient-text mt-1">{t('landing.heroTitleAccent')}</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-[0.95rem] leading-relaxed mb-5 max-w-[22rem] mx-auto">
            {t('landing.heroLead')}
          </p>

          {/* Instant color system — 1-second comprehension */}
          <ul className="landing-color-legend mb-6 text-left">
            <li>
              <span className="dot-fav" aria-hidden />
              <span>{t('landing.legendGreen')}</span>
            </li>
            <li>
              <span className="dot-neu" aria-hidden />
              <span>{t('landing.legendYellow')}</span>
            </li>
            <li>
              <span className="dot-hard" aria-hidden />
              <span>{t('landing.legendRed')}</span>
            </li>
          </ul>

          {/* Live preview card */}
          <motion.button
            type="button"
            onClick={onStart}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.985 }}
            className={`w-full text-left glass-card p-4 rounded-3xl mb-5 border ${toneBorder} landing-preview-card`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.14em] text-amber-200/90 font-semibold">
                {t('landing.previewLabel')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {t('landing.previewToday')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{
                  background: `${demo.energy.color}28`,
                  boxShadow: `0 0 32px ${demo.energy.color}40`,
                }}
              >
                {demo.energy.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-[1.05rem]">
                  {demo.num} · {demo.energy.planet}
                </p>
                <p className="text-[var(--text-secondary)] text-xs leading-snug mt-1 line-clamp-2">
                  {demo.action}
                </p>
                <p className="text-[10px] text-amber-200/75 mt-1.5 font-medium">
                  {t('landing.previewPersonalHint')}
                </p>
              </div>
              <ChevronRight size={18} className="text-amber-200/80 shrink-0" />
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="gradient-button gradient-button--hero w-full"
          >
            <Sparkles size={18} />
            {t('landing.startButton')}
            <ChevronRight size={18} />
          </motion.button>
          <p className="mt-3 text-[11px] text-[var(--text-muted)]">{t('landing.ctaHint')}</p>

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <span className="chip">
              <Clock size={11} className="text-amber-200" />
              {t('landing.trust1')}
            </span>
            <span className="chip">
              <Shield size={11} className="text-emerald-300" />
              {t('landing.trust2')}
            </span>
            <span className="chip">
              <Gift size={11} className="text-violet-300" />
              {t('landing.trust3')}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Why return daily */}
      <section className="px-5 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto glass-card p-5 rounded-3xl text-left border border-white/10"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-violet-200/85 font-semibold mb-2">
            {t('landing.habitLabel')}
          </p>
          <h2 className="font-display text-[1.55rem] text-white leading-tight mb-2">
            {t('landing.habitTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {t('landing.habitBody')}
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-5 py-4">
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
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

      {/* How it works + method trust */}
      <section className="px-5 py-10">
        <div className="max-w-sm mx-auto">
          <h2 className="section-title text-center mb-2 text-[1.65rem]">
            {t('landing.howItWorks')}
          </h2>
          <p className="text-center text-[var(--text-muted)] text-sm mb-7 max-w-xs mx-auto">
            {t('landing.howItWorksLead')}
          </p>
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
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

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-amber-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  {t('landing.methodTitle')}
                </h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-2">
                  {t('landing.methodBody')}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {t('landing.methodDisclaimer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-5 py-6">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto text-center px-4"
        >
          <p className="font-display text-[1.45rem] italic text-[var(--text-secondary)] leading-relaxed">
            “{t('landing.quote')}”
          </p>
        </motion.blockquote>
      </section>

      {/* Energies */}
      <section className="px-5 py-8">
        <div className="max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setEnergiesOpen((v) => !v)}
            className="w-full glass-card p-4 rounded-2xl flex items-center justify-between gap-3 text-left"
            aria-expanded={energiesOpen}
          >
            <div>
              <h2 className="font-display text-xl text-white leading-tight">
                {t('landing.energiesTitle')}
              </h2>
              <p className="text-[var(--text-muted)] text-xs mt-1">{t('landing.energiesDesc')}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-amber-200/90 text-xs font-medium">
              <span>
                {energiesOpen ? t('landing.energiesHide') : t('landing.energiesToggle')}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${energiesOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          <AnimatePresence>
            {energiesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2.5 pt-4">
                  {energies.map((energy) => (
                    <div key={energy.num} className="energy-card !p-3">
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
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-12 text-center">
        <div className="max-w-sm mx-auto glass-card p-7 rounded-3xl">
          <h2 className="section-title mb-2 text-[1.65rem]">{t('landing.ready')}</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-5">{t('landing.readyDesc')}</p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="gradient-button gradient-button--hero w-full"
          >
            <Sparkles size={18} />
            {t('landing.freeButton')}
            <ChevronRight size={18} />
          </motion.button>
          <p className="mt-2.5 text-[11px] text-[var(--text-muted)]">{t('landing.ctaHint')}</p>
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
            <a
              href="tel:+375297801742"
              className="text-[var(--text-muted)] hover:text-white transition-colors"
            >
              +375 29 780 1742
            </a>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-3 max-w-xs mx-auto">
            {t('landing.methodDisclaimer')}
          </p>
          <p className="text-[var(--text-muted)] text-[11px] opacity-70">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pointer-events-none">
        <div className="app-shell pointer-events-auto">
          <button
            type="button"
            onClick={onStart}
            className="gradient-button gradient-button--hero w-full shadow-2xl"
          >
            <Sparkles size={16} />
            {t('landing.startButton')}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
