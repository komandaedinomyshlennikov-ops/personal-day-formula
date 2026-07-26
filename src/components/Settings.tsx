import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Contrast, 
  Download, 
  Trash2, 
  FileText, 
  Send, 
  Phone, 
  Mail,
  LogOut,
  User,
  Globe,
  Crown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { LanguageSelector } from './LanguageSelector';
import { InstallPrompt } from './InstallPrompt';
import { resetHomeTour } from '@/components/CoachMarks';
import type { UserData } from '@/types';
import { parseDateOnly, toLocalDate } from '@/utils/date';
import { getConsent, setConsent } from '@/lib/analytics';
import {
  getNotificationPrefs,
  setNotificationEnergyMode,
} from '@/hooks/useNotifications';
import { getHomeMetrics, resetHomeMetrics } from '@/lib/homeMetrics';
import { isAdminBirthDate } from '@/utils/admin';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface SettingsProps {
  userData: UserData;
  onBack: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  onToggleHighContrast: () => void;
  onToggleNotifications: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onClearData: () => void;
  onLogout: () => void;
  onLanguageChange?: (lang: string) => void;
  onDisplayNameChange?: (name: string) => void;
  exportUnlocked?: boolean;
  /** Year perk: energy-aware morning reminders */
  energyRemindersUnlocked?: boolean;
  onUpgrade?: () => void;
}

export function Settings({
  userData,
  onBack,
  onThemeChange,
  onToggleHighContrast,
  onToggleNotifications,
  onExportPDF,
  onExportCSV,
  onClearData,
  onLogout,
  onLanguageChange,
  onDisplayNameChange,
  exportUnlocked = true,
  energyRemindersUnlocked = false,
  onUpgrade,
}: SettingsProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [consent, setConsentState] = useState(getConsent);
  const [nameDraft, setNameDraft] = useState(userData.displayName || '');
  const [energyMode, setEnergyMode] = useState(() =>
    Boolean(getNotificationPrefs().energyMode)
  );
  const [metricsTick, setMetricsTick] = useState(0);
  const isAdmin = isAdminBirthDate(userData.birthDate);
  const homeMetrics = useMemo(() => {
    void metricsTick;
    return getHomeMetrics();
  }, [metricsTick]);
  const currentLang = i18n.language;

  const handleLanguageChange = (langCode: string) => {
    onLanguageChange?.(langCode);
  };

  return (
    <div className="app-shell min-h-screen pb-10">
      <header className="app-header">
        <button type="button" onClick={onBack} className="icon-btn" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-white">{t('settings.title')}</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* User Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 space-y-3"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center">
              <User size={24} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">
                {userData.displayName || t('settings.profile')}
              </p>
              <p className="text-gray-400 text-sm">
                {userData.birthDate
                  ? (() => {
                      const parsed = parseDateOnly(userData.birthDate);
                      return parsed
                        ? toLocalDate(parsed).toLocaleDateString(
                            currentLang === 'ru' ? 'ru-RU' : 'en-US'
                          )
                        : userData.birthDate;
                    })()
                  : t('errors.invalidDate')}
              </p>
            </div>
          </div>
          {onDisplayNameChange && (
            <div>
              <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                {t('settings.displayName')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value.slice(0, 40))}
                  placeholder={t('onboarding.namePlaceholder')}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-amber-400/50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => onDisplayNameChange(nameDraft)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-400/20 text-amber-100 text-sm font-medium border border-amber-400/30 shrink-0"
                >
                  {t('actions.save')}
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Language Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Globe size={18} className="text-amber-400" />
              {t('settings.language')}
            </h3>
          </div>

          <div className="p-4">
            <LanguageSelector 
              variant="buttons" 
              showLabel={false} 
              onChange={handleLanguageChange}
            />
          </div>
        </motion.section>

        {/* Install App Section */}
        <InstallPrompt />

        {/* Replay home tour */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card overflow-hidden"
        >
          <button
            type="button"
            onClick={() => {
              resetHomeTour();
              toast.success(t('tour.replayToast'));
              navigate('/calendar');
            }}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/25 flex items-center justify-center shrink-0">
              <Globe size={18} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm">{t('tour.replayTitle')}</p>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">
                {t('tour.replayDesc')}
              </p>
            </div>
          </button>
        </motion.section>

        {/* Theme Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Monitor size={18} className="text-amber-400" />
              {t('settings.theme')}
            </h3>
          </div>

          <div className="p-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => onThemeChange('light')}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-2 transition-all
                ${userData.theme === 'light' 
                  ? 'bg-amber-400/20 border border-amber-400' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Sun size={24} className={userData.theme === 'light' ? 'text-amber-400' : 'text-gray-400'} />
              <span className={`text-xs ${userData.theme === 'light' ? 'text-white' : 'text-gray-400'}`}>
                {t('settings.lightTheme')}
              </span>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-2 transition-all
                ${userData.theme === 'dark' 
                  ? 'bg-amber-400/20 border border-amber-400' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Moon size={24} className={userData.theme === 'dark' ? 'text-amber-400' : 'text-gray-400'} />
              <span className={`text-xs ${userData.theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                {t('settings.darkTheme')}
              </span>
            </button>

            <button
              onClick={() => onThemeChange('auto')}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-2 transition-all
                ${userData.theme === 'auto' 
                  ? 'bg-amber-400/20 border border-amber-400' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Monitor size={24} className={userData.theme === 'auto' ? 'text-amber-400' : 'text-gray-400'} />
              <span className={`text-xs ${userData.theme === 'auto' ? 'text-white' : 'text-gray-400'}`}>
                {t('settings.autoTheme')}
              </span>
            </button>
          </div>
        </motion.section>

        {/* Accessibility Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Contrast size={18} className="text-amber-400" />
              {t('settings.accessibility')}
            </h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Contrast size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{t('settings.highContrast')}</p>
                  <p className="text-gray-400 text-xs">{t('settings.highContrastDesc')}</p>
                </div>
              </div>
              <Switch
                checked={userData.highContrast}
                onCheckedChange={onToggleHighContrast}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bell size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{t('settings.notifications')}</p>
                  <p className="text-gray-400 text-xs">{t('settings.notificationsDesc')}</p>
                </div>
              </div>
              <Switch
                checked={userData.notificationsEnabled}
                onCheckedChange={onToggleNotifications}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-medium text-sm flex items-center gap-1.5">
                  {t('settings.energyReminders')}
                  {!energyRemindersUnlocked && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-200 border border-violet-400/30">
                      Year
                    </span>
                  )}
                </p>
                <p className="text-gray-400 text-xs">
                  {t('settings.energyRemindersDesc')}
                </p>
              </div>
              <Switch
                checked={energyRemindersUnlocked && energyMode}
                onCheckedChange={(v) => {
                  if (!energyRemindersUnlocked) {
                    onUpgrade?.();
                    return;
                  }
                  setEnergyMode(v);
                  setNotificationEnergyMode(v);
                  toast.success(
                    v
                      ? t('settings.energyRemindersOn')
                      : t('settings.energyRemindersOff')
                  );
                }}
              />
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-amber-300/90 text-xs font-medium mb-1">
                {t('notifications.disclaimerTitle')}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                {t('notifications.disclaimerBody')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Export Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Download size={18} className="text-amber-400" />
              {t('settings.export')}
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {!exportUnlocked && onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-400/30 bg-amber-400/10 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Crown size={18} className="text-amber-300" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-amber-100 font-medium text-sm">{t('premium.lockedExport')}</p>
                  <p className="text-[var(--text-muted)] text-xs">{t('premium.cta')}</p>
                </div>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!exportUnlocked) {
                  onUpgrade?.();
                  return;
                }
                onExportPDF();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <FileText size={18} className="text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{t('settings.exportPDF')}</p>
                <p className="text-gray-400 text-xs">{t('settings.exportPDFDesc')}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!exportUnlocked) {
                  onUpgrade?.();
                  return;
                }
                onExportCSV();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Download size={18} className="text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{t('settings.exportCSV')}</p>
                <p className="text-gray-400 text-xs">{t('settings.exportCSVDesc')}</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Admin badge + full unlock note */}
        {isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="glass-card overflow-hidden border border-emerald-400/30"
          >
            <div className="p-4">
              <p className="text-emerald-200 font-semibold text-sm">
                {t('settings.adminBadge')}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                {t('settings.adminHint')}
              </p>
            </div>
          </motion.section>
        )}

        {/* Home metrics — admin / developer only */}
        {isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">
                {t('settings.homeMetricsTitle')}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                {t('settings.homeMetricsHint')}
              </p>
            </div>
            <div className="p-4 space-y-2 text-xs text-[var(--text-secondary)]">
              {(
                [
                  ['home_view', t('settings.metricHomeView')],
                  ['home_today_open', t('settings.metricToday')],
                  ['home_tab_change', t('settings.metricTabs')],
                  ['home_coach_chip', t('settings.metricCoach')],
                  ['home_upgrade_bar_click', t('settings.metricUpgrade')],
                  ['home_month_lock_open', t('settings.metricLock')],
                  ['home_share_day', t('settings.metricShare')],
                  ['home_calendar_scroll', t('settings.metricCalendar')],
                  ['home_pro_tools_toggle', t('settings.metricProTools')],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span>{label}</span>
                  <span className="text-white font-semibold tabular-nums">
                    {homeMetrics.counts[key] || 0}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  resetHomeMetrics();
                  setMetricsTick((n) => n + 1);
                  toast.success(t('settings.homeMetricsReset'));
                }}
                className="mt-2 w-full py-2 rounded-xl border border-white/10 text-[11px] text-[var(--text-muted)]"
              >
                {t('settings.homeMetricsResetBtn')}
              </button>
            </div>
          </motion.section>
        )}

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Send size={18} className="text-amber-400" />
              {t('settings.contacts')}
            </h3>
          </div>

          <div className="p-4 space-y-3">
            <a 
              href="https://t.me/tatianageniush"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Send size={18} className="text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">@tatianageniush</p>
                <p className="text-gray-400 text-xs">{t('settings.telegram')}</p>
              </div>
            </a>

            <a 
              href="https://www.instagram.com/geniush.tatiana"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-pink-400 text-lg">📷</span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">@geniush.tatiana</p>
                <p className="text-gray-400 text-xs">{t('settings.instagram')}</p>
              </div>
            </a>

            <a 
              href="tel:+375297801742"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Phone size={18} className="text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">+375 29 780 1742</p>
                <p className="text-gray-400 text-xs">{t('settings.phone')}</p>
              </div>
            </a>

            <a 
              href="mailto:calibrigenus@gmail.com"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Mail size={18} className="text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">calibrigenus@gmail.com</p>
                <p className="text-gray-400 text-xs">{t('settings.email')}</p>
              </div>
            </a>
          </div>
        </motion.section>

        {/* Legal & privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FileText size={18} className="text-amber-400" />
              {t('legal.section', { defaultValue: 'Legal' })}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <Link
              to="/privacy"
              className="block w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              {t('legal.privacy', { defaultValue: 'Privacy Policy' })}
            </Link>
            <Link
              to="/terms"
              className="block w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              {t('legal.terms', { defaultValue: 'Terms of use' })}
            </Link>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-white text-sm font-medium">
                  {t('legal.analytics', { defaultValue: 'Analytics cookies' })}
                </p>
                <p className="text-gray-500 text-xs">
                  {consent === 'accepted'
                    ? t('legal.accept', { defaultValue: 'Accepted' })
                    : consent === 'declined'
                      ? t('legal.decline', { defaultValue: 'Essential only' })
                      : t('legal.cookieTitle', { defaultValue: 'Not set' })}
                </p>
              </div>
              <Switch
                checked={consent === 'accepted'}
                onCheckedChange={(on) => {
                  setConsent(on ? 'accepted' : 'declined');
                  setConsentState(on ? 'accepted' : 'declined');
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* Logout Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <LogOut size={18} className="text-amber-400" />
              {t('settings.account')}
            </h3>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/30"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut size={18} className="text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-red-400 font-medium">{t('settings.logout')}</p>
                <p className="text-gray-400 text-xs">{t('settings.logoutDesc')}</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Data Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              {t('settings.deleteData')}
            </h3>
          </div>

          <div className="p-4">
            <button
              onClick={onClearData}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/30"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-red-400 font-medium">{t('settings.deleteData')}</p>
                <p className="text-gray-400 text-xs">{t('settings.deleteDataDesc')}</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-4"
        >
          <p className="text-gray-500 text-sm">{t('settings.version')}</p>
          <p className="text-gray-600 text-xs mt-1">© 2026 Tatiana Geniush</p>
        </motion.div>
      </div>
    </div>
  );
}
