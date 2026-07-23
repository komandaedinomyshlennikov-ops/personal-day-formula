import { registerSW } from 'virtual:pwa-register';

export type PwaUpdateHandler = (reload: () => void) => void;

/**
 * Register service worker for offline shell + update prompts.
 * Call once from app bootstrap.
 */
export function setupPwa(options?: {
  onNeedRefresh?: PwaUpdateHandler;
  onOfflineReady?: () => void;
  onRegistered?: (reg: ServiceWorkerRegistration | undefined) => void;
}): void {
  if (typeof window === 'undefined') return;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      options?.onNeedRefresh?.(() => {
        void updateSW(true);
      });
    },
    onOfflineReady() {
      options?.onOfflineReady?.();
    },
    onRegisteredSW(_url, reg) {
      options?.onRegistered?.(reg);
    },
  });
}

/** Ask active SW to show a local notification (works when SW is alive). */
export async function showSwNotification(payload: {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
}): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag ?? 'astronavigator',
      icon: payload.icon ?? './icon-192x192.png',
      badge: './icon-192x192.png',
    });
    return true;
  } catch {
    return false;
  }
}
