# Метрики главного экрана

## События

| Event | Когда |
|-------|--------|
| `home_view` | Открытие home (`#/calendar`) |
| `home_tab_change` | Неделя / Месяц (`tab`) |
| `home_upgrade_bar_click` | UpgradeBar / paywall CTA (`action`) |
| `home_month_lock_open` | Тап locked месяц/год (`kind`) |
| `home_calendar_scroll` | Сетка месяца в viewport (~35%) |
| `home_coach_chip` | Тап chip «Обсудить день» |
| `home_share_day` | Share с hero (`result`) |
| `home_pro_tools_toggle` | Accordion Pro tools (`open`) |
| `home_first_hint_dismiss` | Закрыли first-open hint |
| `home_today_open` | Открыли карточку «Сегодня» |

## Куда пишутся

1. **localStorage** `astronavigator_home_metrics_v1` — всегда (без cookies).  
   API: `getHomeMetrics()` / `recordHomeMetric()` / `resetHomeMetrics()` в `src/lib/homeMetrics.ts`.
2. **Google Analytics** через `trackEvent` — только после consent cookies + `VITE_GA_MEASUREMENT_ID`.

## UI

**Настройки → «Метрики главного экрана»** — только для **admin** (дата рождения `1991-03-07`, Андрей).  
Счётчики на устройстве + сброс.

## Admin unlock

Дата `1991-03-07` (Андрей) → tier `lifetime` без оплаты: Pro + Year, coach unlimited, export, metrics.  
См. `src/utils/admin.ts`.

**Когда работает:** по умолчанию **во всех билдах** (включая public Pages), если дата рождения = `1991-03-07`.

**Kill-switch:** `VITE_DISABLE_ADMIN_UNLOCK=true` — полностью отключает birth-date admin path.

При входе с admin-датой план материализуется как `lifetime` до 2099 (без trial-баннера).

## Цели (из ТЗ)

| Метрика | Цель |
|---------|------|
| Scroll depth до календаря (trial) | median ≤ 0.5 screen (proxy: tab Month + `home_calendar_scroll`) |
| Time to first action | p50 &lt; 8s (proxy: `home_today_open` / coach / tab после `home_view`) |
| Trial → subscription | +20% (proxy: `home_upgrade_bar_click`) |
| Day detail from home | +15% (proxy: `home_today_open`) |
