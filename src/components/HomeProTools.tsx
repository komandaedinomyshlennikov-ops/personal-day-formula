import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Sparkles } from 'lucide-react';
import { MonthProPanel } from '@/components/MonthProPanel';
import { YearPerksPanel } from '@/components/YearPerksPanel';
import { PremiumTeaser } from '@/components/PremiumTeaser';
import type { DayInfo } from '@/types';
import { recordHomeMetric } from '@/lib/homeMetrics';

interface HomeProToolsProps {
  birthDate: string;
  showMonthPro: boolean;
  showYearPerks: boolean;
  /** Month-paid but not year — soft year upsell */
  showYearUpsell: boolean;
  onSelectDay: (day: DayInfo) => void;
  onOpenMonth: (n: number) => void;
  onOpenYear: (n: number) => void;
  onNotes?: () => void;
  onExport?: () => void;
  onUpgrade: () => void;
}

const STORAGE_KEY = 'astronavigator_pro_tools_open_v1';

/**
 * P1.3: Pro tools collapsed by default so first paint stays short.
 */
export function HomeProTools({
  birthDate,
  showMonthPro,
  showYearPerks,
  showYearUpsell,
  onSelectDay,
  onOpenMonth,
  onOpenYear,
  onNotes,
  onExport,
  onUpgrade,
}: HomeProToolsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!showMonthPro && !showYearPerks && !showYearUpsell) return null;

  const badge =
    (showMonthPro ? 1 : 0) + (showYearPerks ? 1 : 0) + (showYearUpsell ? 1 : 0);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      recordHomeMetric('home_pro_tools_toggle', { open: next });
      return next;
    });
  };

  return (
    <section className="pro-tools">
      <button type="button" onClick={toggle} className="pro-tools__toggle" aria-expanded={open}>
        <Sparkles size={14} className="text-amber-300 shrink-0" />
        <span className="flex-1 text-left font-semibold text-[12px] text-white">
          {t('premium.proToolsTitle')}
        </span>
        <span className="pro-tools__badge">{badge}</span>
        <ChevronDown
          size={16}
          className={`text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="pro-tools__body space-y-2.5 pt-2">
          {showMonthPro && (
            <MonthProPanel
              birthDate={birthDate}
              onSelectDay={onSelectDay}
              onOpenMonth={onOpenMonth}
              onNotes={onNotes}
              onExport={onExport}
            />
          )}
          {showYearPerks && (
            <YearPerksPanel
              birthDate={birthDate}
              onSelectDay={onSelectDay}
              onOpenYear={onOpenYear}
            />
          )}
          {showYearUpsell && !showYearPerks && (
            <PremiumTeaser
              variant="inline"
              yearOnly
              title={t('premium.yearUpsellTitle')}
              body={t('premium.yearUpsellBody')}
              onUpgrade={onUpgrade}
            />
          )}
        </div>
      )}
    </section>
  );
}
