import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { showSwNotification } from '@/pwa';
import { calculatePersonalDay, getEnergyInfo } from '@/utils/numerology';
import { getDayActionLine } from '@/utils/actionableDay';
import { normalizeBirthDateString } from '@/utils/date';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

const LAST_DAILY_KEY = 'astronavigator_last_daily_notification';
const PREFS_KEY = 'astronavigator_notification_prefs';

interface NotificationPrefs {
  hour: number;
  minute: number;
  enabled: boolean;
  /** Year perk: adapt message to favorable / hard days */
  energyMode?: boolean;
}

function readPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return {
        hour: 8,
        minute: 0,
        enabled: false,
        energyMode: false,
        ...JSON.parse(raw),
      };
    }
  } catch {
    /* ignore */
  }
  return { hour: 8, minute: 0, enabled: false, energyMode: false };
}

export function getNotificationPrefs(): NotificationPrefs {
  return readPrefs();
}

export function setNotificationEnergyMode(energyMode: boolean): void {
  const prefs = readPrefs();
  writePrefs({ ...prefs, energyMode });
}

function writePrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function readUserProfile(): { birthDate: string | null; displayName?: string } {
  try {
    const raw = localStorage.getItem('astronavigator_user');
    if (!raw) return { birthDate: null };
    const parsed = JSON.parse(raw) as { birthDate?: string; displayName?: string };
    return {
      birthDate: parsed.birthDate
        ? normalizeBirthDateString(parsed.birthDate)
        : null,
      displayName: parsed.displayName?.trim() || undefined,
    };
  } catch {
    return { birthDate: null };
  }
}

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>('default');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const checkPermission = useCallback((): boolean => {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }, []);

  const sendNotification = useCallback(
    async (data: NotificationData): Promise<boolean> => {
      if (!checkPermission()) return false;

      const viaSw = await showSwNotification({
        title: data.title,
        body: data.body,
        tag: data.tag,
        icon: data.icon || './icon-192x192.png',
      });
      if (viaSw) return true;

      try {
        const notification = new Notification(data.title, {
          body: data.body,
          icon: data.icon || './icon-192x192.png',
          tag: data.tag || 'astronavigator',
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        return true;
      } catch (error) {
        console.error('Notification error:', error);
        return false;
      }
    },
    [checkPermission]
  );

  /** Build morning payload: same actionable line as home "Today" strip */
  const buildMorningPayload = useCallback((): NotificationData => {
    const { birthDate: birth, displayName } = readUserProfile();
    const prefs = readPrefs();
    if (birth) {
      try {
        const now = new Date();
        const personal = calculatePersonalDay(birth, now);
        const energy = getEnergyInfo(personal, t);
        const { action, tone } = getDayActionLine(personal, t);
        const title = displayName
          ? t('notifications.dailyTitleNamed', {
              name: displayName,
              number: personal,
              planet: energy.planet,
              defaultValue: `${displayName}, today ${personal} · ${energy.planet}`,
            })
          : t('notifications.dailyTitle', {
              number: personal,
              planet: energy.planet,
            });

        let body = action;
        if (prefs.energyMode) {
          if (tone === 'favorable') {
            body = t('notifications.energyFavorable', {
              action,
              defaultValue: `Green day · ${action}`,
            });
          } else if (tone === 'challenging') {
            body = t('notifications.energyHard', {
              action,
              defaultValue: `Soft day · ${action} Protect energy.`,
            });
          } else {
            body = t('notifications.energyNeutral', {
              action,
              defaultValue: `Steady day · ${action}`,
            });
          }
        }

        return {
          title,
          body,
          tag: 'daily-reminder',
        };
      } catch {
        /* fall through */
      }
    }
    return {
      title: t('notifications.dailyReminder'),
      body: t('notifications.dailyReminderBody'),
      tag: 'daily-reminder',
    };
  }, [t]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error(t('notifications.notSupported'));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;

      if (permission === 'granted') {
        toast.success(t('notifications.permissionGranted'), {
          description: t('notifications.enableHint'),
        });
        return true;
      }
      if (permission === 'denied') {
        toast.error(t('notifications.permissionDenied'));
        return false;
      }
      return false;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }, [t]);

  const sendDayNotification = useCallback(
    async (dayNumber: number) => {
      const energy = getEnergyInfo(dayNumber, t);
      const { action } = getDayActionLine(dayNumber, t);
      return sendNotification({
        title: t('notifications.dailyTitle', {
          number: dayNumber,
          planet: energy.planet,
        }),
        body: action,
        tag: `day-${dayNumber}`,
      });
    },
    [sendNotification, t]
  );

  const markDailySent = () => {
    const now = new Date();
    localStorage.setItem(
      LAST_DAILY_KEY,
      `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    );
  };

  /** Fire once per calendar day when app is opened after preferred time. */
  const maybeSendDailyOnOpen = useCallback(async () => {
    if (!checkPermission()) return;

    const prefs = readPrefs();
    if (!prefs.enabled) return;

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (localStorage.getItem(LAST_DAILY_KEY) === todayKey) return;

    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const target = prefs.hour * 60 + prefs.minute;
    if (minutesNow < target) return;

    const ok = await sendNotification(buildMorningPayload());
    if (ok) markDailySent();
  }, [checkPermission, sendNotification, buildMorningPayload]);

  /**
   * Schedule next local reminder while this tab/PWA session is alive.
   * Body = same actionable tip as home.
   */
  const scheduleDailyNotification = useCallback(
    (hour: number = 8, minute: number = 0) => {
      writePrefs({ hour, minute, enabled: true });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (!checkPermission()) return;

      const now = new Date();
      const scheduled = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0,
        0
      );
      if (scheduled.getTime() <= now.getTime()) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      const delay = scheduled.getTime() - now.getTime();
      timerRef.current = setTimeout(() => {
        void sendNotification(buildMorningPayload()).then((ok) => {
          if (ok) markDailySent();
          scheduleDailyNotification(hour, minute);
        });
      }, delay);
    },
    [checkPermission, sendNotification, buildMorningPayload]
  );

  const disableDailyNotifications = useCallback(() => {
    const prefs = readPrefs();
    writePrefs({ ...prefs, enabled: false });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const sendTrialNotification = useCallback(
    async (daysLeft: number) => {
      if (daysLeft <= 0) {
        return sendNotification({
          title: t('notifications.trialEnded'),
          body: t('notifications.subscriptionEnded'),
          tag: 'trial-ended',
        });
      }

      return sendNotification({
        title: `${t('subscription.plans.trial.name')}: ${daysLeft}`,
        body: t('notifications.subscriptionEnded'),
        tag: 'trial-reminder',
      });
    },
    [sendNotification, t]
  );

  useEffect(() => {
    void i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void maybeSendDailyOnOpen();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    void maybeSendDailyOnOpen();
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [maybeSendDailyOnOpen]);

  return {
    requestPermission,
    checkPermission,
    sendNotification,
    sendDayNotification,
    scheduleDailyNotification,
    disableDailyNotifications,
    sendTrialNotification,
    maybeSendDailyOnOpen,
    permission: permissionRef.current,
  };
}
