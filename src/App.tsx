import { useState, useEffect, useCallback } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { StarBackground } from '@/components/StarBackground';
import { PageTransition } from '@/components/PageTransition';
import { Onboarding } from '@/components/Onboarding';
import { LandingPage } from '@/components/LandingPage';
import { Calendar } from '@/components/Calendar';
import { DayDetail } from '@/components/DayDetail';
import { Subscription } from '@/components/Subscription';
import { Settings } from '@/components/Settings';
import { UnlockAccess } from '@/components/UnlockAccess';
import { BirthDateModal } from '@/components/BirthDateModal';
import { MonthYearDetail } from '@/components/MonthYearDetail';
import { Notes } from '@/components/Notes';
import { ShareCalendar } from '@/components/ShareCalendar';
import { DayCoach } from '@/components/DayCoach';
import { SubscriptionExpired } from '@/components/SubscriptionExpired';
import { LegalDocument } from '@/components/LegalDocument';
import { CookieBanner } from '@/components/CookieBanner';
import { useUserData } from '@/hooks/useUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { buildMonthCsv, buildPdfHtml, downloadCsv } from '@/utils/export';
import { buildDayInfo, dayToPath } from '@/utils/dayInfo';
import { getDaysLeft } from '@/utils/upcomingDays';
import { SUPPORT_TELEGRAM } from '@/config/site';
import { trackEvent, trackPageView, initAnalytics, getConsent } from '@/lib/analytics';
import { normalizeLanguage, setAppLanguage, type LanguageCode } from '@/i18n';
import {
  canUseFeature,
  getAccessTier,
  isPaidTier,
} from '@/utils/access';
import type { DayInfo, Language } from '@/types';
import { Toaster, toast } from 'sonner';

function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    if (getConsent() === 'accepted') {
      initAnalytics();
      trackPageView(location.pathname + location.search + location.hash);
    }
  }, [location]);
  return null;
}

function AppShell() {
  const navigate = useNavigate();
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const {
    userData,
    isLoaded,
    setBirthDate,
    setDisplayName,
    startTrial,
    activateWithCode,
    activateWithPlan,
    revalidateEntitlement,
    checkSubscription,
    setTheme,
    toggleHighContrast,
    toggleNotifications,
    setLanguage,
    clearUserData,
    logout,
    subscriptionPlans,
  } = useUserData();

  const {
    requestPermission,
    scheduleDailyNotification,
    disableDailyNotifications,
  } = useNotifications();
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(i18n.language);

  useEffect(() => {
    if (!isLoaded) return;
    if (userData.birthDate) {
      const isSubscribed = checkSubscription();
      if (!isSubscribed && userData.subscriptionEndDate) {
        setShowExpiredModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Sync stored profile language → i18n (once loaded), without reload
  useEffect(() => {
    if (!isLoaded) return;
    const stored = normalizeLanguage(userData.language);
    if (stored !== currentLanguage) {
      void setAppLanguage(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on load / profile language
  }, [isLoaded, userData.language]);

  const handleLanguageChange = useCallback(
    (lang: LanguageCode | string) => {
      const next = normalizeLanguage(lang);
      void setAppLanguage(next).then(() => {
        setLanguage(next as Language);
      });
    },
    [setLanguage]
  );

  const handleOnboardingComplete = (date: string, name?: string) => {
    setBirthDate(date);
    if (name) setDisplayName(name);
    startTrial();
    trackEvent('trial_started');
    navigate('/calendar', { replace: true });
    const greet = name
      ? t('calendar.welcomeNamed', {
          name,
          defaultValue: `Welcome, ${name}`,
        })
      : t('onboarding.startTrial');
    toast.success(greet, {
      description: t('subscription.plans.trial.description', {
        defaultValue: '3 days full access',
      }),
    });
  };

  const handleDaySelect = (day: DayInfo) => {
    navigate(dayToPath(day.date));
  };

  /** One-tap unlock from Telegram link: #/unlock?token=… */
  const handleUnlockToken = useCallback(
    async (token: string): Promise<boolean> => {
      const { claimUnlockToken, isSignedUnlockToken } = await import('@/utils/payClaim');

      let success = false;
      let method: 'telegram_auto_pay' | 'telegram_unlock_link' | 'legacy_dev' =
        'telegram_unlock_link';

      if (isSignedUnlockToken(token)) {
        // Server-verified claim → entitlement (cannot forge client-side)
        const claimed = await claimUnlockToken(token);
        if (claimed) {
          success = activateWithPlan(
            claimed.plan,
            claimed.days,
            claimed.entitlement
          );
          method = 'telegram_auto_pay';
          if (success) void revalidateEntitlement();
        }
      } else if (!import.meta.env.PROD) {
        // Legacy static codes — DEV only (audit P0.3)
        success = await activateWithCode(token);
        method = 'legacy_dev';
      }

      if (success) {
        trackEvent('subscription_activated', { method });
        toast.success(t('subscription.activationSuccess'), {
          description: t('subscription.activeDesc'),
        });
        setShowExpiredModal(false);
        return true;
      }
      trackEvent('subscription_unlock_failed');
      return false;
    },
    [activateWithCode, activateWithPlan, revalidateEntitlement, t]
  );

  const getExportPeriod = () => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  };

  const handleExportPDF = async () => {
    if (!userData.birthDate) return;
    try {
      const [{ default: JsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const { year, month } = getExportPeriod();
      const locale = currentLanguage === 'ru' ? 'ru-RU' : 'en-US';
      const bodyHtml = buildPdfHtml({
        birthDate: userData.birthDate,
        year,
        month,
        locale,
      });
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: -9999px; top: 0; width: 794px; padding: 40px;
        background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
        color: white; font-family: system-ui, -apple-system, sans-serif;
      `;
      container.innerHTML = bodyHtml;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a2e',
      });
      document.body.removeChild(container);
      const doc = new JsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
      doc.save(`astronavigator-${year}-${String(month).padStart(2, '0')}.pdf`);
      trackEvent('export_pdf');
      toast.success(t('export.pdfOk'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('export.pdfError'));
    }
  };

  const handleExportCSV = () => {
    if (!userData.birthDate) return;
    try {
      const { year, month } = getExportPeriod();
      const locale = currentLanguage === 'ru' ? 'ru-RU' : 'en-US';
      const csv = buildMonthCsv(userData.birthDate, year, month, locale);
      downloadCsv(csv, `astronavigator-${year}-${String(month).padStart(2, '0')}.csv`);
      trackEvent('export_csv');
      toast.success(t('export.csvOk'));
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error(t('export.csvError'));
    }
  };

  const handleClearData = () => {
    if (confirm(t('settings.deleteDataDesc'))) {
      clearUserData();
      navigate('/', { replace: true });
      toast.success(t('actions.done'));
    }
  };

  const handleLogout = () => {
    if (confirm(t('settings.logoutDesc'))) {
      logout();
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (userData.theme === 'dark') {
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else if (userData.theme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    }
  }, [userData.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (userData.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
  }, [userData.highContrast]);

  const handleToggleNotifications = useCallback(async () => {
    if (!userData.notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        toggleNotifications();
        scheduleDailyNotification(8, 0);
        toast.success(t('settings.notifications'), {
          description: t('notifications.disclaimerBody'),
        });
      }
    } else {
      disableDailyNotifications();
      toggleNotifications();
      toast.info(t('settings.notifications'), {
        description: t('notifications.permissionDenied', {
          defaultValue: 'Notifications disabled',
        }),
      });
    }
  }, [
    userData.notificationsEnabled,
    requestPermission,
    toggleNotifications,
    scheduleDailyNotification,
    disableDailyNotifications,
    t,
  ]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const isSubscribed = checkSubscription();
  const accessTier = getAccessTier(userData);
  const isPaid = isPaidTier(accessTier);
  const daysLeft = isSubscribed
    ? getDaysLeft(userData.subscriptionEndDate)
    : 0;
  const subscriptionEnded =
    !isSubscribed && !!userData.subscriptionEndDate && !!userData.birthDate;
  const daysOverdue = subscriptionEnded
    ? Math.floor(
        (Date.now() - new Date(userData.subscriptionEndDate!).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const goCalendar = () => navigate('/calendar');
  const requireBirth = (node: React.ReactNode) =>
    userData.birthDate ? node : <Navigate to="/" replace />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        userData.theme === 'light' ? 'text-gray-900' : 'text-white'
      } ${userData.highContrast ? 'high-contrast' : ''}`}
    >
      <StarBackground />
      <div className="app-aurora" aria-hidden />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(22, 19, 34, 0.95)',
            color: '#f7f4ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <CookieBanner />
      <AnalyticsListener />

      <BirthDateModal
        isOpen={showBirthModal}
        onClose={() => setShowBirthModal(false)}
        onSubmit={({ date, name }) => {
          handleOnboardingComplete(date, name);
          setShowBirthModal(false);
        }}
      />

      {showExpiredModal && subscriptionEnded && (
        <SubscriptionExpired
          onSubscribe={() => {
            setShowExpiredModal(false);
            navigate('/subscription');
          }}
          onContactSupport={() => {
            window.open(SUPPORT_TELEGRAM, '_blank');
          }}
          isTrial={userData.isTrialActive}
          daysOverdue={daysOverdue}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              userData.birthDate ? (
                <Navigate to="/calendar" replace />
              ) : (
                <PageTransition key="landing" direction="none">
                  <LandingPage
                  onStart={() => setShowBirthModal(true)}
                  onLanguageChange={handleLanguageChange}
                />
                </PageTransition>
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              <PageTransition key="onboarding" direction="none">
                <Onboarding onComplete={handleOnboardingComplete} />
              </PageTransition>
            }
          />

          <Route
            path="/calendar"
            element={requireBirth(
              <PageTransition key="calendar" direction="none">
                <Calendar
                  birthDate={userData.birthDate}
                  displayName={userData.displayName}
                  onDaySelect={handleDaySelect}
                  onSettings={() => navigate('/settings')}
                  onSubscription={() => navigate('/subscription')}
                  onHome={() => navigate('/')}
                  onShare={() => navigate('/share')}
                  onNotes={() => navigate('/notes')}
                  onCoach={() => navigate('/coach')}
                  onMonthClick={(n) => navigate(`/energy/month/${n}`)}
                  onYearClick={(n) => navigate(`/energy/year/${n}`)}
                  isSubscribed={isSubscribed}
                  daysLeft={daysLeft}
                  isTrialActive={userData.isTrialActive}
                  accessTier={accessTier}
                  notificationsEnabled={userData.notificationsEnabled}
                  onEnableNotifications={() => void handleToggleNotifications()}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/day/:date"
            element={requireBirth(
              <DayRoute
                birthDate={userData.birthDate}
                displayName={userData.displayName}
                onBack={goCalendar}
                onDiscuss={(personalNumber, dateKey) =>
                  navigate(`/coach?n=${personalNumber}&d=${dateKey}`)
                }
              />
            )}
          />

          <Route
            path="/coach"
            element={requireBirth(
              <PageTransition key="coach" direction="left">
                <CoachRoute
                  birthDate={userData.birthDate}
                  displayName={userData.displayName}
                  unlimited={canUseFeature('coachUnlimited', accessTier)}
                  onBack={goCalendar}
                  onUpgrade={() => navigate('/subscription')}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/energy/:type/:number"
            element={requireBirth(
              <EnergyRoute
                birthDate={userData.birthDate}
                isSubscribed={isPaid}
                onBack={goCalendar}
                onSubscribe={() => navigate('/subscription')}
                onSelectDay={(path) => navigate(path)}
              />
            )}
          />

          <Route
            path="/subscription"
            element={
              <PageTransition key="subscription" direction="left">
                <Subscription
                  plans={subscriptionPlans}
                  currentPlanId={
                    userData.isTrialActive
                      ? 'trial'
                      : isSubscribed
                        ? 'active'
                        : null
                  }
                  accessTier={accessTier}
                  onBack={() =>
                    navigate(userData.birthDate ? '/calendar' : '/')
                  }
                  trialEndDate={userData.subscriptionEndDate}
                />
              </PageTransition>
            }
          />

          <Route
            path="/unlock"
            element={
              <PageTransition key="unlock" direction="none">
                <UnlockAccess onUnlock={handleUnlockToken} />
              </PageTransition>
            }
          />

          <Route
            path="/notes"
            element={requireBirth(
              <PageTransition key="notes" direction="left">
                <Notes
                  onBack={goCalendar}
                  tipsUnlocked={canUseFeature('notesTips', accessTier)}
                  onUpgrade={() => navigate('/subscription')}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/share"
            element={requireBirth(
              <PageTransition key="share" direction="left">
                <ShareCalendar
                  onBack={goCalendar}
                  birthDate={userData.birthDate}
                  displayName={userData.displayName}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/settings"
            element={requireBirth(
              <PageTransition key="settings" direction="left">
                <Settings
                  userData={userData}
                  onBack={goCalendar}
                  onThemeChange={setTheme}
                  onToggleHighContrast={toggleHighContrast}
                  onToggleNotifications={handleToggleNotifications}
                  onExportPDF={handleExportPDF}
                  onExportCSV={handleExportCSV}
                  onClearData={handleClearData}
                  onLogout={handleLogout}
                  onLanguageChange={handleLanguageChange}
                  onDisplayNameChange={setDisplayName}
                  exportUnlocked={canUseFeature('export', accessTier)}
                  energyRemindersUnlocked={canUseFeature('customReminders', accessTier)}
                  onUpgrade={() => navigate('/subscription')}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/privacy"
            element={
              <PageTransition key="privacy" direction="left">
                <LegalDocument kind="privacy" />
              </PageTransition>
            }
          />

          <Route
            path="/terms"
            element={
              <PageTransition key="terms" direction="left">
                <LegalDocument kind="terms" />
              </PageTransition>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function DayRoute({
  birthDate,
  displayName,
  onBack,
  onDiscuss,
}: {
  birthDate: string;
  displayName?: string;
  onBack: () => void;
  onDiscuss?: (personalNumber: number, dateKey: string) => void;
}) {
  const { date } = useParams();
  const day = date ? buildDayInfo(birthDate, date) : null;

  if (!day) {
    return <Navigate to="/calendar" replace />;
  }

  const dateKey = date || '';

  return (
    <PageTransition key={`day-${date}`} direction="left">
      <DayDetail
        day={day}
        displayName={displayName}
        onBack={onBack}
        onDiscuss={
          onDiscuss
            ? () => onDiscuss(day.personalNumber, dateKey)
            : undefined
        }
      />
    </PageTransition>
  );
}

function CoachRoute({
  birthDate,
  displayName,
  unlimited,
  onBack,
  onUpgrade,
}: {
  birthDate: string;
  displayName?: string;
  unlimited: boolean;
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const n = Number(params.get('n'));
  const d = params.get('d') || undefined;

  return (
    <DayCoach
      birthDate={birthDate}
      displayName={displayName}
      personalNumber={Number.isFinite(n) && n > 0 ? n : undefined}
      dateKey={d || undefined}
      unlimited={unlimited}
      freeLimit={5}
      onBack={onBack}
      onUpgrade={onUpgrade}
    />
  );
}

function EnergyRoute({
  birthDate,
  isSubscribed,
  onBack,
  onSubscribe,
  onSelectDay,
}: {
  birthDate: string | null;
  isSubscribed: boolean;
  onBack: () => void;
  onSubscribe: () => void;
  onSelectDay: (iso: string) => void;
}) {
  const { type, number } = useParams();
  const n = Number(number);
  if ((type !== 'month' && type !== 'year') || !Number.isFinite(n)) {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <PageTransition key={`energy-${type}-${n}`} direction="left">
      <MonthYearDetail
        type={type}
        number={n}
        onBack={onBack}
        isSubscribed={isSubscribed}
        onSubscribe={onSubscribe}
        birthDate={birthDate}
        onSelectDay={onSelectDay}
      />
    </PageTransition>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
