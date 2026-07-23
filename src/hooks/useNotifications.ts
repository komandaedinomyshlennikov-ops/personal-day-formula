import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { showSwNotification } from '@/pwa';

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
}

function readPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { hour: 8, minute: 0, enabled: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { hour: 8, minute: 0, enabled: false };
}

function writePrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
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

      // Prefer Service Worker notification (better on mobile / PWA)
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

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error(t('notifications.notSupported'));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;

      if (permission === 'granted') {
        toast.success(t('notifications.permissionGranted'));
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
    async (dayNumber: number, _isFavorable?: boolean) => {
      const titles: Record<number, string> = {
        1: t('energies.1.name', { defaultValue: '1' }),
        2: t('energies.2.name', { defaultValue: '2' }),
        3: t('energies.3.name', { defaultValue: '3' }),
        4: t('energies.4.name', { defaultValue: '4' }),
        5: t('energies.5.name', { defaultValue: '5' }),
        6: t('energies.6.name', { defaultValue: '6' }),
        7: t('energies.7.name', { defaultValue: '7' }),
        8: t('energies.8.name', { defaultValue: '8' }),
        9: t('energies.9.name', { defaultValue: '9' }),
      };

      return sendNotification({
        title: titles[dayNumber] || t('notifications.dailyReminder', { defaultValue: 'Your personal day' }),
        body:
          t(`energies.${dayNumber}.description`, {
            defaultValue: t('notifications.dailyReminderBody', {
              defaultValue: 'Check today recommendations in AstroNavigator',
            }),
          }) || '',
        tag: `day-${dayNumber}`,
      });
    },
    [sendNotification, t]
  );

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

    const ok = await sendNotification({
      title: t('notifications.dailyReminder', { defaultValue: 'Good morning!' }),
      body: t('notifications.dailyReminderBody', {
        defaultValue: 'Check today recommendations in AstroNavigator',
      }),
      tag: 'daily-reminder',
    });
    if (ok) localStorage.setItem(LAST_DAILY_KEY, todayKey);
  }, [checkPermission, sendNotification, t]);

  /**
   * Schedule next local reminder while this tab/PWA session is alive.
   * Honest model: no server push — documented in Settings disclaimer.
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
        void sendNotification({
          title: t('notifications.dailyReminder', { defaultValue: 'Good morning!' }),
          body: t('notifications.dailyReminderBody', {
            defaultValue: 'Check today recommendations in AstroNavigator',
          }),
          tag: 'daily-reminder',
        }).then((ok) => {
          if (ok) {
            const d = new Date();
            localStorage.setItem(
              LAST_DAILY_KEY,
              `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
            );
          }
          // Reschedule for next day while session lives
          scheduleDailyNotification(hour, minute);
        });
      }, delay);
    },
    [checkPermission, sendNotification, t]
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
          title: t('notifications.trialEnded', { defaultValue: 'Trial ended' }),
          body: t('notifications.subscriptionEnded', {
            defaultValue: 'Subscribe to keep full access',
          }),
          tag: 'trial-ended',
        });
      }

      return sendNotification({
        title: `${t('subscription.plans.trial.name', { defaultValue: 'Trial' })}: ${daysLeft}`,
        body: t('notifications.subscriptionEnded', {
          defaultValue: 'Subscribe to continue',
        }),
        tag: 'trial-reminder',
      });
    },
    [sendNotification, t]
  );

  // On language change, keep using translated strings next send
  useEffect(() => {
    void i18n.language;
  }, [i18n.language]);

  // When app becomes visible, try once-per-day reminder
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
