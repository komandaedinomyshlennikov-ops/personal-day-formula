import { useState, useEffect, useCallback } from 'react';
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
import { AINotes } from '@/components/AINotes';
import { ShareCalendar } from '@/components/ShareCalendar';
import { SubscriptionExpired } from '@/components/SubscriptionExpired';
import { useUserData } from '@/hooks/useUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { buildMonthCsv, buildPdfHtml, downloadCsv } from '@/utils/export';
import { SUPPORT_TELEGRAM } from '@/config/site';
import type { DayInfo, ViewState, Language } from '@/types';
import { Toaster, toast } from 'sonner';

function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState<{
    type: 'month' | 'year';
    number: number;
  } | null>(null);
  const [isReady, setIsReady] = useState(false);
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

  // Initial screen + subscription gate
  useEffect(() => {
    if (!isLoaded) return;

    if (userData.birthDate) {
      const isSubscribed = checkSubscription();
      if (!isSubscribed && userData.subscriptionEndDate) {
        setShowExpiredModal(true);
      }
      setView('calendar');
    } else {
      setView('landing');
    }
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after load
  }, [isLoaded]);

  // Sync i18n with userData.language
  useEffect(() => {
    if (isLoaded && userData.language && userData.language !== currentLanguage) {
      i18n.changeLanguage(userData.language);
    }
  }, [isLoaded, userData.language, currentLanguage, i18n]);

  const handleOnboardingComplete = (date: string) => {
    setBirthDate(date);
    startTrial();
    setView('calendar');
    toast.success(t('onboarding.startTrial'), {
      description: t('subscription.plans.trial.description', {
        defaultValue: '3 дня полного доступа',
      }),
    });
  };

  const handleDaySelect = (day: DayInfo) => {
    setSelectedDay(day);
    setView('day-detail');
  };

  const handleSubscriptionSelect = (planId: string) => {
    if (planId === 'trial') {
      toast.info(t('subscription.trialActiveTitle', { defaultValue: 'Пробный период уже активен' }));
      return;
    }
    setView('activation');
  };

  const handleActivation = async (code: string): Promise<boolean> => {
    const success = await activateWithCode(code);
    if (success) {
      toast.success(t('subscription.activationSuccess', { defaultValue: 'Подписка активирована' }), {
        description: t('subscription.activeDesc', {
          defaultValue: 'Полный доступ открыт',
        }),
      });
      setShowExpiredModal(false);
      setView('calendar');
      return true;
    }

    toast.error(t('subscription.invalidCode', { defaultValue: 'Неверный код' }), {
      description: t('errors.generic', { defaultValue: 'Проверьте код и попробуйте снова' }),
    });
    return false;
  };

  const handleMonthClick = (monthNumber: number) => {
    setSelectedMonthYear({ type: 'month', number: monthNumber });
    setView('month-year-detail');
  };

  const handleYearClick = (yearNumber: number) => {
    setSelectedMonthYear({ type: 'year', number: yearNumber });
    setView('month-year-detail');
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
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        padding: 40px;
        background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
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
      toast.success(t('settings.exportCsv', { defaultValue: 'CSV экспортирован' }));
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error(t('errors.generic', { defaultValue: 'Ошибка при экспорте' }));
    }
  };

  const handleClearData = () => {
    if (confirm(t('settings.deleteDataDesc'))) {
      clearUserData();
      setView('landing');
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
    if (userData.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
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

  if (!isReady) {
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        userData.theme === 'light' ? 'text-gray-900' : 'text-white'
      } ${userData.highContrast ? 'high-contrast' : ''}`}
    >
      <StarBackground />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

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
            setView('subscription');
          }}
          onContactSupport={() => {
            window.open(SUPPORT_TELEGRAM, '_blank');
          }}
          isTrial={userData.isTrialActive}
          daysOverdue={daysOverdue}
        />
      )}

      <AnimatePresence mode="wait">
        {view === 'onboarding' && (
          <PageTransition key="onboarding" direction="none">
            <Onboarding onComplete={(date) => handleOnboardingComplete(date)} />
          </PageTransition>
        )}

        {view === 'landing' && (
          <PageTransition key="landing" direction="none">
            <LandingPage onStart={() => setShowBirthModal(true)} />
          </PageTransition>
        )}

        {view === 'calendar' && userData.birthDate && (
          <PageTransition key="calendar" direction="none">
            <Calendar
              birthDate={userData.birthDate}
              onDaySelect={handleDaySelect}
              onSettings={() => setView('settings')}
              onSubscription={() => setView('subscription')}
              onHome={() => setView('landing')}
              onShare={() => setView('share')}
              onNotes={() => setView('ai-notes')}
              onMonthClick={handleMonthClick}
              onYearClick={handleYearClick}
              isSubscribed={isSubscribed}
            />
          </PageTransition>
        )}

        {view === 'day-detail' && selectedDay && (
          <PageTransition key="day-detail" direction="left">
            <DayDetail day={selectedDay} onBack={() => setView('calendar')} />
          </PageTransition>
        )}

        {view === 'subscription' && (
          <PageTransition key="subscription" direction="left">
            <Subscription
              plans={subscriptionPlans}
              currentPlanId={
                userData.isTrialActive ? 'trial' : isSubscribed ? 'active' : null
              }
              onSelect={handleSubscriptionSelect}
              onBack={() => setView('calendar')}
              trialEndDate={userData.subscriptionEndDate}
            />
          </PageTransition>
        )}

        {view === 'activation' && (
          <PageTransition key="activation" direction="left">
            <ActivationCode
              onActivate={handleActivation}
              onBack={() => setView('subscription')}
            />
          </PageTransition>
        )}

        {view === 'month-year-detail' && selectedMonthYear && (
          <PageTransition key="month-year-detail" direction="left">
            <MonthYearDetail
              type={selectedMonthYear.type}
              number={selectedMonthYear.number}
              onBack={() => setView('calendar')}
              isSubscribed={isSubscribed}
              onSubscribe={() => setView('subscription')}
            />
          </PageTransition>
        )}

        {view === 'ai-notes' && (
          <PageTransition key="ai-notes" direction="left">
            <AINotes onBack={() => setView('calendar')} />
          </PageTransition>
        )}

        {view === 'share' && (
          <PageTransition key="share" direction="left">
            <ShareCalendar onBack={() => setView('calendar')} />
          </PageTransition>
        )}

        {view === 'settings' && (
          <PageTransition key="settings" direction="left">
            <Settings
              userData={userData}
              onBack={() => setView('calendar')}
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
      </AnimatePresence>
    </div>
  );
}

export default App;
