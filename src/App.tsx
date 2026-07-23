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
import type { DayInfo, ViewState, Language } from '@/types';
import { Toaster, toast } from 'sonner';

function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState<{ type: 'month' | 'year'; number: number } | null>(null);
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
    subscriptionPlans
  } = useUserData();

  const { requestPermission, scheduleDailyNotification } = useNotifications();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Определение начального экрана и проверка подписки
  useEffect(() => {
    if (isLoaded) {
      if (userData.birthDate) {
        // Проверяем, активна ли подписка
        const isSubscribed = checkSubscription();
        if (!isSubscribed && userData.subscriptionEndDate) {
          // Подписка закончилась - показываем экран блокировки
          setShowExpiredModal(true);
        }
        setView('calendar');
      } else {
        setView('landing');
      }
      setIsReady(true);
    }
  }, [isLoaded, userData.birthDate, userData.subscriptionEndDate]);

  // Синхронизация языка приложения с userData
  useEffect(() => {
    if (isLoaded && userData.language && userData.language !== currentLanguage) {
      i18n.changeLanguage(userData.language);
    }
  }, [isLoaded, userData.language, currentLanguage, i18n]);

  // Обработчик завершения onboarding
  const handleOnboardingComplete = (date: string) => {
    setBirthDate(date);
    startTrial();
    setView('calendar');
    toast.success(t('notifications.trialEnded'), {
      description: t('subscription.plans.trial.description')
    });
  };

  // Обработчик выбора дня
  const handleDaySelect = (day: DayInfo) => {
    setSelectedDay(day);
    setView('day-detail');
  };

  // Обработчик выбора подписки
  const handleSubscriptionSelect = (planId: string) => {
    if (planId === 'trial') {
      toast.info('Пробный период уже активирован');
      return;
    }
    setView('activation');
  };

  // Обработчик активации по коду
  const handleActivation = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const success = activateWithCode(code);
    if (success) {
      // Определяем тип подписки для сообщения
      const isLifetime = normalizedCode === 'LIFE-2026';
      toast.success(t('subscription.activationSuccess'), {
        description: isLifetime 
          ? t('subscription.plans.lifetime.description')
          : t('subscription.choosePlan')
      });
      setShowExpiredModal(false);
      setView('calendar');
    } else {
      toast.error(t('subscription.invalidCode'), {
        description: t('errors.generic')
      });
    }
  };

  // Обработчик клика на личный месяц
  const handleMonthClick = (monthNumber: number) => {
    setSelectedMonthYear({ type: 'month', number: monthNumber });
    setView('month-year-detail');
  };

  // Обработчик клика на личный год
  const handleYearClick = (yearNumber: number) => {
    setSelectedMonthYear({ type: 'year', number: yearNumber });
    setView('month-year-detail');
  };

  // Экспорт в PDF
  const handleExportPDF = async () => {
    if (!userData.birthDate) return;
    
    try {
      const [{ default: JsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      const birthDate = new Date(userData.birthDate);
      const currentDate = new Date();
      
      // Создаём временный контейнер для рендеринга
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
      
      // Генерируем HTML контент
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Астронавигатор
          </h1>
          <p style="color: #9ca3af; font-size: 14px;">Личный календарь успеха</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">Дата рождения</p>
          <p style="font-size: 20px; font-weight: bold;">${birthDate.toLocaleDateString('ru-RU')}</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">Отчёт сгенерирован</p>
          <p style="font-size: 16px;">${currentDate.toLocaleDateString('ru-RU')}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">
            astrocalendar.ok.kimi.link
          </p>
          <p style="color: #6b7280; font-size: 11px; margin-top: 4px;">
            © 2026 Татьяна Генюш
          </p>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // Конвертируем в canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a2e'
      });
      
      document.body.removeChild(container);
      
      // Создаём PDF
      const doc = new JsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save('astronavigator-calendar.pdf');
      
      toast.success('PDF экспортирован');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Ошибка при экспорте');
    }
  };

  // Экспорт в CSV
  const handleExportCSV = () => {
    if (!userData.birthDate) return;
    
    const csvContent = 'data:text/csv;charset=utf-8,Дата,Общее число,Личное число\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'astronavigator-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV экспортирован');
  };

  // Очистка данных
  const handleClearData = () => {
    if (confirm(t('settings.deleteDataDesc'))) {
      clearUserData();
      setView('landing');
      toast.success(t('actions.done'));
    }
  };

  // Выход из приложения
  const handleLogout = () => {
    if (confirm(t('settings.logoutDesc'))) {
      logout();
    }
  };

  // Применение темы
  useEffect(() => {
    const root = document.documentElement;
    
    if (userData.theme === 'dark') {
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else if (userData.theme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      // Auto - следуем системным настройкам
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

  // Применение высокого контраста
  useEffect(() => {
    const root = document.documentElement;
    if (userData.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [userData.highContrast]);

  // Обработчик переключения уведомлений
  const handleToggleNotifications = useCallback(async () => {
    if (!userData.notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        toggleNotifications();
        scheduleDailyNotification(8, 0);
        toast.success(t('settings.notifications'), {
          description: t('notifications.dailyReminderBody')
        });
      }
    } else {
      toggleNotifications();
      toast.info(t('notifications.subscriptionEnded'));
    }
  }, [userData.notificationsEnabled, requestPermission, toggleNotifications, scheduleDailyNotification, t]);

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
  const birthDate = userData.birthDate ? new Date(userData.birthDate) : new Date();
  
  // Проверяем, закончилась ли подписка
  const subscriptionEnded = !isSubscribed && userData.subscriptionEndDate && userData.birthDate;
  const daysOverdue = subscriptionEnded 
    ? Math.floor((new Date().getTime() - new Date(userData.subscriptionEndDate!).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${userData.theme === 'light' ? 'text-gray-900' : 'text-white'} ${userData.highContrast ? 'high-contrast' : ''}`}>
      <StarBackground />
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />

      {/* Birth Date Modal */}
      <BirthDateModal
        isOpen={showBirthModal}
        onClose={() => setShowBirthModal(false)}
        onSubmit={(date) => {
          handleOnboardingComplete(date);
          setShowBirthModal(false);
        }}
      />

      {/* Subscription Expired Modal - блокирует доступ */}
      {showExpiredModal && subscriptionEnded && (
        <SubscriptionExpired
          onSubscribe={() => {
            setShowExpiredModal(false);
            setView('subscription');
          }}
          onContactSupport={() => {
            window.open('https://t.me/tatianageniush', '_blank');
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

        {view === 'calendar' && (
          <PageTransition key="calendar" direction="none">
            <Calendar
              birthDate={birthDate}
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
            <DayDetail
              day={selectedDay}
              onBack={() => setView('calendar')}
            />
          </PageTransition>
        )}

        {view === 'subscription' && (
          <PageTransition key="subscription" direction="left">
            <Subscription
              plans={subscriptionPlans}
              currentPlanId={userData.isTrialActive ? 'trial' : (isSubscribed ? 'active' : null)}
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
            <ShareCalendar 
              onBack={() => setView('calendar')} 
            />
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
