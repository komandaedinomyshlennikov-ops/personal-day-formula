import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

/** Separate from AI coach memory (`astronavigator_coach_v1`) */
const TOUR_DONE_KEY = 'astronavigator_tour_done_v2';

export interface TourStep {
  id: string;
  /** Optional CSS selector for spotlight; omit for centered intro */
  target?: string;
  titleKey: string;
  bodyKey: string;
  tipKey?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'tour.welcomeTitle',
    bodyKey: 'tour.welcomeBody',
    tipKey: 'tour.welcomeTip',
  },
  {
    id: 'today',
    target: '[data-coach="today"]',
    titleKey: 'tour.todayTitle',
    bodyKey: 'tour.todayBody',
    tipKey: 'tour.todayTip',
  },
  {
    id: 'discuss',
    target: '[data-coach="discuss"]',
    titleKey: 'tour.discussTitle',
    bodyKey: 'tour.discussBody',
  },
  {
    id: 'colors',
    target: '[data-coach="legend"]',
    titleKey: 'tour.colorsTitle',
    bodyKey: 'tour.colorsBody',
    tipKey: 'tour.colorsTip',
  },
  {
    id: 'grid',
    target: '[data-coach="grid"]',
    titleKey: 'tour.gridTitle',
    bodyKey: 'tour.gridBody',
  },
  {
    id: 'checkin',
    target: '[data-coach="checkin"]',
    titleKey: 'tour.checkinTitle',
    bodyKey: 'tour.checkinBody',
    tipKey: 'tour.checkinTip',
  },
];

interface CoachMarksProps {
  enabled?: boolean;
  steps?: TourStep[];
}

export function CoachMarks({ enabled = true, steps = TOUR_STEPS }: CoachMarksProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) return;
    try {
      // v2 key; also treat old tour flag if user already finished v1 as plain "1"
      if (localStorage.getItem(TOUR_DONE_KEY) === '1') return;
      const legacy = localStorage.getItem('astronavigator_coach_v1');
      // Only skip if legacy is exactly "1" (old tour done), not JSON memory blob
      if (legacy === '1') {
        localStorage.setItem(TOUR_DONE_KEY, '1');
        return;
      }
    } catch {
      return;
    }
    const tmr = window.setTimeout(() => setActive(true), 700);
    return () => window.clearTimeout(tmr);
  }, [enabled]);

  const measure = useCallback(() => {
    const step = steps[stepIndex];
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // wait a frame for scroll
      window.requestAnimationFrame(() => {
        setRect(el.getBoundingClientRect());
      });
    } else {
      setRect(null);
    }
  }, [stepIndex, steps]);

  useEffect(() => {
    if (!active) return;
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    const id = window.setInterval(measure, 400);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      window.clearInterval(id);
    };
  }, [active, measure]);

  const finish = () => {
    try {
      localStorage.setItem(TOUR_DONE_KEY, '1');
    } catch {
      /* ignore */
    }
    setActive(false);
  };

  const next = () => {
    if (stepIndex >= steps.length - 1) finish();
    else setStepIndex((i) => i + 1);
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!active) return null;

  const step = steps[stepIndex];
  if (!step) return null;

  const pad = 10;
  const hole = rect
    ? {
        top: Math.max(6, rect.top - pad),
        left: Math.max(6, rect.left - pad),
        width: Math.min(window.innerWidth - 12, rect.width + pad * 2),
        height: rect.height + pad * 2,
      }
    : null;

  const cardH = 240;
  let cardTop: number;
  if (hole) {
    const below = hole.top + hole.height + 14;
    const above = hole.top - cardH - 8;
    if (below + cardH < window.innerHeight - 24) cardTop = below;
    else if (above > 16) cardTop = above;
    else cardTop = Math.max(16, window.innerHeight / 2 - cardH / 2);
  } else {
    cardTop = Math.max(80, window.innerHeight * 0.28);
  }

  const cardStyle: CSSProperties = {
    position: 'fixed',
    left: 16,
    right: 16,
    top: cardTop,
    zIndex: 80,
    maxWidth: 400,
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const isLast = stepIndex >= steps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        {/* Full dim */}
        <div
          className="absolute inset-0 bg-black/75"
          onClick={(e) => {
            e.stopPropagation();
            /* do not skip on backdrop — only via buttons */
          }}
          aria-hidden
        />

        {/* Spotlight hole */}
        {hole && (
          <div
            className="tour-spotlight"
            style={{
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
            }}
            aria-hidden
          />
        )}

        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22 }}
          className="tour-card glass-card p-4 rounded-2xl border border-amber-400/30 shadow-2xl"
          style={cardStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-amber-300 shrink-0" />
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/85 font-semibold">
                  {t('tour.badge')} · {stepIndex + 1}/{steps.length}
                </p>
              </div>
              <h3 id="tour-title" className="font-display text-[1.2rem] text-white leading-snug">
                {t(step.titleKey)}
              </h3>
            </div>
            <button
              type="button"
              onClick={finish}
              className="icon-btn !w-9 !h-9 shrink-0"
              aria-label={t('actions.close')}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
            {t(step.bodyKey)}
          </p>

          {step.tipKey && (
            <p className="mt-2.5 text-[11px] leading-snug text-amber-100/80 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
              {t(step.tipKey)}
            </p>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4 mb-3" aria-hidden>
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-5 bg-amber-300'
                    : i < stepIndex
                      ? 'w-1.5 bg-amber-300/50'
                      : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {isFirst ? (
              <button
                type="button"
                onClick={finish}
                className="btn-secondary flex-1 !min-h-[46px] !text-sm"
              >
                {t('tour.skip')}
              </button>
            ) : (
              <button
                type="button"
                onClick={back}
                className="btn-secondary flex-1 !min-h-[46px] !text-sm inline-flex items-center justify-center gap-1"
              >
                <ChevronLeft size={16} />
                {t('tour.back')}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="gradient-button flex-1 !min-h-[46px] !text-sm !py-2"
            >
              {isLast ? t('tour.done') : t('tour.next')}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Reset tour (e.g. from settings) */
export function resetHomeTour(): void {
  try {
    localStorage.removeItem(TOUR_DONE_KEY);
  } catch {
    /* ignore */
  }
}
