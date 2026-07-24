import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Crown,
  Sparkles,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Info,
  MessageCircle,
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
import { getDayActionLine, getPersonalDayStory } from '@/utils/actionableDay';
import { getUpcomingDays } from '@/utils/upcomingDays';
import { recordAppOpen, type StreakState } from '@/utils/streak';
import { CoachMarks } from '@/components/CoachMarks';
import { TrialBanner } from '@/components/TrialBanner';
import { UpcomingDays } from '@/components/UpcomingDays';
import { StreakChip } from '@/components/StreakChip';
import { PremiumTeaser } from '@/components/PremiumTeaser';
import { YearPerksPanel } from '@/components/YearPerksPanel';
import { MorningNotifyBanner } from '@/components/MorningNotifyBanner';
import { EveningCheckIn } from '@/components/EveningCheckIn';
import type { AccessTier } from '@/utils/access';
import { canUseFeature, hasYearPerks, isPaidTier, isTrialTier } from '@/utils/access';
import type { DayInfo } from '@/types';

interface CalendarProps {
  birthDate: string;
  displayName?: string;
  onDaySelect: (day: DayInfo) => void;
  onSettings: () => void;
  onSubscription: () => void;
  onHome: () => void;
  onShare?: () => void;
  onNotes: () => void;
  onCoach?: () => void;
  onMonthClick: (monthNumber: number) => void;
  onYearClick: (yearNumber: number) => void;
  isSubscribed: boolean;
  daysLeft?: number;
  isTrialActive?: boolean;
  accessTier?: AccessTier;
  notificationsEnabled?: boolean;
  onEnableNotifications?: () => void;
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
        <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-indigo-300" />
      )}
      <span
        className="day-energy"
        style={{
          backgroundColor: `${dayColor}2e`,
          color: dayColor,
        }}
      >
        {day.personalNumber}
      </span>
    </button>
  );
};

export function Calendar({
  birthDate,
  displayName,
  onDaySelect,
  onSettings,
  onSubscription,
  onShare: _onShare,
  onNotes,
  onCoach,
  onMonthClick,
  onYearClick,
  isSubscribed,
  daysLeft = 0,
  isTrialActive = false,
  accessTier = 'none',
  notificationsEnabled = false,
  onEnableNotifications,
}: CalendarProps) {
  void _onShare;
  const paid = isPaidTier(accessTier);
  const yearPerks = hasYearPerks(accessTier);
  const trial = isTrialTier(accessTier);
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const [streak, setStreak] = useState<StreakState>({
    streak: 0,
    lastDate: '',
    totalDays: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStreak(recordAppOpen());
  }, []);

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

  const todayInfo = monthData.find((d) => checkIsToday(d.date.getDate()));
  const todayEnergy = todayInfo
    ? getEnergyInfo(todayInfo.personalNumber, t)
    : null;
  const todayAction = todayInfo
    ? getDayActionLine(todayInfo.personalNumber, t)
    : null;
  const todayStory = todayInfo
    ? getPersonalDayStory(todayInfo.personalNumber, t)
    : null;

  const upcoming = useMemo(
    () => getUpcomingDays(birthDateString, 3),
    [birthDateString]
  );

  const yearEnergy = getEnergyInfo(personalYear, t);
  const monthEnergy = getEnergyInfo(personalMonth, t);

  const todayToneBorder =
    todayAction?.tone === 'favorable'
      ? 'border-emerald-400/45'
      : todayAction?.tone === 'challenging'
        ? 'border-rose-400/45'
        : 'border-amber-400/40';

  const todayToneBg =
    todayAction?.tone === 'favorable'
      ? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(167,139,250,0.08))'
      : todayAction?.tone === 'challenging'
        ? 'linear-gradient(135deg, rgba(248,113,113,0.18), rgba(167,139,250,0.08))'
        : 'linear-gradient(135deg, rgba(250,204,21,0.16), rgba(167,139,250,0.08))';

  const toneDotClass =
    todayAction?.tone === 'favorable'
      ? 'tone-dot tone-dot--fav'
      : todayAction?.tone === 'challenging'
        ? 'tone-dot tone-dot--hard'
        : 'tone-dot tone-dot--neu';

  return (
    <div className="app-shell page-pad flex flex-col min-h-screen">
      <CoachMarks enabled />

      {/* Compact sticky header */}
      <header className="app-header justify-between !min-h-[52px] !py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-[13px] flex items-center justify-center bg-gradient-to-br from-amber-200/20 to-violet-400/25 border border-white/10 shrink-0">
            <Sparkles size={15} className="text-amber-200" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[1.05rem] leading-none text-white truncate">
              {displayName
                ? t('calendar.helloName', {
                    name: displayName,
                    defaultValue: `Hello, ${displayName}`,
                  })
                : t('landing.footer.title', { defaultValue: 'AstroNavigator' })}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <StreakChip streak={streak.streak} totalDays={streak.totalDays} />
              {!streak.streak && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {getTranslatedMonthName(month)} {year}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Only Pro in header — Settings lives in bottom nav (avoid duplicate targets) */}
        <button
          type="button"
          onClick={onSubscription}
          className={`icon-btn !w-11 !h-11 shrink-0 ${
            isSubscribed ? '!border-amber-400/40 !text-amber-200' : ''
          }`}
          title={t('nav.subscription')}
          aria-label={t('nav.subscription')}
        >
          <Crown size={17} />
          {!isSubscribed && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          )}
        </button>
      </header>

      {/* Scrollable main stack */}
      <div className="home-body">
        {isSubscribed && daysLeft > 0 && daysLeft <= 14 && (
          <TrialBanner
            daysLeft={daysLeft}
            isTrial={isTrialActive}
            onOpenSubscription={onSubscription}
          />
        )}

        {/* Today hero — personal story of the day */}
        {todayEnergy && todayInfo && todayAction && todayStory && (
          <button
            type="button"
            data-coach="today"
            onClick={() => onDaySelect(todayInfo)}
            className={`today-hero today-hero--story ${todayToneBorder}`}
            style={{ background: todayToneBg }}
          >
            <div className="today-hero__top">
              <div
                className="today-hero__icon"
                style={{
                  background: `${todayEnergy.color}2e`,
                  boxShadow: `0 0 26px ${todayEnergy.color}38`,
                }}
              >
                {todayEnergy.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={toneDotClass} />
                  <span className="today-hero__badge">{todayStory.toneLabel}</span>
                  <span className="today-hero__meta">
                    {t('calendar.today')} · {todayInfo.personalNumber} · {todayEnergy.planet}
                  </span>
                </div>
                {displayName && (
                  <p className="today-hero__for-you">
                    {t('calendar.forYou', {
                      name: displayName,
                      defaultValue: `For you, ${displayName}`,
                    })}
                  </p>
                )}
                <p className="today-hero__story-title">{todayStory.storyTitle}</p>
                <p className="today-hero__action">{todayAction.action}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] shrink-0 opacity-70 self-center" />
            </div>
            {todayStory.doList.length > 0 && (
              <ul className="today-hero__do-list">
                {todayStory.doList.map((item) => (
                  <li key={item}>
                    <span className="text-emerald-300">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <p className="today-hero__hint">{t('calendar.tapForDetails')}</p>
          </button>
        )}

        {onEnableNotifications && (
          <MorningNotifyBanner
            enabled={notificationsEnabled}
            onEnable={onEnableNotifications}
          />
        )}

        {onCoach && (
          <button
            type="button"
            onClick={onCoach}
            className="w-full flex items-center gap-3 glass-card p-3.5 rounded-2xl border border-violet-400/30 text-left"
            style={{
              background:
                'linear-gradient(120deg, rgba(167,139,250,0.14), rgba(245,215,142,0.08))',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-violet-200" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold">{t('coach.ctaHome')}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                {t('coach.ctaHomeHint')}
              </p>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
          </button>
        )}

        {/* Next 3 days — habit loop */}
        <UpcomingDays days={upcoming} onSelect={onDaySelect} />

        {streak.streak > 0 && (
          <p className="habit-nudge">
            {t('calendar.habitNudge', {
              count: streak.streak,
              defaultValue: 'Day {{count}} in a row — come back tomorrow for a new energy',
            })}
          </p>
        )}

        <EveningCheckIn birthDate={birthDateString} />

        {/* Year tools for annual plan OR teaser for others */}
        {yearPerks ? (
          <YearPerksPanel
            birthDate={birthDateString}
            onSelectDay={onDaySelect}
            onOpenYear={onYearClick}
          />
        ) : trial ? (
          <PremiumTeaser
            variant="banner"
            yearOnly
            title={t('premium.yearTitle')}
            body={t('premium.lockedYear')}
            onUpgrade={onSubscription}
          />
        ) : paid ? (
          <PremiumTeaser
            variant="inline"
            yearOnly
            title={t('premium.lockedYear')}
            onUpgrade={onSubscription}
          />
        ) : null}

        {/* Year / Month — compact dual stats */}
        <div className="stats-row">
          <button
            type="button"
            onClick={() => onYearClick(personalYear)}
            className="stat-mini relative"
            style={{
              background:
                'linear-gradient(145deg, rgba(245,215,142,0.12), rgba(245,158,11,0.04))',
            }}
          >
            {!canUseFeature('monthYearDeep', accessTier) && (
              <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Pro
              </span>
            )}
            <span className="stat-mini__label">
              <Sparkles size={10} className="text-amber-300" />
              {t('calendar.personalYear')}
            </span>
            <span>
              <span className="stat-mini__value">{personalYear}</span>
              <span className="stat-mini__planet text-amber-200/85">
                {yearEnergy.planet}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onMonthClick(personalMonth)}
            className="stat-mini relative"
            style={{
              background:
                'linear-gradient(145deg, rgba(167,139,250,0.14), rgba(244,114,182,0.05))',
            }}
          >
            {!canUseFeature('monthYearDeep', accessTier) && (
              <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Pro
              </span>
            )}
            <span className="stat-mini__label">
              <Sparkles size={10} className="text-violet-300" />
              {t('calendar.personalMonth')}
            </span>
            <span>
              <span className="stat-mini__value">{personalMonth}</span>
              <span className="stat-mini__planet text-violet-200/85">
                {monthEnergy.planet}
              </span>
            </span>
          </button>
        </div>

        {/* Soft upgrade nudge during trial after core value */}
        {trial && (
          <PremiumTeaser variant="card" onUpgrade={onSubscription} />
        )}

        {/* Calendar panel — month nav + grid as one unit */}
        <div ref={containerRef} className="cal-panel" data-coach="grid">
          <div className="cal-panel__toolbar">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="icon-btn !w-11 !h-11"
              aria-label={t('calendar.prevMonth', { defaultValue: 'Previous month' })}
            >
              <ChevronLeft size={20} />
            </button>
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: direction > 0 ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="cal-panel__title"
            >
              <h2>{getTranslatedMonthName(month)}</h2>
              <p>{year}</p>
            </motion.div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="icon-btn !w-11 !h-11"
              aria-label={t('calendar.nextMonth', { defaultValue: 'Next month' })}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={handlePanEnd}
            className="cal-panel__body touch-pan-y"
          >
            <div className="cal-weekdays">
              {weekDays.map((day) => (
                <div key={day} className="cal-weekday">
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${year}-${month}`}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.16 }}
                className="cal-grid"
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
        </div>

        {/* Legend — compact */}
        <div data-coach="legend" className="pb-1">
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="w-full min-h-11 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-1 hover:text-[var(--text-secondary)] transition-colors rounded-xl"
            aria-expanded={legendOpen}
          >
            <Info size={13} />
            <span>{t('calendar.legendTitle')}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${legendOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="legend-bar">
            <span className="legend-chip" title={t('calendar.legendFavorableHint')}>
              <span className="chip-dot bg-emerald-400 !w-1.5 !h-1.5" />
              {t('calendar.legend.favorable')}
            </span>
            <span className="legend-chip" title={t('calendar.legendNeutralHint')}>
              <span className="chip-dot bg-yellow-400 !w-1.5 !h-1.5" />
              {t('calendar.legend.neutral')}
            </span>
            <span className="legend-chip" title={t('calendar.legendCompletionHint')}>
              <span className="chip-dot bg-rose-400 !w-1.5 !h-1.5" />
              {t('calendar.legend.completion')}
            </span>
            <span className="legend-chip" title={t('calendar.legendZeroHint')}>
              <span className="chip-dot bg-indigo-400 !w-1.5 !h-1.5" />
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
                <ul className="mt-2 space-y-1.5 glass-card p-3 rounded-2xl text-left">
                  {(
                    [
                      ['bg-emerald-400', 'favorable', 'legendFavorableHint'],
                      ['bg-yellow-400', 'neutral', 'legendNeutralHint'],
                      ['bg-rose-400', 'completion', 'legendCompletionHint'],
                      ['bg-indigo-400', 'zeroDay', 'legendZeroHint'],
                    ] as const
                  ).map(([dot, key, hint]) => (
                    <li
                      key={key}
                      className="flex gap-2 text-[11px] text-[var(--text-secondary)] leading-snug"
                    >
                      <span className={`chip-dot ${dot} mt-1 shrink-0 !w-1.5 !h-1.5`} />
                      <span>
                        <strong className="text-white font-medium">
                          {t(`calendar.legend.${key}`)}:
                        </strong>{' '}
                        {t(`calendar.${hint}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[var(--text-muted)] text-[10px] text-center mt-2 opacity-70">
            {t('calendar.swipeHint')}
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav" aria-label="Main">
        <div className="bottom-nav-inner">
          <button type="button" className="nav-item nav-item--active" aria-current="page">
            <CalendarDays size={19} />
            <span>{t('nav.calendar', { defaultValue: 'Календарь' })}</span>
          </button>
          {onCoach && (
            <button type="button" className="nav-item" onClick={onCoach}>
              <MessageCircle size={19} />
              <span>{t('nav.coach', { defaultValue: 'Помощник' })}</span>
            </button>
          )}
          <button type="button" className="nav-item" onClick={onNotes}>
            <BookOpen size={19} />
            <span>{t('nav.notes', { defaultValue: 'Дневник' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onSubscription}>
            <Crown size={19} />
            <span>{t('nav.subscription', { defaultValue: 'Pro' })}</span>
          </button>
          <button type="button" className="nav-item" onClick={onSettings}>
            <Settings size={19} />
            <span>{t('nav.settings', { defaultValue: 'Ещё' })}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
