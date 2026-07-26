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
  Lock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { UpgradeBar } from '@/components/UpgradeBar';
import { UpcomingDays } from '@/components/UpcomingDays';
import { StreakChip } from '@/components/StreakChip';
import { HomeProTools } from '@/components/HomeProTools';
import { MorningNotifyBanner } from '@/components/MorningNotifyBanner';
import { EveningCheckIn } from '@/components/EveningCheckIn';
import type { AccessTier } from '@/utils/access';
import { canUseFeature, hasYearPerks, isPaidTier, isTrialTier } from '@/utils/access';
import { trackEvent } from '@/lib/analytics';
import { buildTelegramPaymentUrl } from '@/config/site';
import {
  getMonthRecommendation,
  getYearRecommendation,
} from '@/data/monthYearRecommendations';
import type { DayInfo } from '@/types';

const HOME_TAB_KEY = 'astronavigator_home_tab_v1';
type HomeTab = 'week' | 'month';

function readHomeTab(): HomeTab {
  try {
    const v = localStorage.getItem(HOME_TAB_KEY);
    if (v === 'week' || v === 'month') return v;
  } catch {
    /* ignore */
  }
  return 'week';
}

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
  isTrialActive: _isTrialActive = false,
  accessTier = 'none',
  notificationsEnabled = false,
  onEnableNotifications,
}: CalendarProps) {
  void _onShare;
  void _isTrialActive; // tier derived from accessTier (trial)
  const paid = isPaidTier(accessTier);
  const yearPerks = hasYearPerks(accessTier);
  const trial = isTrialTier(accessTier);
  const monthYearUnlocked = canUseFeature('monthYearDeep', accessTier);
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  /** Trial / free: block month & year deep dive with subscribe modal */
  const [proLock, setProLock] = useState<'month' | 'year' | null>(null);
  const [homeTab, setHomeTab] = useState<HomeTab>(readHomeTab);
  const [streak, setStreak] = useState<StreakState>({
    streak: 0,
    lastDate: '',
    totalDays: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStreak(recordAppOpen());
  }, []);

  const switchTab = (tab: HomeTab) => {
    setHomeTab(tab);
    try {
      localStorage.setItem(HOME_TAB_KEY, tab);
    } catch {
      /* ignore */
    }
    trackEvent('home_tab_change', { tab });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const birthDateString = normalizeBirthDateString(birthDate) ?? birthDate;

  const monthData = generateMonthData(birthDateString, year, month);
  const personalYear = calculatePersonalYear(birthDateString, year);
  const personalMonth = calculatePersonalMonth(birthDateString, year, month);

  const handleMonthTap = () => {
    if (!monthYearUnlocked) {
      setProLock('month');
      trackEvent('home_month_lock_open', { kind: 'month' });
      return;
    }
    onMonthClick(personalMonth);
  };

  const handleYearTap = () => {
    if (!monthYearUnlocked) {
      setProLock('year');
      trackEvent('home_month_lock_open', { kind: 'year' });
      return;
    }
    onYearClick(personalYear);
  };

  const payTelegramYear = () => {
    const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';
    const url = buildTelegramPaymentUrl('year', lang);
    trackEvent('home_upgrade_bar_click', { action: 'telegram_year' });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
    () => getUpcomingDays(birthDateString, 7),
    [birthDateString]
  );

  const yearEnergy = getEnergyInfo(personalYear, t);
  const monthEnergy = getEnergyInfo(personalMonth, t);

  const lockTeaser = useMemo(() => {
    if (proLock === 'month') {
      const rec = getMonthRecommendation(personalMonth, t);
      return {
        planet: rec.planet || monthEnergy.planet,
        title: rec.title,
        focus: rec.focus[0] || '',
        lockedCount: Math.max(0, rec.focus.length - 1 + rec.opportunities.length),
      };
    }
    if (proLock === 'year') {
      const rec = getYearRecommendation(personalYear, t);
      return {
        planet: rec.planet || yearEnergy.planet,
        title: rec.title,
        focus: rec.focus[0] || '',
        lockedCount: Math.max(0, rec.focus.length - 1 + rec.opportunities.length),
      };
    }
    return null;
  }, [proLock, personalMonth, personalYear, t, monthEnergy.planet, yearEnergy.planet]);

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

      {/* Scrollable main stack — P0: compress, one upsell, hero hierarchy, calendar closer */}
      <div className="home-body">
        {/* P0.2 + P1.4: UpgradeBar; end of trial → Telegram pay year */}
        {((trial && daysLeft > 0) ||
          (paid && !trial && daysLeft > 0 && daysLeft <= 14)) && (
          <UpgradeBar
            daysLeft={daysLeft}
            isTrial={trial}
            onOpenSubscription={() => {
              trackEvent('home_upgrade_bar_click', { action: 'plans' });
              onSubscription();
            }}
            onPayTelegram={trial && daysLeft <= 1 ? payTelegramYear : undefined}
          />
        )}

        {/* Today hero */}
        {todayEnergy && todayInfo && todayAction && todayStory && (
          <button
            type="button"
            data-coach="today"
            onClick={() => onDaySelect(todayInfo)}
            className={`today-hero today-hero--story today-hero--compact ${todayToneBorder}`}
            style={{ background: todayToneBg }}
          >
            <div className="today-hero__top">
              <div
                className="today-hero__icon today-hero__icon--sm"
                style={{
                  background: `${todayEnergy.color}2e`,
                  boxShadow: `0 0 20px ${todayEnergy.color}30`,
                }}
              >
                {todayEnergy.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={toneDotClass} />
                  <span className="today-hero__badge">{todayStory.toneLabel}</span>
                </div>
                <p className="today-hero__action today-hero__action--primary">
                  {todayAction.action}
                </p>
                <p className="today-hero__story-title today-hero__story-title--sm">
                  {todayStory.storyTitle}
                </p>
                <p className="today-hero__meta">
                  {t('calendar.today')} · №{todayInfo.personalNumber} · {todayEnergy.planet}
                  {displayName
                    ? ` · ${t('calendar.forYouShort', {
                        name: displayName,
                        defaultValue: displayName,
                      })}`
                    : ''}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-[var(--text-muted)] shrink-0 opacity-70 self-center"
              />
            </div>
            {todayStory.doList.length > 0 && (
              <ul className="today-hero__do-list">
                {todayStory.doList.slice(0, 2).map((item) => (
                  <li key={item}>
                    <span className="text-emerald-300">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <p className="today-hero__hint">
              {todayStory.doList.length > 2
                ? t('calendar.tapForMore', { defaultValue: 'Tap for full day · more tips' })
                : t('calendar.tapForDetails')}
            </p>
          </button>
        )}

        {/* P1.1: Week / Month tabs */}
        <div className="home-tabs" role="tablist" aria-label={t('calendar.homeTabsLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'week'}
            className={`home-tabs__btn ${homeTab === 'week' ? 'home-tabs__btn--on' : ''}`}
            onClick={() => switchTab('week')}
          >
            {t('calendar.tabWeek')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'month'}
            className={`home-tabs__btn ${homeTab === 'month' ? 'home-tabs__btn--on' : ''}`}
            onClick={() => switchTab('month')}
          >
            {t('calendar.tabMonth')}
          </button>
        </div>

        {homeTab === 'week' && (
          <div className="space-y-2.5" role="tabpanel">
            {onCoach && (
              <button
                type="button"
                data-coach="discuss"
                onClick={onCoach}
                className="coach-chip"
              >
                <MessageCircle size={14} className="text-violet-200 shrink-0" />
                <span className="truncate flex-1 text-left">{t('coach.ctaHome')}</span>
                <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0" />
              </button>
            )}

            {onEnableNotifications && (
              <MorningNotifyBanner
                enabled={notificationsEnabled}
                onEnable={onEnableNotifications}
              />
            )}

            <UpcomingDays days={upcoming} onSelect={onDaySelect} />

            {streak.streak > 0 && (
              <p className="habit-nudge">
                {t('calendar.habitNudge', {
                  count: streak.streak,
                  defaultValue: 'Day {{count}} in a row — come back tomorrow for a new energy',
                })}
              </p>
            )}

            <EveningCheckIn birthDate={birthDateString} openHour={17} />

            {/* Month / Year chips */}
            <div className="stats-row">
              <button
                type="button"
                onClick={handleYearTap}
                className="stat-mini relative"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(245,215,142,0.12), rgba(245,158,11,0.04))',
                }}
              >
                {!monthYearUnlocked && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 inline-flex items-center gap-0.5">
                    <Lock size={8} />
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
                onClick={handleMonthTap}
                className="stat-mini relative"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(167,139,250,0.14), rgba(244,114,182,0.05))',
                }}
              >
                {!monthYearUnlocked && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 inline-flex items-center gap-0.5">
                    <Lock size={8} />
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
          </div>
        )}

        {homeTab === 'month' && (
          <div className="space-y-2.5" role="tabpanel">
            <div ref={containerRef} className="cal-panel" data-coach="grid" id="home-cal-panel">
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
        )}

        {/* P1.3: Pro tools accordion */}
        <HomeProTools
          birthDate={birthDateString}
          showMonthPro={canUseFeature('monthYearDeep', accessTier)}
          showYearPerks={yearPerks}
          showYearUpsell={paid && !yearPerks}
          onSelectDay={onDaySelect}
          onOpenMonth={onMonthClick}
          onOpenYear={onYearClick}
          onNotes={onNotes}
          onExport={onSettings}
          onUpgrade={onSubscription}
        />
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

      {/* P1.2: locked preview — teaser + blur, not empty paywall */}
      <Dialog open={proLock !== null} onOpenChange={(open) => !open && setProLock(null)}>
        <DialogContent
          className="bg-[#12101c] border-amber-400/25 text-white sm:max-w-sm rounded-3xl"
          showCloseButton
        >
          <DialogHeader className="text-left space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-1">
              <Lock size={22} className="text-amber-300" />
            </div>
            <DialogTitle className="text-white text-lg font-semibold">
              {proLock === 'year'
                ? t('premium.lockYearTitle')
                : t('premium.lockMonthTitle')}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-left">
                {lockTeaser && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-amber-200/80 font-semibold">
                      {proLock === 'year'
                        ? t('calendar.personalYear')
                        : t('calendar.personalMonth')}{' '}
                      · {lockTeaser.planet}
                    </p>
                    <p className="text-white text-sm font-semibold mt-1">{lockTeaser.title}</p>
                    {lockTeaser.focus && (
                      <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                        {lockTeaser.focus}
                      </p>
                    )}
                    <div className="mt-2 relative overflow-hidden rounded-xl border border-white/8">
                      <ul className="p-2.5 space-y-1.5 blur-[3px] select-none opacity-70">
                        <li className="text-[11px] text-[var(--text-muted)]">••• focus area 2</li>
                        <li className="text-[11px] text-[var(--text-muted)]">••• opportunities</li>
                        <li className="text-[11px] text-[var(--text-muted)]">••• significant dates</li>
                      </ul>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <span className="text-[11px] font-semibold text-amber-100 px-2 py-1 rounded-lg border border-amber-400/30 bg-amber-400/15">
                          {t('premium.lockBlurLabel', {
                            count: lockTeaser.lockedCount || 4,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {proLock === 'year'
                    ? t('premium.lockYearBody')
                    : t('premium.lockMonthBody')}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
            <button
              type="button"
              onClick={() => {
                setProLock(null);
                trackEvent('home_upgrade_bar_click', {
                  action: proLock === 'year' ? 'lock_year' : 'lock_month',
                });
                onSubscription();
              }}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-black bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-colors"
            >
              {t('premium.subscribeCta')}
            </button>
            <button
              type="button"
              onClick={() => setProLock(null)}
              className="w-full py-2.5 rounded-2xl text-sm text-[var(--text-muted)] hover:text-white"
            >
              {t('actions.cancel', { defaultValue: 'Отмена' })}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
