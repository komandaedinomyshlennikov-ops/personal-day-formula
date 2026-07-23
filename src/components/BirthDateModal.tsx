import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BirthDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
}

export function BirthDateModal({ isOpen, onClose, onSubmit }: BirthDateModalProps) {
  const { t } = useTranslation();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Фокус на первое поле при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => dayRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const validateDate = (d: string, m: string, y: string): boolean => {
    const dayNum = parseInt(d);
    const monthNum = parseInt(m);
    const yearNum = parseInt(y);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    
    // Проверка корректности даты
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getDate() === dayNum && 
           date.getMonth() === monthNum - 1 && 
           date.getFullYear() === yearNum;
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(value);
    setError('');
    
    if (value.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(value);
    setError('');
    
    if (value.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(value);
    setError('');
  };

  const handleSubmit = () => {
    if (!day || !month || !year) {
      setError(t('onboarding.fillAllFields'));
      return;
    }
    
    if (!validateDate(day, month, year)) {
      setError(t('onboarding.enterValidDate'));
      return;
    }
    
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    onSubmit(formattedDate);
    
    // Сброс полей
    setDay('');
    setMonth('');
    setYear('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'day' | 'month' | 'year') => {
    if (e.key === 'Backspace' && 
        ((field === 'month' && !month) || (field === 'year' && !year))) {
      if (field === 'month') dayRef.current?.focus();
      if (field === 'year') monthRef.current?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-sm bg-[#0f0f14] rounded-3xl p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
                }}
              >
                <Calendar size={36} className="text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {t('onboarding.birthDateTitle')}
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8">
              {t('onboarding.birthDateDescription')}
            </p>

            {/* Input fields */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Day */}
              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                  {t('onboarding.day')}
                </label>
                <input
                  ref={dayRef}
                  type="text"
                  inputMode="numeric"
                  value={day}
                  onChange={handleDayChange}
                  onKeyDown={(e) => handleKeyDown(e, 'day')}
                  placeholder={t('onboarding.dayPlaceholder')}
                  className="w-full px-4 py-4 text-center text-xl font-semibold bg-white/5 border border-white/10 text-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors placeholder:text-gray-600"
                />
              </div>

              {/* Month */}
              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                  {t('onboarding.month')}
                </label>
                <input
                  ref={monthRef}
                  type="text"
                  inputMode="numeric"
                  value={month}
                  onChange={handleMonthChange}
                  onKeyDown={(e) => handleKeyDown(e, 'month')}
                  placeholder={t('onboarding.monthPlaceholder')}
                  className="w-full px-4 py-4 text-center text-xl font-semibold bg-white/5 border border-white/10 text-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors placeholder:text-gray-600"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                  {t('onboarding.year')}
                </label>
                <input
                  ref={yearRef}
                  type="text"
                  inputMode="numeric"
                  value={year}
                  onChange={handleYearChange}
                  onKeyDown={(e) => handleKeyDown(e, 'year')}
                  placeholder={t('onboarding.yearPlaceholder')}
                  className="w-full px-4 py-4 text-center text-xl font-semibold bg-white/5 border border-white/10 text-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center mb-4"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!day || !month || !year}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              {t('onboarding.startTrial')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
