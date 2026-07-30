import { useState, useEffect, useCallback } from 'react';
import type { UserData, SubscriptionPlan, Language } from '@/types';
import { resolveActivationCode } from '@/utils/activation';
import {
  adminAccessFields,
  ensureAdminUserData,
  isAdminBirthDate,
} from '@/utils/admin';
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
    description: 'Сегодня, календарь и ближайшие дни',
  },
  {
    id: 'month',
    name: 'Месяц',
    price: 10,
    period: 'месяц',
    description: 'Pro: месяц и год · $10',
  },
  {
    id: 'year',
    name: 'Год',
    price: 50,
    period: 'год',
    description: 'Pro + год · $50',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Навсегда',
    price: 100,
    period: 'пожизненно',
    description: 'Все инструменты · $100',
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
      return ensureAdminUserData({ ...defaultUserData, ...parsed, birthDate });
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

  // Re-apply admin lifetime if unlock gate flips on (session secret) or data drifted
  useEffect(() => {
    if (!isLoaded) return;
    setUserData((prev) => ensureAdminUserData(prev));
  }, [isLoaded, userData.birthDate]);

  const setBirthDate = useCallback((date: string) => {
    const normalized = normalizeBirthDateString(date);
    if (!normalized) return;
    setUserData((prev) => {
      const next = { ...prev, birthDate: normalized };
      // Dev/admin birth date → full lifetime immediately (no trial paywall noise)
      if (isAdminBirthDate(normalized)) {
        return { ...next, ...adminAccessFields() };
      }
      return next;
    });
  }, []);

  const setDisplayName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40);
    setUserData((prev) => ({ ...prev, displayName: trimmed }));
  }, []);

  const startTrial = useCallback(() => {
    setUserData((prev) => {
      // Admin keeps full access instead of a 3-day trial
      if (isAdminBirthDate(prev.birthDate)) {
        return { ...prev, ...adminAccessFields() };
      }
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);
      return {
        ...prev,
        isTrialActive: true,
        activatedPlan: 'trial',
        subscriptionEndDate: trialEndDate.toISOString(),
      };
    });
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

  /**
   * Activate after server-verified pay claim.
   * Paid plans should pass entitlement from Worker /claim.
   */
  const activateWithPlan = useCallback(
    (planId: string, days: number, entitlement?: string): boolean => {
      if (planId !== 'month' && planId !== 'year' && planId !== 'lifetime' && planId !== 'test') {
        return false;
      }
      if (!Number.isFinite(days) || days <= 0) return false;

      // Paid plans (not test/trial) require server entitlement in production
      const paid = planId === 'month' || planId === 'year' || planId === 'lifetime';
      if (paid && import.meta.env.PROD && !entitlement) {
        console.warn('[access] refuse paid activate without entitlement');
        return false;
      }

      const endDate = new Date();
      if (planId === 'lifetime') {
        endDate.setFullYear(2099);
      } else {
        endDate.setDate(endDate.getDate() + days);
      }

      setUserData((prev) => ({
        ...prev,
        isTrialActive: false,
        subscriptionEndDate: endDate.toISOString(),
        activatedPlan: planId,
        activationCode: `***-${planId}`,
        entitlement: entitlement || prev.entitlement,
        entitlementVerifiedAt: entitlement
          ? new Date().toISOString()
          : prev.entitlementVerifiedAt,
      }));

      return true;
    },
    []
  );

  /** Async: legacy tokens — disabled in production (audit P0.3). */
  const activateWithCode = useCallback(
    async (code: string): Promise<boolean> => {
      const activationData = await resolveActivationCode(code);
      if (!activationData) return false;
      // Dev-only path: no server entitlement
      return activateWithPlan(activationData.plan, activationData.days, undefined);
    },
    [activateWithPlan]
  );

  const checkSubscription = useCallback((): boolean => {
    if (isAdminBirthDate(userData.birthDate)) return true;
    if (!userData.subscriptionEndDate) return false;
    const endDate = new Date(userData.subscriptionEndDate);
    if (endDate <= new Date()) return false;

    // Paid plans need entitlement in production (prevents DevTools free lifetime)
    const plan = (userData.activatedPlan || '').toLowerCase();
    if (
      plan === 'month' ||
      plan === 'year' ||
      plan === 'lifetime' ||
      plan === 'life'
    ) {
      if (import.meta.env.PROD) return Boolean(userData.entitlement);
      return true;
    }
    // trial
    return true;
  }, [
    userData.subscriptionEndDate,
    userData.birthDate,
    userData.activatedPlan,
    userData.entitlement,
  ]);

  /** Revalidate paid entitlement with pay Worker (audit P0.1 / P1.1). */
  const revalidateEntitlement = useCallback(async (): Promise<boolean> => {
    const token = userData.entitlement;
    if (!token) return false;
    try {
      const { verifyEntitlementToken } = await import('@/utils/payClaim');
      const v = await verifyEntitlementToken(token);
      if (!v) {
        setUserData((prev) => ({
          ...prev,
          activatedPlan: undefined,
          entitlement: undefined,
          entitlementVerifiedAt: undefined,
          subscriptionEndDate: null,
          isTrialActive: false,
        }));
        return false;
      }
      const endDate = new Date(v.exp * 1000);
      setUserData((prev) => ({
        ...prev,
        activatedPlan: v.plan,
        isTrialActive: false,
        subscriptionEndDate: endDate.toISOString(),
        entitlementVerifiedAt: new Date().toISOString(),
      }));
      return true;
    } catch {
      return false;
    }
  }, [userData.entitlement]);

  useEffect(() => {
    if (!userData.entitlement) return;
    // Soft revalidate at most once per session hour is enough; always on load
    void revalidateEntitlement();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when entitlement appears
  }, [userData.entitlement]);

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
    activateWithPlan,
    activateWithCode,
    revalidateEntitlement,
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
