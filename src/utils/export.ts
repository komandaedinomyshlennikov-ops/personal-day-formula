import {
  calculatePersonalMonth,
  calculatePersonalYear,
  generateMonthData,
  getEnergyInfo,
  getMonthName,
} from '@/utils/numerology';
import { fromLocalDate, parseDateOnly, toLocalDate } from '@/utils/date';
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from '@/config/site';

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Export current month (and optional range) as CSV with real day numbers. */
export function buildMonthCsv(
  birthDate: string,
  year: number,
  month: number,
  locale: string = 'ru-RU'
): string {
  const days = generateMonthData(birthDate, year, month);
  const personalYear = calculatePersonalYear(birthDate, year);
  const personalMonth = calculatePersonalMonth(birthDate, year, month);
  const tipMap: Record<number, string> = {
    1: locale.startsWith('ru') ? 'Старт, инициатива' : 'Start, initiative',
    2: locale.startsWith('ru') ? 'Диалог, партнёрство' : 'Dialogue, partnership',
    3: locale.startsWith('ru') ? 'Творчество, общение' : 'Create, communicate',
    4: locale.startsWith('ru') ? 'Порядок, завершение' : 'Systems, finish work',
    5: locale.startsWith('ru') ? 'Движение, эксперимент' : 'Move, experiment',
    6: locale.startsWith('ru') ? 'Забота, дом' : 'Care, home',
    7: locale.startsWith('ru') ? 'Анализ, пауза' : 'Study, pause',
    8: locale.startsWith('ru') ? 'Деньги, осторожно' : 'Money, carefully',
    9: locale.startsWith('ru') ? 'Закрытие циклов' : 'Close cycles',
  };

  const meta = [
    `# ${SITE_NAME}`,
    `# personal_year=${personalYear}`,
    `# personal_month=${personalMonth}`,
    `# period=${year}-${String(month).padStart(2, '0')}`,
  ].join('\n');

  const header = [
    'date',
    'weekday',
    'personal_day',
    'universal_day',
    'favorability',
    'personal_planet',
    'action_tip',
    'is_zero_day',
  ].join(',');

  const rows = days.map((day) => {
    const parts = fromLocalDate(day.date);
    const energy = getEnergyInfo(day.personalNumber);
    const favorability = day.isFavorable
      ? 'favorable'
      : day.isUnfavorable
        ? 'challenging'
        : 'neutral';
    const isZero = parts.day === 10 || parts.day === 20 || parts.day === 30;
    const weekday = day.date.toLocaleDateString(locale, { weekday: 'long' });

    return [
      escapeCsv(
        `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
      ),
      escapeCsv(weekday),
      day.personalNumber,
      day.generalNumber,
      favorability,
      escapeCsv(energy.planet),
      escapeCsv(tipMap[day.personalNumber] || ''),
      isZero ? 'yes' : 'no',
    ].join(',');
  });

  return '\uFEFF' + [meta, header, ...rows].join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PdfExportOptions {
  birthDate: string;
  year: number;
  month: number;
  locale?: string;
}

/** Build HTML snapshot for PDF (current month summary + key metrics). */
export function buildPdfHtml({
  birthDate,
  year,
  month,
  locale = 'ru-RU',
}: PdfExportOptions): string {
  const parsed = parseDateOnly(birthDate);
  if (!parsed) {
    throw new Error('Invalid birth date');
  }

  const personalYear = calculatePersonalYear(birthDate, year);
  const personalMonth = calculatePersonalMonth(birthDate, year, month);
  const monthData = generateMonthData(birthDate, year, month);
  const monthLabel = getMonthName(month);
  const birthLocal = toLocalDate(parsed);
  const birthLabel = birthLocal.toLocaleDateString(locale);
  const generatedAt = new Date().toLocaleDateString(locale);

  const favorable = monthData.filter((d) => d.isFavorable).length;
  const challenging = monthData.filter((d) => d.isUnfavorable).length;
  const neutral = monthData.length - favorable - challenging;

  const yearEnergy = getEnergyInfo(personalYear);
  const monthEnergy = getEnergyInfo(personalMonth);

  // Sample of first 10 days for the report body
  const dayRows = monthData
    .slice(0, 15)
    .map((d) => {
      const p = fromLocalDate(d.date);
      const e = getEnergyInfo(d.personalNumber);
      const mark = d.isFavorable ? '●' : d.isUnfavorable ? '▲' : '○';
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">${p.day}</td>
        <td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">${d.personalNumber} ${e.icon}</td>
        <td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">${d.generalNumber}</td>
        <td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);color:${e.color}">${e.planet}</td>
        <td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">${mark}</td>
      </tr>`;
    })
    .join('');

  return `
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="font-size:28px;margin:0 0 8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        ${SITE_NAME}
      </h1>
      <p style="color:#9ca3af;font-size:14px;margin:0;">Личный календарь · ${monthLabel} ${year}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:16px;border:1px solid rgba(255,255,255,0.1);">
        <p style="color:#9ca3af;font-size:11px;margin:0 0 6px;">Дата рождения</p>
        <p style="font-size:18px;font-weight:700;margin:0;">${birthLabel}</p>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:16px;border:1px solid rgba(255,255,255,0.1);">
        <p style="color:#9ca3af;font-size:11px;margin:0 0 6px;">Отчёт создан</p>
        <p style="font-size:18px;font-weight:700;margin:0;">${generatedAt}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:rgba(139,92,246,0.15);border-radius:16px;padding:16px;border:1px solid rgba(139,92,246,0.3);">
        <p style="color:#c4b5fd;font-size:11px;margin:0 0 6px;">Личный год ${year}</p>
        <p style="font-size:24px;font-weight:700;margin:0;">${personalYear} ${yearEnergy.icon} ${yearEnergy.planet}</p>
      </div>
      <div style="background:rgba(236,72,153,0.12);border-radius:16px;padding:16px;border:1px solid rgba(236,72,153,0.3);">
        <p style="color:#f9a8d4;font-size:11px;margin:0 0 6px;">Личный месяц</p>
        <p style="font-size:24px;font-weight:700;margin:0;">${personalMonth} ${monthEnergy.icon} ${monthEnergy.planet}</p>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:16px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1);">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 10px;">Сводка месяца</p>
      <p style="margin:0;font-size:14px;line-height:1.6;">
        Благоприятных: <b style="color:#4ade80">${favorable}</b> ·
        Нейтральных: <b style="color:#fbbf24">${neutral}</b> ·
        Сложных: <b style="color:#f87171">${challenging}</b>
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.03);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,0.08);">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 10px;">Дни месяца (фрагмент)</p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;color:#e5e7eb;">
        <thead>
          <tr style="color:#9ca3af;text-align:left;">
            <th style="padding:6px 8px;">День</th>
            <th style="padding:6px 8px;">Личный</th>
            <th style="padding:6px 8px;">Общий</th>
            <th style="padding:6px 8px;">Планета</th>
            <th style="padding:6px 8px;">Тип</th>
          </tr>
        </thead>
        <tbody>${dayRows}</tbody>
      </table>
      ${monthData.length > 15 ? `<p style="color:#6b7280;font-size:11px;margin:10px 0 0;">… и ещё ${monthData.length - 15} дней (полный список — в CSV)</p>` : ''}
    </div>

    <div style="margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
      <p style="color:#6b7280;font-size:12px;margin:0;">${SITE_URL}</p>
      <p style="color:#6b7280;font-size:11px;margin:4px 0 0;">© ${new Date().getFullYear()} ${SITE_AUTHOR}</p>
    </div>
  `;
}
