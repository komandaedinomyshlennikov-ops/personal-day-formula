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
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { LanguageSelector } from './LanguageSelector';
import { InstallPrompt } from './InstallPrompt';
import type { UserData } from '@/types';
import { parseDateOnly, toLocalDate } from '@/utils/date';

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
}: SettingsProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Handle language change with instant update
  const handleLanguageChange = (langCode: string) => {
    // Change i18n language immediately
    i18n.changeLanguage(langCode);
    // Update user data via callback
    onLanguageChange?.(langCode);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">{t('settings.title')}</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* User Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 flex items-center justify-center">
              <User size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{t('settings.profile')}</p>
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
            <button
              onClick={onExportPDF}
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
              onClick={onExportCSV}
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
