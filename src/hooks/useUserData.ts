import { useState, useEffect, useCallback } from 'react';
import type { UserData, SubscriptionPlan, Language } from '@/types';

const defaultUserData: UserData = {
  birthDate: '',
  subscriptionEndDate: null,
  isTrialActive: false,
  theme: 'dark',
  highContrast: false,
  notificationsEnabled: false,
  language: 'ru',
};

// Валидные коды активации
const VALID_CODES: Record<string, { plan: string; days: number }> = {
  'MONTH-4915': { plan: 'month', days: 30 },
  'YEAR-4915': { plan: 'year', days: 365 },
  'LIFE-4915': { plan: 'lifetime', days: 99999 },
  // Тестовые коды
  'TEST-1234': { plan: 'test', days: 30 },
};

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: '3 дня бесплатно',
    price: 0,
    period: 'пробный период',
    description: 'Попробуйте все функции бесплатно'
  },
  {
    id: 'month',
    name: 'Месяц',
    price: 10,
    period: 'месяц',
    description: 'Базовый доступ'
  },
  {
    id: 'year',
    name: 'Год',
    price: 50,
    period: 'год',
    description: 'Выгода 58%',
    popular: true
  },
  {
    id: 'lifetime',
    name: 'Навсегда',
    price: 100,
    period: 'пожизненно',
    description: 'Пожизненный доступ'
  }
];

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка данных из localStorage
  useEffect(() => {
    const stored = localStorage.getItem('astronavigator_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserData({ ...defaultUserData, ...parsed });
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('astronavigator_user', JSON.stringify(userData));
    }
  }, [userData, isLoaded]);

  const setBirthDate = useCallback((date: string) => {
    setUserData(prev => ({ ...prev, birthDate: date }));
  }, []);

  const startTrial = useCallback(() => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    setUserData(prev => ({
      ...prev,
      isTrialActive: true,
      subscriptionEndDate: trialEndDate.toISOString()
    }));
  }, []);

  const activateSubscription = useCallback((planId: string) => {
    const endDate = new Date();
    
    switch (planId) {
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'lifetime':
        endDate.setFullYear(endDate.getFullYear() + 100);
        break;
      default:
        return;
    }

    setUserData(prev => ({
      ...prev,
      isTrialActive: false,
      subscriptionEndDate: endDate.toISOString()
    }));
  }, []);

  // Активация по коду
  const activateWithCode = useCallback((code: string): boolean => {
    const normalizedCode = code.trim().toUpperCase();
    const activationData = VALID_CODES[normalizedCode];
    
    if (!activationData) {
      return false;
    }

    const endDate = new Date();
    if (activationData.plan === 'lifetime') {
      endDate.setFullYear(2099);
    } else {
      endDate.setDate(endDate.getDate() + activationData.days);
    }

    setUserData(prev => ({
      ...prev,
      isTrialActive: false,
      subscriptionEndDate: endDate.toISOString(),
      activatedPlan: activationData.plan,
      activationCode: normalizedCode
    }));

    return true;
  }, []);

  const checkSubscription = useCallback((): boolean => {
    if (!userData.subscriptionEndDate) return false;
    const endDate = new Date(userData.subscriptionEndDate);
    return endDate > new Date();
  }, [userData.subscriptionEndDate]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setUserData(prev => ({ ...prev, theme }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setUserData(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setUserData(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setUserData(prev => ({ ...prev, language }));
  }, []);

  const clearUserData = useCallback(() => {
    setUserData(defaultUserData);
    localStorage.removeItem('astronavigator_user');
    localStorage.removeItem('astronavigator_notes');
  }, []);

  // Выход из приложения (сброс сессии)
  const logout = useCallback(() => {
    setUserData(defaultUserData);
    localStorage.removeItem('astronavigator_user');
    localStorage.removeItem('astronavigator_notes');
    // Перезагрузка страницы для полного сброса
    window.location.reload();
  }, []);

  return {
    userData,
    isLoaded,
    setBirthDate,
    startTrial,
    activateSubscription,
    activateWithCode,
    checkSubscription,
    setTheme,
    toggleHighContrast,
    toggleNotifications,
    setLanguage,
    clearUserData,
    logout,
    subscriptionPlans
  };
}
