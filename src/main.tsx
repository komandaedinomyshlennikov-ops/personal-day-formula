import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/i18n'
import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { setupPwa } from '@/pwa'
import i18n from '@/i18n'
import { toast } from 'sonner'

setupPwa({
  onOfflineReady: () => {
    toast.success(i18n.t('notifications.offlineReady', {
      defaultValue: 'App ready to work offline',
    }))
  },
  onNeedRefresh: (reload) => {
    toast(i18n.t('notifications.updateAvailable', {
      defaultValue: 'Update available — reload to apply',
    }), {
      action: {
        label: i18n.t('actions.refresh', { defaultValue: 'Reload' }),
        onClick: () => reload(),
      },
      duration: 15000,
    })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
