import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon } from 'lucide-react';
import {
  getLocalDateKey,
  loadCoachState,
  saveCoachState,
  upsertCheckIn,
} from '@/utils/coachMemory';
import { calculatePersonalDay } from '@/utils/numerology';

interface EveningCheckInProps {
  birthDate: string;
}

/** Builds “second memory”: did the day match reality? */
export function EveningCheckIn({ birthDate }: EveningCheckInProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [match, setMatch] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const dateKey = getLocalDateKey();

  useEffect(() => {
    const state = loadCoachState();
    const existing = state.checkIns.find((c) => c.dateKey === dateKey);
    if (existing) {
      setMatch(existing.match);
      setNote(existing.note || '');
      setSaved(true);
    }
  }, [dateKey]);

  const submit = () => {
    if (!match) return;
    let personalNumber = 1;
    try {
      personalNumber = calculatePersonalDay(birthDate, new Date());
    } catch {
      /* keep 1 */
    }
    const state = loadCoachState();
    const next = upsertCheckIn(state, {
      dateKey,
      personalNumber,
      match,
      note: note.trim().slice(0, 280) || undefined,
      mood: match,
    });
    saveCoachState(next);
    setSaved(true);
    setOpen(false);
  };

  if (saved && !open) {
    return (
      <button
        type="button"
        data-coach="checkin"
        onClick={() => setOpen(true)}
        className="w-full text-left glass-card p-3 rounded-2xl border border-white/10 text-xs text-[var(--text-muted)]"
      >
        {t('coach.checkInSaved')} · {t('coach.checkInEdit')}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        data-coach="checkin"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 glass-card p-3.5 rounded-2xl border border-violet-400/25 text-left"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(245,215,142,0.06))',
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Moon size={18} className="text-violet-200" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold">{t('coach.checkInTitle')}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {t('coach.checkInHint')}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      data-coach="checkin"
      className="glass-card p-4 rounded-2xl border border-violet-400/25 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Moon size={16} className="text-violet-200" />
        <p className="text-white text-sm font-semibold">{t('coach.checkInTitle')}</p>
      </div>
      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        {t('coach.checkInQuestion')}
      </p>
      <div className="flex gap-1.5">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setMatch(n)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              match === n
                ? 'bg-violet-400/25 border-violet-300/50 text-white'
                : 'bg-white/5 border-white/10 text-[var(--text-muted)]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 280))}
        rows={2}
        placeholder={t('coach.checkInNote')}
        className="w-full rounded-xl bg-black/30 border border-white/10 p-2.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-violet-400/40 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm text-[var(--text-secondary)]"
        >
          {t('actions.cancel')}
        </button>
        <button
          type="button"
          disabled={!match}
          onClick={submit}
          className="flex-1 py-2.5 rounded-xl bg-violet-400/25 border border-violet-300/40 text-sm text-white font-medium disabled:opacity-40"
        >
          {t('actions.save')}
        </button>
      </div>
    </div>
  );
}
