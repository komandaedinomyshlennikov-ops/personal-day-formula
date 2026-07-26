import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Plus, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PremiumTeaser } from '@/components/PremiumTeaser';

interface Note {
  id: string;
  date: string;
  text: string;
  tip?: string;
}

interface NotesProps {
  onBack: () => void;
  /** Paid Pro unlocks keyword tips */
  tipsUnlocked?: boolean;
  onUpgrade?: () => void;
}

/** Rule-based tips (not an LLM). Honest labeling for users. */
function generateTip(
  noteText: string,
  lang: string,
  dayHint?: { number: number; tone: string; action: string }
): string {
  const lower = noteText.toLowerCase();
  const isRu = lang.startsWith('ru');

  const rules: { keys: string[]; ru: string; en: string }[] = [
    {
      keys: ['устал', 'устала', 'усталость', 'tired', 'fatigue', 'exhausted', 'выгор', 'burnout'],
      ru: 'Усталость: 1) закройте 1–2 дела, а не весь список, 2) сон и вода важнее «ещё часа», 3) сложные переговоры — на более мягкий день.',
      en: 'Fatigue: 1) finish 1–2 tasks, not the whole list, 2) sleep/water beat another hour of grind, 3) hard talks wait for a softer day.',
    },
    {
      keys: ['встреч', 'переговор', 'знаком', 'meet', 'negotiat', 'network', 'собесед', 'интервью'],
      ru: 'Встречи: 1) одна ясная цель на разговор, 2) слушайте больше, чем продаёте, 3) важное — раньше, пока ресурс выше.',
      en: 'Meetings: 1) one clear goal per talk, 2) listen more than pitch, 3) key talks earlier while energy is higher.',
    },
    {
      keys: ['деньг', 'финанс', 'покупк', 'money', 'financ', 'buy', 'purchase', 'бюджет', 'оплат'],
      ru: 'Финансы: 1) крупные траты — после паузы 24ч, 2) сверьте цифры дважды, 3) не смешивайте эмоцию и перевод.',
      en: 'Money: 1) big spends after a 24h pause, 2) double-check numbers, 3) don’t mix emotion with transfers.',
    },
    {
      keys: ['работ', 'проект', 'дел', 'work', 'project', 'task', 'дедлайн', 'deadline'],
      ru: 'Работа: 1) топ-3 на сегодня, 2) закрывайте начатое, 3) новое — только если день «зелёный» в календаре.',
      en: 'Work: 1) top-3 for today, 2) close open loops, 3) start new only if the calendar day is green.',
    },
    {
      keys: ['отношен', 'семь', 'любов', 'love', 'family', 'relation', 'ссор', 'конфликт'],
      ru: 'Отношения: 1) тон важнее «правоты», 2) сложный разговор — после еды/прогулки, 3) фиксируйте договорённость одной фразой.',
      en: 'Relations: 1) tone beats being right, 2) hard talks after food/walk, 3) end with one clear agreement.',
    },
    {
      keys: ['здоров', 'спорт', 'трениров', 'health', 'sport', 'train', 'gym', 'сон', 'sleep'],
      ru: 'Здоровье: 1) движение без героизма, 2) сон как приоритет, 3) тело — главный KPI дня.',
      en: 'Health: 1) gentle movement, 2) sleep first, 3) body is today’s main KPI.',
    },
    {
      keys: ['страх', 'тревог', 'worry', 'anxious', 'panic', 'паник', 'стресс', 'stress'],
      ru: 'Тревога: 1) запишите факт vs домысел, 2) один маленький шаг, 3) не принимайте крупных решений в пике.',
      en: 'Anxiety: 1) fact vs story on paper, 2) one tiny next step, 3) no big decisions at the peak.',
    },
    {
      keys: ['цель', 'goal', 'план', 'plan', 'хочу', 'решил', 'решила'],
      ru: 'План: 1) сформулируйте критерий «готово», 2) привяжите к дате в календаре, 3) выберите «зелёный» день для старта.',
      en: 'Plan: 1) define “done”, 2) put a date on it, 3) pick a green calendar day to start.',
    },
  ];

  let base: string | null = null;
  for (const rule of rules) {
    if (rule.keys.some((k) => lower.includes(k))) {
      base = isRu ? rule.ru : rule.en;
      break;
    }
  }
  if (!base) {
    base = isRu
      ? 'Заметка сохранена. 1) Сверьте с карточкой «сегодня», 2) один конкретный шаг, 3) вечером отметьте, что сработало.'
      : 'Note saved. 1) Cross-check today’s card, 2) one concrete step, 3) evening: what worked.';
  }

  if (dayHint) {
    const dayLine = isRu
      ? ` Сегодня личный день №${dayHint.number} (${dayHint.tone}): ${dayHint.action}`
      : ` Today personal day #${dayHint.number} (${dayHint.tone}): ${dayHint.action}`;
    return base + dayLine;
  }
  return base;
}

export function Notes({ onBack, tipsUnlocked = false, onUpgrade }: NotesProps) {
  const { t, i18n } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('astronavigator_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<Note & { aiRecommendation?: string }>;
        setNotes(
          parsed.map((n) => ({
            id: n.id,
            date: n.date,
            text: n.text,
            tip: n.tip ?? n.aiRecommendation,
          }))
        );
      } catch (e) {
        console.error('Failed to parse notes:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('astronavigator_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 350));

    // Tips are a Pro value layer; trial keeps free journaling
    let dayHint: { number: number; tone: string; action: string } | undefined;
    if (tipsUnlocked) {
      try {
        const raw = localStorage.getItem('astronavigator_user');
        if (raw) {
          const user = JSON.parse(raw) as { birthDate?: string };
          if (user.birthDate) {
            const { calculatePersonalDay } = await import('@/utils/numerology');
            const { getDayActionLine } = await import('@/utils/actionableDay');
            const n = calculatePersonalDay(user.birthDate, new Date());
            const { action, tone } = getDayActionLine(n, t);
            dayHint = { number: n, tone, action };
          }
        }
      } catch {
        /* ignore */
      }
    }
    const tip = tipsUnlocked
      ? generateTip(newNote, i18n.language || 'en', dayHint)
      : undefined;
    const note: Note = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: newNote.trim(),
      tip,
    };
    setNotes([note, ...notes]);
    setNewNote('');
    setIsAdding(false);
    setIsGenerating(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-shell min-h-screen pb-10">
      <header className="app-header">
        <button type="button" onClick={onBack} className="icon-btn" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-xl text-white leading-tight">
            {t('notes.title', { defaultValue: 'Journal' })}
          </h1>
          <p className="text-[var(--text-muted)] text-xs truncate">
            {t('notes.subtitle', {
              defaultValue: 'Personal notes with keyword tips (not AI)',
            })}
          </p>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="mb-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100/90">
          {t('notes.disclaimer', {
            defaultValue:
              'Tips are rule-based keyword suggestions stored only on this device — not a neural network.',
          })}
        </div>

        {!tipsUnlocked && onUpgrade && (
          <div className="mb-4">
            <PremiumTeaser
              variant="banner"
              title={t('premium.lockedNotes')}
              body={t('premium.perk3')}
              onUpgrade={onUpgrade}
            />
          </div>
        )}

        {!isAdding ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 py-4 rounded-2xl border border-dashed border-white/20 hover:border-amber-400/50 hover:bg-white/5 flex items-center justify-center gap-2 text-gray-300 transition-colors"
          >
            <Plus size={20} />
            {t('notes.add', { defaultValue: 'Add note' })}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
          >
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder={t('notes.placeholder', {
                defaultValue: 'How was your day? Plans, feelings, meetings…',
              })}
              className="w-full bg-black/30 rounded-xl p-3 text-white placeholder:text-gray-500 border border-white/10 focus:border-amber-400/50 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-sm"
              >
                {t('actions.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                type="button"
                onClick={() => void handleAddNote()}
                disabled={isGenerating || !newNote.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-sm disabled:opacity-50"
              >
                {isGenerating
                  ? t('notes.saving', { defaultValue: 'Saving…' })
                  : t('actions.save', { defaultValue: 'Save' })}
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {notes.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageSquare className="mx-auto mb-3 opacity-40" size={40} />
              <p>{t('notes.empty', { defaultValue: 'No notes yet' })}</p>
              <p className="mt-2 text-xs text-gray-500/80 max-w-[16rem] mx-auto leading-relaxed">
                {t('notes.emptyHint')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Calendar size={14} />
                      {formatDate(note.date)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                      aria-label={t('actions.delete', { defaultValue: 'Delete' })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-white text-sm whitespace-pre-wrap mb-3">{note.text}</p>
                  {note.tip ? (
                    <div className="rounded-xl bg-violet-500/10 border border-violet-400/20 p-3">
                      <div className="flex items-center gap-2 text-violet-300 text-xs font-medium mb-1">
                        <Lightbulb size={14} />
                        {t('notes.tipLabel', { defaultValue: 'Tip' })}
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{note.tip}</p>
                    </div>
                  ) : (
                    !tipsUnlocked &&
                    onUpgrade && (
                      <button
                        type="button"
                        onClick={onUpgrade}
                        className="w-full rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-left"
                      >
                        <div className="flex items-center gap-2 text-amber-200 text-xs font-medium mb-1">
                          <Lightbulb size={14} />
                          {t('premium.lockedNotes')}
                        </div>
                        <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                          {t('premium.perk3')} · {t('premium.cta')}
                        </p>
                      </button>
                    )
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** @deprecated use Notes — kept for import compatibility */
export const AINotes = Notes;
