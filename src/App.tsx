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
import { ActivationCode } from '@/components/ActivationCode';
import { BirthDateModal } from '@/components/BirthDateModal';
import { MonthYearDetail } from '@/components/MonthYearDetail';
import { Notes } from '@/components/Notes';
import { ShareCalendar } from '@/components/ShareCalendar';
import { SubscriptionExpired } from '@/components/SubscriptionExpired';
import { LegalDocument } from '@/components/LegalDocument';
import { CookieBanner } from '@/components/CookieBanner';
import { useUserData } from '@/hooks/useUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { buildMonthCsv, buildPdfHtml, downloadCsv } from '@/utils/export';
import { buildDayInfo, dayToPath } from '@/utils/dayInfo';
import { SUPPORT_TELEGRAM } from '@/config/site';
import { trackEvent, trackPageView, initAnalytics, getConsent } from '@/lib/analytics';
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
    startTrial,
    activateWithCode,
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
  const currentLanguage = i18n.language;

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

  useEffect(() => {
    if (isLoaded && userData.language && userData.language !== currentLanguage) {
      void i18n.changeLanguage(userData.language);
    }
  }, [isLoaded, userData.language, currentLanguage, i18n]);

  const handleOnboardingComplete = (date: string) => {
    setBirthDate(date);
    startTrial();
    trackEvent('trial_started');
    navigate('/calendar', { replace: true });
    toast.success(t('onboarding.startTrial'), {
      description: t('subscription.plans.trial.description', {
        defaultValue: '3 дня полного доступа',
      }),
    });
  };

  const handleDaySelect = (day: DayInfo) => {
    navigate(dayToPath(day.date));
  };

  const handleSubscriptionSelect = (planId: string) => {
    if (planId === 'trial') {
      toast.info(
        t('subscription.trialActiveTitle', {
          defaultValue: 'Пробный период уже активен',
        })
      );
      return;
    }
    navigate('/activation');
  };

  const handleActivation = async (code: string): Promise<boolean> => {
    const success = await activateWithCode(code);
    if (success) {
      trackEvent('subscription_activated');
      toast.success(
        t('subscription.activationSuccess', {
          defaultValue: 'Подписка активирована',
        }),
        {
          description: t('subscription.activeDesc', {
            defaultValue: 'Полный доступ открыт',
          }),
        }
      );
      setShowExpiredModal(false);
      navigate('/calendar');
      return true;
    }

    toast.error(t('subscription.invalidCode', { defaultValue: 'Неверный код' }), {
      description: t('errors.generic', {
        defaultValue: 'Проверьте код и попробуйте снова',
      }),
    });
    return false;
  };

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
      const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
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
      toast.success(t('settings.exportPdf', { defaultValue: 'PDF экспортирован' }));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('errors.generic', { defaultValue: 'Ошибка при экспорте' }));
    }
  };

  const handleExportCSV = () => {
    if (!userData.birthDate) return;
    try {
      const { year, month } = getExportPeriod();
      const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
      const csv = buildMonthCsv(userData.birthDate, year, month, locale);
      downloadCsv(csv, `astronavigator-${year}-${String(month).padStart(2, '0')}.csv`);
      trackEvent('export_csv');
      toast.success(t('settings.exportCsv', { defaultValue: 'CSV экспортирован' }));
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error(t('errors.generic', { defaultValue: 'Ошибка при экспорте' }));
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
        onSubmit={(date) => {
          handleOnboardingComplete(date);
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
                  <LandingPage onStart={() => setShowBirthModal(true)} />
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
                  onDaySelect={handleDaySelect}
                  onSettings={() => navigate('/settings')}
                  onSubscription={() => navigate('/subscription')}
                  onHome={() => navigate('/')}
                  onShare={() => navigate('/share')}
                  onNotes={() => navigate('/notes')}
                  onMonthClick={(n) => navigate(`/energy/month/${n}`)}
                  onYearClick={(n) => navigate(`/energy/year/${n}`)}
                  isSubscribed={isSubscribed}
                />
              </PageTransition>
            )}
          />

          <Route
            path="/day/:date"
            element={requireBirth(
              <DayRoute birthDate={userData.birthDate} onBack={goCalendar} />
            )}
          />

          <Route
            path="/energy/:type/:number"
            element={requireBirth(
              <EnergyRoute
                isSubscribed={isSubscribed}
                onBack={goCalendar}
                onSubscribe={() => navigate('/subscription')}
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
                  onSelect={handleSubscriptionSelect}
                  onBack={() =>
                    navigate(userData.birthDate ? '/calendar' : '/')
                  }
                  trialEndDate={userData.subscriptionEndDate}
                />
              </PageTransition>
            }
          />

          <Route
            path="/activation"
            element={
              <PageTransition key="activation" direction="left">
                <ActivationCode
                  onActivate={handleActivation}
                  onBack={() => navigate('/subscription')}
                />
              </PageTransition>
            }
          />

          <Route
            path="/notes"
            element={requireBirth(
              <PageTransition key="notes" direction="left">
                <Notes onBack={goCalendar} />
              </PageTransition>
            )}
          />

          <Route
            path="/share"
            element={requireBirth(
              <PageTransition key="share" direction="left">
                <ShareCalendar onBack={goCalendar} />
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
                  onLanguageChange={(lang) => setLanguage(lang as Language)}
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
  onBack,
}: {
  birthDate: string;
  onBack: () => void;
}) {
  const { date } = useParams();
  const day = date ? buildDayInfo(birthDate, date) : null;

  if (!day) {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <PageTransition key={`day-${date}`} direction="left">
      <DayDetail day={day} onBack={onBack} />
    </PageTransition>
  );
}

function EnergyRoute({
  isSubscribed,
  onBack,
  onSubscribe,
}: {
  isSubscribed: boolean;
  onBack: () => void;
  onSubscribe: () => void;
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
