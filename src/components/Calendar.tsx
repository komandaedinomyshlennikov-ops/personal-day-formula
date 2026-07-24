import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Crown,
  Sparkles,
  Share2,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  generateMonthData,
  getEnergyInfo,
  getDayColor,
  calculatePersonalYear,
  calculatePersonalMonth,
  isZeroDay,
} from '@/utils/numerology';
import { normalizeBirthDateString } from '@/utils/date';
import { getDayActionLine } from '@/utils/actionableDay';
import { getUpcomingDays } from '@/utils/upcomingDays';
import { CoachMarks } from '@/components/CoachMarks';
import { TrialBanner } from '@/components/TrialBanner';
import { UpcomingDays } from '@/components/UpcomingDays';
import type { DayInfo } from '@/types';

interface CalendarProps {
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
  /** Days remaining on trial/sub; 0 hides banner */
  daysLeft?: number;
  isTrialActive?: boolean;
}

const DayCell = ({
  day,
  isToday,
  onClick,
}: {
  day: DayInfo;
  isToday: boolean;
  onClick: () => void;
}) => {
  const dayColor = getDayColor(day.personalNumber);
  const isZero = isZeroDay(day.date);

  const tone = isZero
    ? 'day-cell--zero'
    : day.isFavorable
      ? 'day-cell--fav'
      : day.isUnfavorable
        ? 'day-cell--hard'
        : 'day-cell--neutral';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`day-cell ${tone} ${isToday ? 'day-cell--today' : ''}`}
      aria-label={`${day.date.getDate()}, energy ${day.personalNumber}`}
    >
      <span className="day-num text-[var(--text-primary)]">{day.date.getDate()}</span>
      {isZero && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-300" />
      )}
      <span
        className="day-energy"
        style={{
          backgroundColor: `${dayColor}28`,
          color: dayColor,
          boxShadow: `0 0 10px ${dayColor}22`,
        }}
      >
        {day.personalNumber}
      </span>
    </button>
  );
};

export function Calendar({
  birthDate,
  onDaySelect,
  onSettings,
  onSubscription,
  onShare,
  onNotes,
  onMonthClick,
  onYearClick,
  isSubscribed,
  daysLeft = 0,
  isTrialActive = false,
}: CalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const birthDateString = normalizeBirthDateString(birthDate) ?? birthDate;

  const monthData = generateMonthData(birthDateString, year, month);
  const personalYear = calculatePersonalYear(birthDateString, year);
  const personalMonth = calculatePersonalMonth(birthDateString, year, month);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekDays = [
    t('weekdays.monday'),
    t('weekdays.tuesday'),
    t('weekdays.wednesday'),
    t('weekdays.thursday'),
    t('weekdays.friday'),
    t('weekdays.saturday'),
    t('weekdays.sunday'),
  ];

  const getTranslatedMonthName = (monthNum: number) => {
    const monthKeys = [
      'months.january',
      'months.february',
      'months.march',
      'months.april',
      'months.may',
      'months.june',
      'months.july',
      'months.august',
      'months.september',
      'months.october',
      'months.november',
      'months.december',
    ];
    return t(monthKeys[monthNum - 1]);
  };

  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handlePanEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > 50) handlePrevMonth();
      else if (info.offset.x < -50) handleNextMonth();
    },
    [handlePrevMonth, handleNextMonth]
  );

  const today = new Date();
  const checkIsToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  // Today energy for hero strip
  const todayInfo = monthData.find((d) => checkIsToday(d.date.getDate()));
  const todayEnergy = todayInfo
    ? getEnergyInfo(todayInfo.personalNumber, t)
    : null;
  const todayAction = todayInfo
    ? getDayActionLine(todayInfo.personalNumber, t)
    : null;

  const upcoming = useMemo(
    () => getUpcomingDays(birthDateString, 3),
    [birthDateString]
  );

  return (
    <div className="app-shell page-pad flex flex-col min-h-screen">
      <CoachMarks enabled />
      {/* Header */}
      <header className="app-header justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-200/20 to-violet-400/20 border border-white/10">
            <Sparkles size={16} className="text-amber-200" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg leading-none text-white truncate">
              {t('landing.footer.title', { defaultValue: 'Астронавигатор' })}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] tracking-wide uppercase">
              {getTranslatedMonthName(month)} {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSubscription}
            className={`icon-btn !w-auto !px-2.5 gap-1.5 ${
              isSubscribed ? '!border-amber-400/40 !text-amber-200' : ''
            }`}
            title={t('nav.subscription')}
          >
            <Crown size={15} />
            {!isSubscribed && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            )}
          </button>
          <button type="button" onClick={onSettings} className="icon-btn" title={t('nav.settings')}>
            <Settings size={17} />
          </button>
        </div>
      </header>

      {/* Trial / sub time left */}
      {isSubscribed && daysLeft > 0 && daysLeft <= 14 && (
        <TrialBanner
          daysLeft={daysLeft}
          isTrial={isTrialActive}
          onOpenSubscription={onSubscription}
        />
      )}

      {/* Today strip — actionable */}
      {todayEnergy && todayInfo && todayAction && (
        <button
          type="button"
          data-coach="today"
          onClick={() => onDaySelect(todayInfo)}
          className={`mx-4 mt-3 glass-card p-3.5 rounded-2xl text-left flex items-center gap-3 ${
            todayAction.tone === 'favorable'
              ? 'border-emerald-400/30'
              : todayAction.tone === 'challenging'
                ? 'border-rose-400/30'
                : 'border-amber-400/25'
          }`}
          style={{
            background:
              todayAction.tone === 'favorable'
                ? 'linear-gradient(120deg, rgba(74,222,128,0.12), rgba(167,139,250,0.06))'
                : todayAction.tone === 'challenging'
                  ? 'linear-gradient(120deg, rgba(248,113,113,0.12), rgba(167,139,250,0.06))'
                  : 'linear-gradient(120deg, rgba(245,215,142,0.12), rgba(167,139,250,0.08))',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: `${todayEnergy.color}22`,
              boxShadow: `0 0 24px ${todayEnergy.color}33`,
            }}
          >
            {todayEnergy.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.14em] text-amber-200/80 mb-0.5">
              {t('calendar.today')} · {todayInfo.personalNumber} · {todayEnergy.planet}
            </p>
            <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
              {todayAction.action}
            </p>
            <p className="text-[var(--text-muted)] text-[11px] mt-1">
              {t('calendar.tapForDetails')}
            </p>
          </div>
          <ChevronRight size={18} className="text-[var(--text-muted)] shrink-0" />
        </button>
      )}

      {/* Next 3 days */}
      <UpcomingDays days={upcoming} onSelect={onDaySelect} />

      {/* Year / Month chips */}
      <div className="px-4 pt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onYearClick(personalYear)}
          className="stat-pill"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,215,142,0.12), rgba(245,158,11,0.04))',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={11} className="text-amber-300" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {t('calendar.personalYear')}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl text-white leading-none">{personalYear}</span>
            <span className="text-amber-200/90 text-xs">
              {getEnergyInfo(personalYear, t).planet}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onMonthClick(personalMonth)}
          className="stat-pill"
          style={{
            background:
              'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(244,114,182,0.05))',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={11} className="text-violet-300" />
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {t('calendar.personalMonth')}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl text-white leading-none">{personalMonth}</span>
            <span className="text-violet-200/90 text-xs">
              {getEnergyInfo(personalMonth, t).planet}
            </span>
          </div>
        </button>
      </div>

      {/* Month switcher */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <button type="button" onClick={handlePrevMonth} className="icon-btn" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: direction > 0 ? 8 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl text-white leading-none">
            {getTranslatedMonthName(month)}
          </h2>
          <p className="text-[var(--text-muted)] text-xs mt-1">{year}</p>
        </motion.div>
        <button type="button" onClick={handleNextMonth} className="icon-btn" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid */}
      <div ref={containerRef} className="flex-1 px-3 pt-3 pb-2">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={handlePanEnd}
          data-coach="grid"
          className="touch-pan-y glass-card p-2.5 rounded-3xl"
        >
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-medium py-1.5 text-[var(--text-muted)] uppercase tracking-wide"
              >
                {day.slice(0, 2)}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-7 gap-1"
            >
              {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                <div key={`e-${i}`} className="aspect-square" />
              ))}
              {monthData.map((day) => (
                <DayCell
                  key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                  day={day}
                  isToday={checkIsToday(day.date.getDate())}
                  onClick={() => onDaySelect(day)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Legend + expandable hints */}
        <div data-coach="legend" className="mt-4">
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-2 hover:text-[var(--text-secondary)] transition-colors"
            aria-expanded={legendOpen}
          >
            <Info size={12} />
            <span>{t('calendar.legendTitle')}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${legendOpen ? 'rotate-180' : ''}`}
            />
            <span className="text-amber-200/70">
              {legendOpen ? t('calendar.legendLess') : t('calendar.legendMore')}
            </span>
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="chip" title={t('calendar.legendFavorableHint')}>
              <span className="chip-dot bg-emerald-400" />
              {t('calendar.legend.favorable')}
            </span>
            <span className="chip" title={t('calendar.legendNeutralHint')}>
              <span className="chip-dot bg-yellow-400" />
              {t('calendar.legend.neutral')}
            </span>
            <span className="chip" title={t('calendar.legendCompletionHint')}>
              <span className="chip-dot bg-rose-400" />
              {t('calendar.legend.completion')}
            </span>
            <span className="chip" title={t('calendar.legendZeroHint')}>
              <span className="chip-dot bg-indigo-400" />
              {t('calendar.legend.zeroDay')}
            </span>
          </div>

          <AnimatePresence>
            {legendOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ul className="mt-3 mx-1 space-y-2 glass-card p-3 rounded-2xl text-left">
                  <li className="flex gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="chip-dot bg-emerald-400 mt-1 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">
                        {t('calendar.legend.favorable')}:
                      </strong>{' '}
                      {t('calendar.legendFavorableHint')}
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="chip-dot bg-yellow-400 mt-1 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">
                        {t('calendar.legend.neutral')}:
                      </strong>{' '}
                      {t('calendar.legendNeutralHint')}
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="chip-dot bg-rose-400 mt-1 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">
                        {t('calendar.legend.completion')}:
                      </strong>{' '}
                      {t('calendar.legendCompletionHint')}
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="chip-dot bg-indigo-400 mt-1 shrink-0" />
                    <span>
                      <strong className="text-white font-medium">
                        {t('calendar.legend.zeroDay')}:
                      </strong>{' '}
                      {t('calendar.legendZeroHint')}
                    </span>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[var(--text-muted)] text-[11px] text-center mt-3 opacity-80">
          {t('calendar.swipeHint')}
        </p>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav" aria-label="Main">
        <div className="bottom-nav-inner">
          <button type="button" className="nav-item nav-item--active" aria-current="page">
            <CalendarDays size={20} />
            <span>{t('nav.calendar', { defaultValue: 'Календарь' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onNotes}>
            <BookOpen size={20} />
            <span>{t('nav.notes', { defaultValue: 'Дневник' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onShare}>
            <Share2 size={20} />
            <span>{t('calendar.share', { defaultValue: 'Share' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onSubscription}>
            <Crown size={20} />
            <span>{t('nav.subscription', { defaultValue: 'Pro' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onSettings}>
            <Settings size={20} />
            <span>{t('nav.settings', { defaultValue: 'Ещё' })}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
