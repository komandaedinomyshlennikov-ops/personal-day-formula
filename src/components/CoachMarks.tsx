import { useEffect, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'astronavigator_coach_v1';

export interface CoachStep {
  id: string;
  /** CSS selector for spotlight target */
  target: string;
  titleKey: string;
  bodyKey: string;
}

const DEFAULT_STEPS: CoachStep[] = [
  {
    id: 'today',
    target: '[data-coach="today"]',
    titleKey: 'coach.todayTitle',
    bodyKey: 'coach.todayBody',
  },
  {
    id: 'colors',
    target: '[data-coach="legend"]',
    titleKey: 'coach.colorsTitle',
    bodyKey: 'coach.colorsBody',
  },
  {
    id: 'tap',
    target: '[data-coach="grid"]',
    titleKey: 'coach.tapTitle',
    bodyKey: 'coach.tapBody',
  },
];

interface CoachMarksProps {
  enabled?: boolean;
  steps?: CoachStep[];
}

export function CoachMarks({ enabled = true, steps = DEFAULT_STEPS }: CoachMarksProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      return;
    }
    // slight delay so layout settles
    const tmr = window.setTimeout(() => setActive(true), 600);
    return () => clearTimeout(tmr);
  }, [enabled]);

  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) return;

    const update = () => {
      const el = document.querySelector(step.target);
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        setRect(null);
      }
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active, stepIndex, steps]);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setActive(false);
  };

  const next = () => {
    if (stepIndex >= steps.length - 1) finish();
    else setStepIndex((i) => i + 1);
  };

  if (!active) return null;

  const step = steps[stepIndex];
  const pad = 8;
  const hole = rect
    ? {
        top: Math.max(8, rect.top - pad),
        left: Math.max(8, rect.left - pad),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // Card position: below target if space, else above
  const cardStyle: CSSProperties = hole
    ? {
        position: 'fixed',
        left: 16,
        right: 16,
        top:
          hole.top + hole.height + 12 + 200 < window.innerHeight
            ? hole.top + hole.height + 12
            : Math.max(16, hole.top - 180),
        zIndex: 80,
      }
    : {
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 100,
        zIndex: 80,
      };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={t('coach.title', { defaultValue: 'Quick tour' })}
      >
        {/* Dim with spotlight hole via box-shadow */}
        <div
          className="absolute inset-0"
          onClick={next}
          style={
            hole
              ? {
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.72)`,
                  borderRadius: 20,
                  top: hole.top,
                  left: hole.left,
                  width: hole.width,
                  height: hole.height,
                  pointerEvents: 'none',
                }
              : { background: 'rgba(0,0,0,0.72)' }
          }
        />
        {/* Click catcher outside hole */}
        <div className="absolute inset-0" onClick={next} aria-hidden />

        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="glass-card p-4 rounded-2xl border-amber-400/25 shadow-2xl"
          style={cardStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-amber-200/80 mb-1">
                {t('coach.step', {
                  current: stepIndex + 1,
                  total: steps.length,
                  defaultValue: `{{current}} / {{total}}`,
                })}
              </p>
              <h3 className="font-display text-lg text-white leading-snug">
                {t(step.titleKey)}
              </h3>
            </div>
            <button
              type="button"
              onClick={finish}
              className="icon-btn !w-9 !h-9"
              aria-label={t('actions.close', { defaultValue: 'Close' })}
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
            {t(step.bodyKey)}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={finish} className="btn-secondary flex-1 !min-h-[44px] !text-sm">
              {t('coach.skip', { defaultValue: 'Skip' })}
            </button>
            <button type="button" onClick={next} className="gradient-button flex-1 !min-h-[44px] !text-sm !py-2">
              {stepIndex >= steps.length - 1
                ? t('coach.done', { defaultValue: 'Got it' })
                : t('coach.next', { defaultValue: 'Next' })}
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
