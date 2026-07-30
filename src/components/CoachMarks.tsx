import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { recordHomeMetric } from '@/lib/homeMetrics';

/** Separate from AI coach memory (`astronavigator_coach_v1`) */
export const TOUR_DONE_KEY = 'astronavigator_tour_done_v2';
const FIRST_HINT_KEY = 'astronavigator_home_first_hint_v1';

export const TOUR_STEP_EVENT = 'astronavigator:tour-step';
export const TOUR_ACTIVE_EVENT = 'astronavigator:tour-active';
export const TOUR_RESTART_EVENT = 'astronavigator:tour-restart';

export type TourHomeTab = 'week' | 'month';

export interface TourStep {
  id: string;
  /** CSS selector for spotlight; omit for centered intro */
  target?: string;
  /** Preferred home tab so the target is mounted */
  preferTab?: TourHomeTab;
  titleKey: string;
  bodyKey: string;
  tipKey?: string;
}

/**
 * Compact targets only — never spotlight the whole month grid
 * (that made the hole fill the screen and broke the card).
 */
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
    id: 'grid',
    target: '[data-coach="grid-head"]',
    preferTab: 'month',
    titleKey: 'tour.gridTitle',
    bodyKey: 'tour.gridBody',
  },
  {
    id: 'colors',
    target: '[data-coach="legend"]',
    preferTab: 'month',
    titleKey: 'tour.colorsTitle',
    bodyKey: 'tour.colorsBody',
    tipKey: 'tour.colorsTip',
  },
];

interface CoachMarksProps {
  enabled?: boolean;
  steps?: TourStep[];
  onPreferTab?: (tab: TourHomeTab) => void;
  restartToken?: number;
}

interface Hole {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 6;
/** Reserve for bottom sheet + nav so hole never sits under the card */
const SHEET_RESERVE = 220;
const NAV_SAFE = 8;

function isTourDone(): boolean {
  try {
    if (localStorage.getItem(TOUR_DONE_KEY) === '1') return true;
    const legacy = localStorage.getItem('astronavigator_coach_v1');
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

function lockScroll(lock: boolean): void {
  try {
    document.body.style.overflow = lock ? 'hidden' : '';
    const body = document.querySelector('.home-body') as HTMLElement | null;
    if (body) body.style.overflow = lock ? 'hidden' : '';
  } catch {
    /* ignore */
  }
}

/** Clamp a DOMRect into a reasonable spotlight that leaves room for the sheet */
function clampHole(r: DOMRect): Hole {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxBottom = vh - SHEET_RESERVE - NAV_SAFE;
  const maxH = Math.max(48, Math.min(r.height + PAD * 2, vh * 0.36, maxBottom - 12));
  const maxW = Math.min(r.width + PAD * 2, vw - 16);

  let top = Math.max(8, r.top - PAD);
  let left = Math.max(8, r.left - PAD);
  let width = maxW;
  let height = Math.min(r.height + PAD * 2, maxH);

  // If target is taller than max, show the top portion
  if (r.height + PAD * 2 > maxH) {
    height = maxH;
  }

  // Keep hole above the bottom sheet
  if (top + height > maxBottom) {
    top = Math.max(8, maxBottom - height);
  }
  if (left + width > vw - 8) {
    left = Math.max(8, vw - 8 - width);
  }

  return {
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function scrollTargetIntoView(el: HTMLElement): void {
  const scrollRoot =
    (document.querySelector('.home-body') as HTMLElement | null) || null;

  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // Keep target in the upper band so the bottom sheet never covers it
    const desiredTop = rootRect.top + Math.min(72, rootRect.height * 0.1);
    const delta = elRect.top - desiredTop;
    if (Math.abs(delta) > 6) {
      // scrollTop works even when overflow is locked for touch
      scrollRoot.scrollTop += delta;
    }
  } else {
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
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
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const measureGen = useRef(0);

  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [hole, setHole] = useState<Hole | null>(null);
  const [targetMissing, setTargetMissing] = useState(false);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setHole(null);
    setTargetMissing(false);
    setActive(true);
    dispatchTourActive(true);
    lockScroll(true);
  }, []);

  // Auto-start for first visit
  useEffect(() => {
    if (!enabled) return;
    if (restartToken === 0 && isTourDone()) return;
    const delay = restartToken > 0 ? 200 : 480;
    const tmr = window.setTimeout(startTour, delay);
    return () => window.clearTimeout(tmr);
  }, [enabled, restartToken, startTour]);

  // Settings → “Show tips again”
  useEffect(() => {
    const onRestart = () => {
      try {
        localStorage.removeItem(TOUR_DONE_KEY);
      } catch {
        /* ignore */
      }
      startTour();
    };
    window.addEventListener(TOUR_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(TOUR_RESTART_EVENT, onRestart);
  }, [startTour]);

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => lockScroll(false);
  }, []);

  // Prefer tab before measuring
  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) return;
    if (step.preferTab) onPreferTab?.(step.preferTab);
    try {
      window.dispatchEvent(
        new CustomEvent(TOUR_STEP_EVENT, {
          detail: {
            id: step.id,
            preferTab: step.preferTab,
            index: stepIndex,
            total: steps.length,
          },
        })
      );
    } catch {
      /* ignore */
    }
  }, [active, stepIndex, steps, onPreferTab]);

  const measure = useCallback(() => {
    const step = steps[stepIndex];
    const gen = ++measureGen.current;

    if (!step?.target) {
      setHole(null);
      setTargetMissing(false);
      return;
    }

    const run = () => {
      if (gen !== measureGen.current) return;
      const el = document.querySelector(step.target!) as HTMLElement | null;
      if (!el) {
        setHole(null);
        setTargetMissing(true);
        return;
      }
      setTargetMissing(false);
      scrollTargetIntoView(el);
      // After scroll settles
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (gen !== measureGen.current) return;
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) {
            setHole(null);
            setTargetMissing(true);
            return;
          }
          setHole(clampHole(r));
        });
      });
    };

    // Tab content may mount next frame
    run();
    window.setTimeout(run, 60);
    window.setTimeout(run, 180);
    window.setTimeout(run, 360);
  }, [stepIndex, steps]);

  useEffect(() => {
    if (!active) return;
    measure();
    const onWin = () => measure();
    window.addEventListener('resize', onWin);
    window.addEventListener('orientationchange', onWin);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('orientationchange', onWin);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => nextBtnRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [active, stepIndex]);

  const finish = useCallback((reason: 'done' | 'skip') => {
    markTourDone();
    setActive(false);
    setHole(null);
    dispatchTourActive(false);
    lockScroll(false);
    try {
      recordHomeMetric('home_first_hint_dismiss', {
        action: reason === 'skip' ? 'tour_skip' : 'tour_done',
      });
    } catch {
      /* ignore */
    }
  }, []);

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) finish('done');
    else {
      setHole(null);
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, steps.length, finish]);

  const back = useCallback(() => {
    if (stepIndex > 0) {
      setHole(null);
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish('skip');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, back, finish]);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (dx < -56) next();
    else if (dx > 56) back();
  };

  if (typeof document === 'undefined') return null;

  const step = steps[stepIndex];
  if (!active || !step) return null;

  const isLast = stepIndex >= steps.length - 1;
  const isFirst = stepIndex === 0;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const overlay = (
    <AnimatePresence>
      {active && (
        <motion.div
          key="tour-root"
          className="tour-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
        >
          {/* 4-panel dim — reliable on iOS/Safari (no 9999px box-shadow) */}
          {hole ? (
            <>
              <div
                className="tour-dim"
                style={{ top: 0, left: 0, width: vw, height: hole.top }}
              />
              <div
                className="tour-dim"
                style={{
                  top: hole.top,
                  left: 0,
                  width: hole.left,
                  height: hole.height,
                }}
              />
              <div
                className="tour-dim"
                style={{
                  top: hole.top,
                  left: hole.left + hole.width,
                  width: Math.max(0, vw - (hole.left + hole.width)),
                  height: hole.height,
                }}
              />
              <div
                className="tour-dim"
                style={{
                  top: hole.top + hole.height,
                  left: 0,
                  width: vw,
                  height: Math.max(0, vh - (hole.top + hole.height)),
                }}
              />
              <div
                className="tour-hole-ring"
                style={{
                  top: hole.top,
                  left: hole.left,
                  width: hole.width,
                  height: hole.height,
                }}
                aria-hidden
              />
            </>
          ) : (
            <div className="tour-dim tour-dim--full" aria-hidden />
          )}

          {/* Always bottom sheet — predictable, never covers the hole */}
          <motion.div
            key={step.id}
            className="tour-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="tour-sheet__handle" aria-hidden />

            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-amber-300 shrink-0" aria-hidden />
                  <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/85 font-semibold">
                    {t('tour.badge')} · {stepIndex + 1}/{steps.length}
                  </p>
                </div>
                <h3
                  id={titleId}
                  className="font-display text-[1.12rem] text-white leading-snug"
                >
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
              className="text-[var(--text-secondary)] text-[13px] leading-relaxed whitespace-pre-line"
            >
              {t(step.bodyKey)}
            </p>

            {step.tipKey && (
              <p className="tour-tip mt-2 text-[11px] leading-snug text-amber-100/90 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
                {t(step.tipKey)}
              </p>
            )}

            {targetMissing && step.target && (
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                {t('tour.targetHidden')}
              </p>
            )}

            <div
              className="flex justify-center gap-1.5 mt-3 mb-2.5"
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
                  onClick={() => {
                    setHole(null);
                    setStepIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all ${
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}

/** Reset tour (e.g. from settings) and show it again on home */
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
