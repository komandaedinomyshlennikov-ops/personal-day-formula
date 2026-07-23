import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Plus, Trash2, MessageSquare, Calendar } from 'lucide-react';

interface Note {
  id: string;
  date: string;
  text: string;
  aiRecommendation?: string;
}

interface AINotesProps {
  onBack: () => void;
}

// Генерация AI-рекомендации на основе заметки
function generateAIRecommendation(noteText: string): string {
  const lowerText = noteText.toLowerCase();
  
  if (lowerText.includes('устал') || lowerText.includes('устала') || lowerText.includes('усталость')) {
    return 'Вы упоминаете усталость. Рекомендую: 1) Выделить время для отдыха, 2) Сократить нагрузку на ближайшие дни, 3) Обратить внимание на качество сна. Энергия дня благоприятна для восстановления.';
  }
  
  if (lowerText.includes('встреч') || lowerText.includes('переговор') || lowerText.includes('знаком')) {
    return 'Вы упоминаете встречи. Сегодня благоприятный день для коммуникации. Рекомендую: 1) Будьте открыты к новым знакомствам, 2) Проявите дипломатичность, 3) Важные переговоры лучше провести до 15:00.';
  }
  
  if (lowerText.includes('деньг') || lowerText.includes('финанс') || lowerText.includes('покупк')) {
    return 'Вы упоминаете финансы. Сегодня хороший день для финансового планирования. Рекомендую: 1) Пересмотрите бюджет, 2) Отложите импульсивные покупки, 3) Рассмотрите варианты инвестиций.';
  }
  
  if (lowerText.includes('работ') || lowerText.includes('проект') || lowerText.includes('дел')) {
    return 'Вы упоминаете работу. Энергия дня поддерживает трудовую активность. Рекомендую: 1) Сфокусируйтесь на приоритетных задачах, 2) Завершите начатые дела, 3) Не берите на себя лишние обязательства.';
  }
  
  if (lowerText.includes('отношен') || lowerText.includes('семь') || lowerText.includes('любов')) {
    return 'Вы упоминаете отношения. Сегодня благоприятное время для укрепления связей. Рекомендую: 1) Уделите внимание близким, 2) Проявите заботу и понимание, 3) Обсудите важные темы в спокойной обстановке.';
  }
  
  if (lowerText.includes('здоров') || lowerText.includes('спорт') || lowerText.includes('тренировк')) {
    return 'Вы упоминаете здоровье. Отличное время для заботы о себе! Рекомендую: 1) Умеренная физическая активность, 2) Здоровое питание, 3) Внимание к сигналам организма.';
  }
  
  return 'Спасибо за вашу заметку! На основе анализа рекомендую: 1) Сохранять осознанность в течение дня, 2) Обращать внимание на знаки судьбы, 3) Планировать важные дела с учётом энергии дня. Удачи!';
}

export function AINotes({ onBack }: AINotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Загрузка заметок из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('astronavigator_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes:', e);
      }
    }
  }, []);

  // Сохранение заметок
  useEffect(() => {
    localStorage.setItem('astronavigator_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsGenerating(true);
    
    // Имитация генерации AI-рекомендации
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiRec = generateAIRecommendation(newNote);
    
    const note: Note = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: newNote.trim(),
      aiRecommendation: aiRec,
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
    setIsAdding(false);
    setIsGenerating(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">AI-заметки</h1>
            <p className="text-gray-400 text-sm">Ваш личный астрологический дневник</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 transition-colors"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Add Note Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4"
            >
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Опишите ваш день, события или ощущения..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isGenerating}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:from-amber-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                      />
                      Анализ...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Получить рекомендацию
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {notes.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-2">У вас пока нет заметок</p>
            <p className="text-gray-500 text-sm">
              Добавьте первую заметку и получите персональную AI-рекомендацию
            </p>
          </motion.div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4"
            >
              {/* Note Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={14} />
                  {formatDate(note.date)}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Note Text */}
              <p className="text-white text-sm mb-4 leading-relaxed">{note.text}</p>

              {/* AI Recommendation */}
              {note.aiRecommendation && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="text-purple-400 font-semibold text-sm">AI-рекомендация</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{note.aiRecommendation}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
