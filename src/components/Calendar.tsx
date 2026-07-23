import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Crown, 
  Sparkles, 
  Home, 
  Send, 
  Phone,
  Share2,
  BookOpen
} from 'lucide-react';
import { 
  generateMonthData, 
  getEnergyInfo,
  getDayColor,
  calculatePersonalYear,
  calculatePersonalMonth,
  isZeroDay
} from '@/utils/numerology';
import { normalizeBirthDateString } from '@/utils/date';
import type { DayInfo } from '@/types';

interface CalendarProps {
  /** YYYY-MM-DD only — never a Date (avoids timezone shift) */
  birthDate: string;
  onDaySelect: (day: DayInfo) => void;
  onSettings: () => void;
  onSubscription: () => void;
  onHome: () => void;
  onShare: () => void;
  onNotes: () => void;
  onMonthClick: (monthNumber: number) => void;
  onYearClick: (yearNumber: number) => void;
  isSubscribed: boolean;
}

// Week days will be translated via i18n

// Мемоизированная ячейка дня для оптимизации
const DayCell = ({ 
  day, 
  index, 
  isToday, 
  onClick 
}: { 
  day: DayInfo; 
  index: number; 
  isToday: boolean;
  onClick: () => void;
}) => {
  const dayColor = getDayColor(day.personalNumber);
  const isZero = isZeroDay(day.date);
  
  // Определяем цвет фона согласно цветовой навигации (фото 4)
  const getBackgroundColor = () => {
    if (isZero) return 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400/50';
    if (day.isFavorable) return 'bg-green-500/20 hover:bg-green-500/30 border-green-400/50';
    if (day.isUnfavorable) return 'bg-red-500/20 hover:bg-red-500/30 border-red-400/50';
    return 'bg-yellow-500/15 hover:bg-yellow-500/25 border-yellow-400/40';
  };
  
  // Определяем цвет текста даты
  const getDateTextColor = () => {
    if (isZero) return 'text-indigo-200';
    if (day.isFavorable) return 'text-green-200';
    if (day.isUnfavorable) return 'text-red-200';
    return 'text-yellow-100';
  };
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.005 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        aspect-square rounded-xl p-1 flex flex-col items-center justify-center
        transition-all border relative
        ${getBackgroundColor()}
        ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
      `}
    >
      <span className={`font-medium text-sm ${getDateTextColor()}`}>
        {day.date.getDate()}
      </span>
      {isZero && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
      )}
      <div 
        className="mt-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ 
          backgroundColor: `${dayColor}30`,
          color: dayColor
        }}
      >
        {day.personalNumber}
      </div>
    </motion.button>
  );
};

export function Calendar({ 
  birthDate, 
  onDaySelect, 
  onSettings, 
  onSubscription,
  onHome,
  onShare,
  onNotes,
  onMonthClick,
  onYearClick,
  isSubscribed 
}: CalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const birthDateString = normalizeBirthDateString(birthDate) ?? birthDate;

  const monthData = generateMonthData(birthDateString, year, month);
  const personalYear = calculatePersonalYear(birthDateString, year);
  const personalMonth = calculatePersonalMonth(birthDateString, year, month);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Get translated week days
  const weekDays = [
    t('weekdays.monday'),
    t('weekdays.tuesday'),
    t('weekdays.wednesday'),
    t('weekdays.thursday'),
    t('weekdays.friday'),
    t('weekdays.saturday'),
    t('weekdays.sunday'),
  ];

  // Get translated month name
  const getTranslatedMonthName = (monthNum: number) => {
    const monthKeys = [
      'months.january', 'months.february', 'months.march', 'months.april',
      'months.may', 'months.june', 'months.july', 'months.august',
      'months.september', 'months.october', 'months.november', 'months.december'
    ];
    return t(monthKeys[monthNum - 1]);
  };

  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handlePanEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevMonth();
    } else if (info.offset.x < -threshold) {
      handleNextMonth();
    }
  }, [handlePrevMonth, handleNextMonth]);

  const today = new Date();
  const checkIsToday = useCallback((day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() + 1 &&
      year === today.getFullYear()
    );
  }, [month, year, today]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-2 sm:px-4 py-3 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onHome}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
            title={t('nav.home')}
          >
            <Home size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
            title={t('nav.settings')}
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </motion.button>

          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: direction > 0 ? -20 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center min-w-[100px] sm:min-w-[140px]"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {getTranslatedMonthName(month)}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">{year}</p>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </motion.button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNotes}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-colors bg-white/5 border border-white/10"
            title={t('nav.notes')}
          >
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSubscription}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl transition-all relative
              ${isSubscribed 
                ? "bg-gradient-to-r from-amber-400/30 to-yellow-500/20 text-amber-400 shadow-lg shadow-amber-400/30 border border-amber-400/50" 
                : "bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30"
              }
            `}
            title={isSubscribed ? t('subscription.trialActive') : t('subscription.choosePlan')}
          >
            <Crown size={14} className={`sm:w-4 sm:h-4 ${isSubscribed ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : ""}`} />
            <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap">{t('nav.subscription')}</span>
            {!isSubscribed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0a0a0f]"></span>
            )}
          </motion.button>
        </div>
      </header>

      {/* Personal Info Cards - Clickable */}
      <div className="px-4 py-2 grid grid-cols-2 gap-2">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onYearClick(personalYear)}
          className="glass-card p-3 border-amber-400/20 text-left rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('calendar.personalYear')}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{personalYear}</span>
            <span className="text-amber-400 text-xs">{getEnergyInfo(personalYear, t).planet}</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onMonthClick(personalMonth)}
          className="glass-card p-3 text-left rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={12} className="text-purple-400" />
            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('calendar.personalMonth')}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{personalMonth}</span>
            <span className="text-purple-400 text-xs">{getEnergyInfo(personalMonth, t).planet}</span>
          </div>
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div 
        ref={containerRef}
        className="flex-1 px-4 py-4"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handlePanEnd}
          className="touch-pan-y"
        >
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div 
                key={day} 
                className="text-center text-gray-500 text-xs font-medium py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-1"
            >
              {/* Empty cells for start of month */}
              {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {monthData.map((day, index) => (
                <DayCell
                  key={day.date.toISOString()}
                  day={day}
                  index={index}
                  isToday={checkIsToday(day.date.getDate())}
                  onClick={() => onDaySelect(day)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">{t('calendar.legend.favorable')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">{t('calendar.legend.neutral')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">{t('calendar.legend.completion')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-500 border border-indigo-400" />
            <span className="text-gray-400">{t('calendar.legend.zeroDay')}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t border-white/5">
        {/* Social Links & Contacts */}
        <div className="glass-card p-4 mb-4 rounded-2xl">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            {t('calendar.consultation')}
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="https://t.me/tatianageniush"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 transition-colors"
            >
              <Send size={16} className="text-[#0088cc]" />
              <span className="text-white text-sm">Telegram</span>
            </motion.a>
            
            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="https://www.instagram.com/geniush.tatiana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/20 transition-colors"
            >
              <span className="text-pink-400 text-lg">📷</span>
              <span className="text-white text-sm">Instagram</span>
            </motion.a>
            
            <motion.a 
              whileTap={{ scale: 0.98 }}
              href="tel:+375297801742"
              className="flex items-center gap-2 p-3 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-400/20 transition-colors"
            >
              <Phone size={16} className="text-green-400" />
              <span className="text-white text-sm">+375 29 780 1742</span>
            </motion.a>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onShare}
              className="flex items-center gap-2 p-3 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition-colors"
            >
              <Share2 size={16} className="text-amber-400" />
              <span className="text-white text-sm">{t('calendar.share')}</span>
            </motion.button>
          </div>
        </div>

        {/* Swipe hint */}
        <p className="text-gray-500 text-xs text-center">
          {t('calendar.swipeHint')}
        </p>
      </div>
    </div>
  );
}
