import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>('default');

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Уведомления не поддерживаются в этом браузере');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      
      if (permission === 'granted') {
        toast.success('Уведомления включены');
        return true;
      } else if (permission === 'denied') {
        toast.error('Уведомления заблокированы');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }, []);

  // Проверка разрешения
  const checkPermission = useCallback((): boolean => {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }, []);

  // Отправка уведомления
  const sendNotification = useCallback((data: NotificationData): boolean => {
    if (!checkPermission()) return false;

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
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
  }, [checkPermission]);

  // Отправка уведомления о важном дне
  const sendDayNotification = useCallback((dayNumber: number, _isFavorable?: boolean) => {
    const titles: Record<number, string> = {
      1: 'День новых начинаний',
      2: 'День гармонии и отношений',
      3: 'День расширения и роста',
      4: 'День перемен и креатива',
      5: 'День коммуникации',
      6: 'День любви и красоты',
      7: 'День духовности',
      8: 'День дисциплины и труда',
      9: 'День завершения',
    };

    const bodies: Record<number, string> = {
      1: 'Отличное время для старта новых проектов и важных решений!',
      2: 'Фокусируйтесь на отношениях и дипломатии сегодня.',
      3: 'Энергия роста и обучения — используйте её с умом!',
      4: 'Время креативных решений и нестандартного мышления.',
      5: 'Активное общение и переговоры принесут успех.',
      6: 'Наслаждайтесь жизнью и заботьтесь о близких.',
      7: 'День для медитации и внутреннего поиска.',
      8: 'Упорный труд сегодня принесёт отличные результаты.',
      9: 'Время подводить итоги и завершать начатое.',
    };

    return sendNotification({
      title: titles[dayNumber] || 'Ваш личный день',
      body: bodies[dayNumber] || 'Проверьте рекомендации в календаре',
      tag: `day-${dayNumber}`,
    });
  }, [sendNotification]);

  // Планирование ежедневного уведомления
  const scheduleDailyNotification = useCallback((hour: number = 8, minute: number = 0) => {
    if (!checkPermission()) return;

    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification({
        title: 'Доброе утро!',
        body: 'Проверьте рекомендации на сегодня в Астронавигаторе',
        tag: 'daily-reminder',
      });
      
      // Повторять каждый день
      setInterval(() => {
        sendNotification({
          title: 'Доброе утро!',
          body: 'Проверьте рекомендации на сегодня в Астронавигаторе',
          tag: 'daily-reminder',
        });
      }, 24 * 60 * 60 * 1000);
    }, delay);
  }, [checkPermission, sendNotification]);

  // Уведомление о пробном периоде
  const sendTrialNotification = useCallback((daysLeft: number) => {
    if (daysLeft <= 0) {
      return sendNotification({
        title: 'Пробный период закончился',
        body: 'Оформите подписку, чтобы продолжить пользоваться всеми функциями',
        tag: 'trial-ended',
      });
    }

    return sendNotification({
      title: `Пробный период: ${daysLeft} ${daysLeft === 1 ? 'день' : 'дня'}`,
      body: 'Не забудьте оформить подписку для продолжения',
      tag: 'trial-reminder',
    });
  }, [sendNotification]);

  // Инициализация при монтировании
  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  return {
    requestPermission,
    checkPermission,
    sendNotification,
    sendDayNotification,
    scheduleDailyNotification,
    sendTrialNotification,
    permission: permissionRef.current,
  };
}
