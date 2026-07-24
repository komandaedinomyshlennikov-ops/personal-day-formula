import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  appendMessage,
  canSendCoachMessage,
  getLocalDateKey,
  loadCoachState,
  recordUserMessage,
  saveCoachState,
  updateProfile,
  type CoachState,
  type FocusArea,
} from '@/utils/coachMemory';
import {
  buildCoachOpening,
  FOCUS_CHIPS,
  type CoachContext,
} from '@/utils/coachEngine';
import {
  generateCoachReplySmart,
  isCoachApiConfigured,
  type CoachSource,
} from '@/utils/coachApi';
import { calculatePersonalDay } from '@/utils/numerology';
import { PremiumTeaser } from '@/components/PremiumTeaser';

interface DayCoachProps {
  birthDate: string;
  displayName?: string;
  /** Optional personal number override (from day detail) */
  personalNumber?: number;
  dateKey?: string;
  unlimited: boolean;
  freeLimit?: number;
  onBack: () => void;
  onUpgrade: () => void;
}

export function DayCoach({
  birthDate,
  displayName,
  personalNumber: personalNumberProp,
  dateKey: dateKeyProp,
  unlimited,
  freeLimit = 5,
  onBack,
  onUpgrade,
}: DayCoachProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';
  const [state, setState] = useState<CoachState>(() => loadCoachState());
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastSource, setLastSource] = useState<CoachSource | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const apiOn = isCoachApiConfigured();

  const dateKey = dateKeyProp || getLocalDateKey();
  const personalNumber = useMemo(() => {
    if (personalNumberProp) return personalNumberProp;
    try {
      return calculatePersonalDay(birthDate, new Date());
    } catch {
      return 1;
    }
  }, [birthDate, personalNumberProp]);

  const ctx = useMemo((): CoachContext => {
    return {
      displayName,
      personalNumber,
      dateKey,
      profile: state.profile,
      checkIns: state.checkIns,
      recentMessages: state.messages.slice(-12),
      lang,
    };
  }, [displayName, personalNumber, dateKey, state.profile, state.checkIns, state.messages, lang]);

  // Seed opening once per calendar day
  useEffect(() => {
    setState((prev) => {
      const hasToday = prev.messages.some((m) => m.dateKey === dateKey);
      if (hasToday) return prev;
      const opening = buildCoachOpening(
        {
          displayName,
          personalNumber,
          dateKey,
          profile: prev.profile,
          checkIns: prev.checkIns,
          recentMessages: prev.messages.slice(-12),
          lang,
        },
        t
      );
      const next = appendMessage(prev, {
        role: 'assistant',
        text: opening,
        personalNumber,
        dateKey,
      });
      saveCoachState(next);
      return next;
    });
  }, [dateKey, personalNumber, displayName, lang, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, busy]);

  const remaining = unlimited
    ? null
    : Math.max(0, freeLimit - (state.usageByDay[getLocalDateKey()] || 0));
  const canSend = canSendCoachMessage(state, unlimited, freeLimit);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!canSend) {
      onUpgrade();
      return;
    }

    setBusy(true);
    setInput('');

    let next = appendMessage(state, {
      role: 'user',
      text: trimmed,
      personalNumber,
      dateKey,
    });
    next = recordUserMessage(next);

    // Detect goal save: "цель: ..." / "goal: ..."
    const goalMatch = trimmed.match(/(?:цель|goal)\s*[:—-]\s*(.+)/i);
    if (goalMatch?.[1]) {
      next = updateProfile(next, { goal: goalMatch[1].trim().slice(0, 120) });
    }

    setState(next);
    saveCoachState(next);

    const replyCtx: CoachContext = {
      ...ctx,
      profile: next.profile,
      checkIns: next.checkIns,
      recentMessages: next.messages.slice(-12),
    };

    void generateCoachReplySmart(trimmed, replyCtx, t)
      .then((result) => {
        setLastSource(result.source);
        setState((prev) => {
          const updated = appendMessage(prev, {
            role: 'assistant',
            text: result.text,
            personalNumber,
            dateKey,
          });
          saveCoachState(updated);
          return updated;
        });
      })
      .finally(() => setBusy(false));
  };

  const onChip = (focus: FocusArea) => {
    const label =
      FOCUS_CHIPS.find((c) => c.id === focus)?.[lang === 'ru' ? 'ru' : 'en'] || focus;
    const next = updateProfile(state, { primaryFocus: focus });
    setState(next);
    saveCoachState(next);
    send(
      lang === 'ru'
        ? `Сегодня для меня важнее всего: ${label}`
        : `What matters most today: ${label}`
    );
  };

  return (
    <div className="app-shell min-h-screen flex flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <header className="app-header justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-lg text-white leading-tight truncate">
              {t('coach.title')}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {t('coach.subtitle')}
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/25 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-violet-200" />
        </div>
      </header>

      <div className="px-4 pt-2">
        <p className="text-[10px] leading-relaxed text-[var(--text-muted)] glass-card p-2.5 rounded-xl border border-white/8">
          {t('coach.trustLine')}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 px-1">
          {remaining !== null && (
            <p className="text-[10px] text-amber-200/80">
              {t('coach.quotaLeft', { count: remaining })}
            </p>
          )}
          <p className="text-[10px] text-[var(--text-muted)]">
            {apiOn
              ? lastSource === 'llm'
                ? t('coach.sourceLive')
                : lastSource === 'error-local'
                  ? t('coach.sourceFallback')
                  : t('coach.sourceReady')
              : t('coach.sourceLocal')}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {state.messages
          .filter((m) => m.role !== 'system')
          .map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'ml-auto bg-amber-400/15 border border-amber-400/25 text-white'
                  : 'mr-auto glass-card border border-white/10 text-[var(--text-secondary)]'
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        {busy && (
          <div className="text-[11px] text-[var(--text-muted)] px-1">
            {t('coach.thinking')}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {!canSend && (
        <div className="px-4 pb-2">
          <PremiumTeaser
            variant="banner"
            title={t('coach.limitTitle')}
            body={t('coach.limitBody')}
            onUpgrade={onUpgrade}
          />
        </div>
      )}

      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {FOCUS_CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={!canSend || busy}
            onClick={() => onChip(c.id)}
            className="px-2.5 py-1.5 rounded-full text-[11px] font-medium border border-white/12 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 disabled:opacity-40"
          >
            {lang === 'ru' ? c.ru : c.en}
          </button>
        ))}
      </div>

      <form
        className="px-4 pb-3 flex gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder={t('coach.placeholder')}
          disabled={!canSend || busy}
          className="flex-1 min-h-[46px] max-h-28 resize-none rounded-2xl bg-white/5 border border-white/12 px-3.5 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-amber-400/40 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || !canSend || busy}
          className="icon-btn !w-12 !h-12 !rounded-2xl shrink-0 disabled:opacity-40 bg-amber-400/20 border-amber-400/30 text-amber-100"
          aria-label={t('coach.send')}
        >
          {canSend ? <Send size={18} /> : <Lock size={18} />}
        </button>
      </form>
    </div>
  );
}
