import { useState, useEffect, useCallback } from 'react';
import type { UserData, SubscriptionPlan, Language } from '@/types';
import { resolveActivationCode } from '@/utils/activation';
import { normalizeBirthDateString } from '@/utils/date';

const defaultUserData: UserData = {
  birthDate: '',
  displayName: '',
  subscriptionEndDate: null,
  isTrialActive: false,
  theme: 'dark',
  highContrast: false,
  notificationsEnabled: false,
  language: 'ru',
};

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: '3 дня бесплатно',
    price: 0,
    period: 'пробный период',
    description: 'Попробуйте все функции бесплатно',
  },
  {
    id: 'month',
    name: 'Месяц',
    price: 10,
    period: 'месяц',
    description: 'Базовый доступ',
  },
  {
    id: 'year',
    name: 'Год',
    price: 50,
    period: 'год',
    description: 'Выгода 58%',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Навсегда',
    price: 100,
    period: 'пожизненно',
    description: 'Пожизненный доступ',
  },
];

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(() => {
    if (typeof window === 'undefined') return defaultUserData;
    try {
      const stored = localStorage.getItem('astronavigator_user');
      if (!stored) return defaultUserData;
      const parsed = JSON.parse(stored) as Partial<UserData>;
      const birthDate = parsed.birthDate
        ? normalizeBirthDateString(parsed.birthDate) ?? ''
        : '';
      return { ...defaultUserData, ...parsed, birthDate };
    } catch {
      return defaultUserData;
    }
  });
  const [isLoaded] = useState(true);

  // Persist
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('astronavigator_user', JSON.stringify(userData));
  }, [userData, isLoaded]);

  const setBirthDate = useCallback((date: string) => {
    const normalized = normalizeBirthDateString(date);
    if (!normalized) return;
    setUserData((prev) => ({ ...prev, birthDate: normalized }));
  }, []);

  const setDisplayName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40);
    setUserData((prev) => ({ ...prev, displayName: trimmed }));
  }, []);

  const startTrial = useCallback(() => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    setUserData((prev) => ({
      ...prev,
      isTrialActive: true,
      activatedPlan: 'trial',
      subscriptionEndDate: trialEndDate.toISOString(),
    }));
  }, []);

  /**
   * Direct plan activation is intentionally not exposed to UI for free unlock.
   * Kept for internal/admin tooling after verified payment only.
   */
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
        endDate.setFullYear(2099);
        break;
      default:
        return;
    }

    setUserData((prev) => ({
      ...prev,
      isTrialActive: false,
      subscriptionEndDate: endDate.toISOString(),
      activatedPlan: planId,
    }));
  }, []);

  /** Async: codes are matched via SHA-256 hashes (no plaintext in bundle). */
  const activateWithCode = useCallback(async (code: string): Promise<boolean> => {
    const activationData = await resolveActivationCode(code);
    if (!activationData) return false;

    const endDate = new Date();
    if (activationData.plan === 'lifetime') {
      endDate.setFullYear(2099);
    } else {
      endDate.setDate(endDate.getDate() + activationData.days);
    }

    setUserData((prev) => ({
      ...prev,
      isTrialActive: false,
      subscriptionEndDate: endDate.toISOString(),
      activatedPlan: activationData.plan,
      // Store only a non-reversible marker, not the raw code
      activationCode: `***-${activationData.plan}`,
    }));

    return true;
  }, []);

  const checkSubscription = useCallback((): boolean => {
    if (!userData.subscriptionEndDate) return false;
    const endDate = new Date(userData.subscriptionEndDate);
    return endDate > new Date();
  }, [userData.subscriptionEndDate]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setUserData((prev) => ({ ...prev, theme }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setUserData((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setUserData((prev) => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setUserData((prev) => ({ ...prev, language }));
  }, []);

  const clearUserData = useCallback(() => {
    setUserData(defaultUserData);
    localStorage.removeItem('astronavigator_user');
    localStorage.removeItem('astronavigator_notes');
    localStorage.removeItem('astronavigator_streak_v1');
    localStorage.removeItem('astronavigator_coach_v1');
    localStorage.removeItem('astronavigator_tour_done_v2');
    localStorage.removeItem('astronavigator_notify_banner_dismissed');
  }, []);

  const logout = useCallback(() => {
    setUserData(defaultUserData);
    localStorage.removeItem('astronavigator_user');
    localStorage.removeItem('astronavigator_notes');
    localStorage.removeItem('astronavigator_streak_v1');
    localStorage.removeItem('astronavigator_coach_v1');
    localStorage.removeItem('astronavigator_tour_done_v2');
    localStorage.removeItem('astronavigator_notify_banner_dismissed');
    window.location.reload();
  }, []);

  return {
    userData,
    isLoaded,
    setBirthDate,
    setDisplayName,
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
    subscriptionPlans,
  };
}
