import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { recordHomeMetric } from '@/lib/homeMetrics';

/** Separate from AI coach memory (`astronavigator_coach_v1`) */
export const TOUR_DONE_KEY = 'astronavigator_tour_done_v2';
const FIRST_HINT_KEY = 'astronavigator_home_first_hint_v1';

/** Calendar listens to switch Week/Month for off-screen targets */
export const TOUR_STEP_EVENT = 'astronavigator:tour-step';
export const TOUR_ACTIVE_EVENT = 'astronavigator:tour-active';
export const TOUR_RESTART_EVENT = 'astronavigator:tour-restart';

export type TourHomeTab = 'week' | 'month';

export interface TourStep {
  id: string;
  /** Optional CSS selector for spotlight; omit for centered intro */
  target?: string;
  /** Preferred home tab so the target is mounted */
  preferTab?: TourHomeTab;
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
    preferTab: 'week',
    titleKey: 'tour.discussTitle',
    bodyKey: 'tour.discussBody',
  },
  {
    id: 'checkin',
    target: '[data-coach="checkin"]',
    preferTab: 'week',
    titleKey: 'tour.checkinTitle',
    bodyKey: 'tour.checkinBody',
    tipKey: 'tour.checkinTip',
  },
  {
    id: 'colors',
    target: '[data-coach="legend"]',
    preferTab: 'month',
    titleKey: 'tour.colorsTitle',
    bodyKey: 'tour.colorsBody',
    tipKey: 'tour.colorsTip',
  },
  {
    id: 'grid',
    target: '[data-coach="grid"]',
    preferTab: 'month',
    titleKey: 'tour.gridTitle',
    bodyKey: 'tour.gridBody',
  },
];

interface CoachMarksProps {
  enabled?: boolean;
  steps?: TourStep[];
  /** Called when tour wants a home tab (week/month) for the next spotlight */
  onPreferTab?: (tab: TourHomeTab) => void;
  /** Force remount key from parent after Settings “replay” */
  restartToken?: number;
}

function isTourDone(): boolean {
  try {
    if (localStorage.getItem(TOUR_DONE_KEY) === '1') return true;
    const legacy = localStorage.getItem('astronavigator_coach_v1');
    // Only skip if legacy is exactly "1" (old tour done), not JSON memory blob
    if (legacy === '1') {
      localStorage.setItem(TOUR_DONE_KEY, '1');
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

function markTourDone(): void {
  try {
    localStorage.setItem(TOUR_DONE_KEY, '1');
    // Don't re-show the one-liner banner after a full tour
    localStorage.setItem(FIRST_HINT_KEY, '1');
  } catch {
    /* ignore */
  }
}

function dispatchTourActive(active: boolean): void {
  try {
    window.dispatchEvent(
      new CustomEvent(TOUR_ACTIVE_EVENT, { detail: { active } })
    );
  } catch {
    /* ignore */
  }
}

function dispatchTourStep(step: TourStep, index: number, total: number): void {
  try {
    window.dispatchEvent(
      new CustomEvent(TOUR_STEP_EVENT, {
        detail: {
          id: step.id,
          preferTab: step.preferTab,
          index,
          total,
        },
      })
    );
  } catch {
    /* ignore */
  }
}

export function CoachMarks({
  enabled = true,
  steps = TOUR_STEPS,
  onPreferTab,
  restartToken = 0,
}: CoachMarksProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const bodyId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardHeight, setCardHeight] = useState(220);
  const [targetMissing, setTargetMissing] = useState(false);

  // Start (or restart) tour
  useEffect(() => {
    if (!enabled) return;
    if (restartToken === 0 && isTourDone()) return;

    setStepIndex(0);
    setRect(null);
    const delay = restartToken > 0 ? 280 : 550;
    const tmr = window.setTimeout(() => {
      setActive(true);
      dispatchTourActive(true);
    }, delay);
    return () => window.clearTimeout(tmr);
  }, [enabled, restartToken]);

  // External restart from Settings (same Calendar instance)
  useEffect(() => {
    const onRestart = () => {
      try {
        localStorage.removeItem(TOUR_DONE_KEY);
      } catch {
        /* ignore */
      }
      setStepIndex(0);
      setRect(null);
      setActive(true);
      dispatchTourActive(true);
    };
    window.addEventListener(TOUR_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(TOUR_RESTART_EVENT, onRestart);
  }, []);

  // Notify home about preferred tab for this step
  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) return;
    dispatchTourStep(step, stepIndex, steps.length);
    if (step.preferTab) onPreferTab?.(step.preferTab);
  }, [active, stepIndex, steps, onPreferTab]);

  const measure = useCallback(() => {
    const step = steps[stepIndex];
    if (!step?.target) {
      setRect(null);
      setTargetMissing(false);
      return;
    }
    const el = document.querySelector(step.target);
    if (el instanceof HTMLElement) {
      setTargetMissing(false);
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Wait for scroll + layout (tab switch may remount target)
      window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) setRect(r);
        else setRect(null);
      }, 120);
    } else {
      setRect(null);
      setTargetMissing(true);
    }
  }, [stepIndex, steps]);

  useEffect(() => {
    if (!active) return;
    measure();
    // Retry while tab content mounts
    const retries = [200, 450, 800].map((ms) => window.setTimeout(measure, ms));
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    const id = window.setInterval(measure, 600);
    return () => {
      retries.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      window.clearInterval(id);
    };
  }, [active, measure]);

  useLayoutEffect(() => {
    if (!active || !cardRef.current) return;
    setCardHeight(cardRef.current.getBoundingClientRect().height);
  }, [active, stepIndex, targetMissing]);

  // Focus primary action when step changes
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => nextBtnRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [active, stepIndex]);

  const finish = useCallback(
    (reason: 'done' | 'skip') => {
      markTourDone();
      setActive(false);
      dispatchTourActive(false);
      try {
        recordHomeMetric(
          reason === 'skip' ? 'home_first_hint_dismiss' : 'home_first_hint_dismiss',
          { action: reason === 'skip' ? 'tour_skip' : 'tour_done' }
        );
      } catch {
        /* ignore */
      }
    },
    []
  );

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) finish('done');
    else setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, finish]);

  const back = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  // Keyboard
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish('skip');
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON' && e.key === 'Enter') return;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, back, finish]);

  // Touch swipe on card
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (dx < -48) next();
    else if (dx > 48) back();
  };

  if (!active) return null;

  const step = steps[stepIndex];
  if (!step) return null;

  const pad = 8;
  const hole = rect
    ? {
        top: Math.max(4, rect.top - pad),
        left: Math.max(4, rect.left - pad),
        width: Math.min(window.innerWidth - 8, rect.width + pad * 2),
        height: Math.min(window.innerHeight - 8, rect.height + pad * 2),
      }
    : null;

  /**
   * Mobile-first: card docks to bottom (above bottom nav ~72px),
   * unless hole is in the lower half — then float above the hole.
   */
  const navClearance = 76;
  const gap = 12;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;
  let cardTop: number | undefined;
  let cardBottom: number | undefined;

  if (hole) {
    const holeBottom = hole.top + hole.height;
    const spaceBelow = vh - holeBottom - navClearance;
    const spaceAbove = hole.top - 12;
    if (spaceBelow >= cardHeight + gap) {
      cardTop = holeBottom + gap;
      cardBottom = undefined;
    } else if (spaceAbove >= cardHeight + gap) {
      cardTop = Math.max(12, hole.top - cardHeight - gap);
      cardBottom = undefined;
    } else {
      // Not enough room — dock bottom sheet
      cardTop = undefined;
      cardBottom = navClearance;
    }
  } else {
    cardTop = undefined;
    cardBottom = navClearance;
  }

  const cardStyle: CSSProperties = {
    position: 'fixed',
    left: 12,
    right: 12,
    top: cardTop,
    bottom: cardBottom,
    zIndex: 80,
    maxWidth: 420,
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const isLast = stepIndex >= steps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <AnimatePresence>
      <motion.div
        className="tour-root fixed inset-0 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        {/* Single dim layer with real cut-out via box-shadow (no second full dim) */}
        {hole ? (
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
        ) : (
          <div className="tour-scrim absolute inset-0" aria-hidden />
        )}

        <motion.div
          ref={cardRef}
          key={step.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="tour-card glass-card p-4 rounded-2xl border border-amber-400/35 shadow-2xl"
          style={cardStyle}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-amber-300 shrink-0" aria-hidden />
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/85 font-semibold">
                  {t('tour.badge')} · {stepIndex + 1}/{steps.length}
                </p>
              </div>
              <h3 id={titleId} className="font-display text-[1.15rem] text-white leading-snug">
                {t(step.titleKey)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => finish('skip')}
              className="icon-btn !w-9 !h-9 shrink-0"
              aria-label={t('tour.skip')}
            >
              <X size={16} />
            </button>
          </div>

          <p
            id={bodyId}
            className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line"
          >
            {t(step.bodyKey)}
          </p>

          {step.tipKey && (
            <p className="tour-tip mt-2.5 text-[11px] leading-snug text-amber-100/90 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
              {t(step.tipKey)}
            </p>
          )}

          {targetMissing && step.target && (
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
              {t('tour.targetHidden')}
            </p>
          )}

          {/* Progress dots — tappable */}
          <div
            className="flex justify-center gap-1.5 mt-3.5 mb-3"
            role="tablist"
            aria-label={t('tour.badge')}
          >
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`${i + 1}/${steps.length}`}
                onClick={() => setStepIndex(i)}
                className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${
                  i === stepIndex
                    ? 'w-6 bg-amber-300'
                    : i < stepIndex
                      ? 'w-2 bg-amber-300/55'
                      : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {isFirst ? (
              <button
                type="button"
                onClick={() => finish('skip')}
                className="btn-secondary flex-1 !min-h-[48px] !text-sm"
              >
                {t('tour.skip')}
              </button>
            ) : (
              <button
                type="button"
                onClick={back}
                className="btn-secondary flex-1 !min-h-[48px] !text-sm inline-flex items-center justify-center gap-1"
              >
                <ChevronLeft size={16} aria-hidden />
                {t('tour.back')}
              </button>
            )}
            <button
              ref={nextBtnRef}
              type="button"
              onClick={next}
              className="gradient-button flex-1 !min-h-[48px] !text-sm !py-2 inline-flex items-center justify-center gap-1"
            >
              {isLast ? t('tour.done') : t('tour.next')}
              {!isLast && <ChevronRight size={16} aria-hidden />}
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]">
            {t('tour.swipeHint')}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Reset tour (e.g. from settings) and ask home to show it again */
export function resetHomeTour(): void {
  try {
    localStorage.removeItem(TOUR_DONE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event(TOUR_RESTART_EVENT));
  } catch {
    /* ignore */
  }
}
