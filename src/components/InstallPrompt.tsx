import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const { i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    // Check iOS
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIOS(iOS);

    checkStandalone();

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage to not show again for 7 days
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('installPromptDismissed', dismissUntil.toString());
  };

  // Check if was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissUntil = parseInt(dismissed, 10);
      if (Date.now() < dismissUntil) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('installPromptDismissed');
      }
    }
  }, []);

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed) return null;

  // Don't show on desktop if not Chrome/Edge
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile && !deferredPrompt) return null;

  const isRussian = i18n.language === 'ru';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden relative"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors z-10"
      >
        <X size={16} />
      </button>

      <div className="p-4 border-b border-white/5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Download size={18} className="text-amber-400" />
          {isRussian ? 'На главный экран' : 'Add to Home Screen'}
        </h3>
      </div>

      <div className="p-4">
        {/* Preview how the icon + label will look */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-black/25 border border-white/8">
          <img
            src={`${import.meta.env.BASE_URL}icon-192x192.png`}
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 rounded-[14px] shadow-lg shadow-violet-500/20 object-cover"
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm">АстроНав</p>
            <p className="text-[11px] text-[var(--text-muted)] leading-snug mt-0.5">
              {isRussian
                ? 'Подпись на экране телефона · ваш личный день'
                : 'Home screen label · your personal day'}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              {isRussian 
                ? 'Для установки на iPhone/iPad:' 
                : 'To install on iPhone/iPad:'}
            </p>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="bg-amber-400/20 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>
                  {isRussian 
                    ? 'Нажмите кнопку ' 
                    : 'Tap the '}
                  <Share size={14} className="inline mx-1 text-blue-400" />
                  {isRussian 
                    ? '«Поделиться» в Safari' 
                    : 'button in Safari'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-400/20 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>
                  {isRussian 
                    ? 'Прокрутите вниз и нажмите ' 
                    : 'Scroll down and tap '}
                  <strong className="text-white">{isRussian ? '«На экран Домой»' : '"Add to Home Screen"'}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-400/20 text-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span>
                  {isRussian 
                    ? 'Нажмите ' 
                    : 'Tap '}
                  <strong className="text-white">{isRussian ? '«Добавить»' : '"Add"'}</strong>
                  {isRussian ? ' в правом верхнем углу' : ' in the top right corner'}
                </span>
              </li>
            </ol>
            <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg mt-2">
              <PlusSquare size={24} className="text-gray-400" />
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              {isRussian 
                ? 'Установите приложение для быстрого доступа с главного экрана' 
                : 'Install this app for quick access from your home screen'}
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-400 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {isRussian ? 'Добавить на главный экран' : 'Add to Home Screen'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              {isRussian 
                ? 'Установите приложение для быстрого доступа' 
                : 'Install this app for quick access from your home screen'}
            </p>
            <p className="text-gray-400 text-xs">
              {isRussian 
                ? 'Откройте меню браузера и выберите «Установить приложение»' 
                : 'Open browser menu and select "Install app"'}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
