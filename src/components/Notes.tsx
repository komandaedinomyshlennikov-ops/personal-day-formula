import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Plus, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Note {
  id: string;
  date: string;
  text: string;
  tip?: string;
}

interface NotesProps {
  onBack: () => void;
}

/** Rule-based tips (not an LLM). Honest labeling for users. */
function generateTip(noteText: string, lang: string): string {
  const lower = noteText.toLowerCase();
  const isRu = lang.startsWith('ru');

  const rules: { keys: string[]; ru: string; en: string }[] = [
    {
      keys: ['устал', 'устала', 'усталость', 'tired', 'fatigue', 'exhausted'],
      ru: 'Вы упоминаете усталость. Подсказки: 1) запланируйте отдых, 2) снизьте нагрузку, 3) проверьте сон. Энергия дня может быть хороша для восстановления.',
      en: 'You mention fatigue. Tips: 1) schedule rest, 2) reduce load, 3) check sleep quality. The day may suit recovery.',
    },
    {
      keys: ['встреч', 'переговор', 'знаком', 'meet', 'negotiat', 'network'],
      ru: 'Вы упоминаете встречи. Подсказки: 1) будьте открыты к контактам, 2) дипломатия, 3) важные переговоры — в первой половине дня.',
      en: 'You mention meetings. Tips: 1) stay open to contacts, 2) use diplomacy, 3) schedule key talks earlier in the day.',
    },
    {
      keys: ['деньг', 'финанс', 'покупк', 'money', 'financ', 'buy', 'purchase'],
      ru: 'Вы упоминаете финансы. Подсказки: 1) пересмотрите бюджет, 2) отложите импульсивные покупки, 3) планируйте крупные траты осознанно.',
      en: 'You mention finances. Tips: 1) review the budget, 2) delay impulse buys, 3) plan larger expenses consciously.',
    },
    {
      keys: ['работ', 'проект', 'дел', 'work', 'project', 'task'],
      ru: 'Вы упоминаете работу. Подсказки: 1) фокус на приоритетах, 2) завершите начатое, 3) не берите лишнее.',
      en: 'You mention work. Tips: 1) focus on priorities, 2) finish open loops, 3) avoid overcommitment.',
    },
    {
      keys: ['отношен', 'семь', 'любов', 'love', 'family', 'relation'],
      ru: 'Вы упоминаете отношения. Подсказки: 1) время для близких, 2) забота и понимание, 3) важные разговоры — в спокойной обстановке.',
      en: 'You mention relationships. Tips: 1) prioritize close ones, 2) show care, 3) hold important talks in a calm setting.',
    },
    {
      keys: ['здоров', 'спорт', 'трениров', 'health', 'sport', 'train', 'gym'],
      ru: 'Вы упоминаете здоровье. Подсказки: 1) умеренная активность, 2) питание, 3) слушайте сигналы тела.',
      en: 'You mention health. Tips: 1) moderate activity, 2) mindful nutrition, 3) listen to your body.',
    },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => lower.includes(k))) {
      return isRu ? rule.ru : rule.en;
    }
  }

  return isRu
    ? 'Спасибо за заметку. Подсказки: 1) сохраняйте осознанность, 2) сверяйте планы с энергией дня в календаре, 3) фиксируйте итоги вечером.'
    : 'Thanks for the note. Tips: 1) stay mindful, 2) align plans with the day energy in the calendar, 3) capture outcomes in the evening.';
}

export function Notes({ onBack }: NotesProps) {
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
    // Small delay so UI feedback feels intentional (not "fake AI thinking")
    await new Promise((r) => setTimeout(r, 350));

    const tip = generateTip(newNote, i18n.language || 'en');
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
        <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100/90">
          {t('notes.disclaimer', {
            defaultValue:
              'Tips are rule-based keyword suggestions stored only on this device — not a neural network.',
          })}
        </div>

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
                  {note.tip && (
                    <div className="rounded-xl bg-violet-500/10 border border-violet-400/20 p-3">
                      <div className="flex items-center gap-2 text-violet-300 text-xs font-medium mb-1">
                        <Lightbulb size={14} />
                        {t('notes.tipLabel', { defaultValue: 'Tip' })}
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{note.tip}</p>
                    </div>
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
