# ТЗ: улучшение главного экрана (Home / Calendar)

**Продукт:** Астронавигатор (PWA)  
**Экран:** `#/calendar` — домашний экран после онбординга  
**Дата:** 2026-07-25  
**Цель документа:** зафиксировать аудит (дизайн · эргономика · информативность · продаваемость) и дать приоритизированное ТЗ на доработки.

---

## 1. Текущая структура (as-is)

Порядок блоков сверху вниз:

| # | Блок | Для кого | Назначение |
|---|------|----------|------------|
| 1 | Sticky header (имя, streak, 👑) | все | Идентичность + вход в подписку |
| 2 | Trial / sub banner | sub ≤14 дн. | Срочность продления |
| 3 | **Today hero** | все | Главная ценность: «что сегодня» |
| 4 | Morning notify | если выкл. | Retention |
| 5 | CTA «Обсудить день» (coach) | все | Engagement + upsell к Pro-лимиту |
| 6 | 3 ближайших дня | все | Habit / планирование |
| 7 | Habit nudge | streak > 0 | Возврат завтра |
| 8 | Evening check-in | все | Рефлексия / память |
| 9 | MonthProPanel | Pro+ | Планирование месяца |
| 10 | YearPerks / Year teaser | year / trial-teaser | Year value / upsell |
| 11 | Карточки месяц/год (числа) | все; deep = Pro | Навигация + lock |
| 12 | Premium card (trial) | trial | Мягкий upsell |
| 13 | **Сетка календаря** | все | Обзор месяца |
| 14 | Легенда | все | Расшифровка цветов |
| 15 | Bottom nav | все | Home / notes / sub / settings |

**Сильные стороны as-is**
- Чёткий hero «сегодня» с тоном, action line и 2–3 пунктами «можно».
- Цветовая система (зелёный / жёлтый / красный) + легенда.
- Привычка: streak, 3 дня вперёд, evening check-in, coach tour.
- Paywall месяца/года через модалку (trial) — правильный freemium-контракт.
- PWA / тёмная «космическая» эстетика соответствует бренду.

---

## 2. Аудит

### 2.1. Дизайн (визуал, иерархия)

| Проблема | Почему важно | Оценка |
|----------|--------------|--------|
| **Слишком много «стеклянных» карточек одного веса** | Hero, coach, upcoming, pro panels, teaser выглядят похоже — глаз не знает, что главное | 🔴 |
| **Календарь ниже fold** (особенно у Pro: MonthPro + Year + stats) | Сетка — сильнейший визуальный «wow» и навигация; её прячут длинным скроллом | 🔴 |
| **Слабая типографическая шкала** | Заголовки секций 10–12px, action в hero конкурирует с do-list | 🟡 |
| **Дублирование upsell** (trial banner + year teaser + premium card + 👑 + lock badges) | Визуальный шум, «магазин» вместо спокойного компаньона | 🟡 |
| **Нет «якоря бренда»** (иконка/wordmark) в header кроме sparkles | Слабее recognition при скриншотах / install | 🟢 |
| **Контраст secondary text** на glass | Мелкий muted на градиентах — риск для accessibility | 🟡 |

**Вывод дизайн:** визуальный язык есть, но **иерархия размыта**. Нужно 1 primary surface (Today) + 1 secondary (calendar) + остальное — collapsible / secondary.

### 2.2. Эргономика (mobile-first)

| Проблема | Почему важно | Оценка |
|----------|--------------|--------|
| **Длина скролла 1.5–2+ экрана** до календаря | Увеличивает friction; пользователь «теряется» | 🔴 |
| **Конкурирующие primary CTA** (hero, coach, notify, subscribe) | Нарушает закон Хика; нет одного явного next step | 🔴 |
| **Bottom nav vs sticky header crown** | Два входа в subscription — ок, но без лейбла 👑 неочевидно | 🟡 |
| **Карточки месяц/год: числа видны, deep locked** | Хороший tease, но тап → только paywall (ожидание «чуть-чуть контента» не оправдано) | 🟡 |
| **Swipe календаря** не очевиден (hint внизу) | Свайп подсказывается поздно | 🟢 |
| **Touch targets** в целом ≥44px | OK | ✅ |

**Вывод эргономика:** **сократить вертикальный стек** и ввести **зоны**: (A) решение на сегодня, (B) обзор месяца, (C) инструменты / upsell по запросу.

### 2.3. Информативность

| Проблема | Почему важно | Оценка |
|----------|--------------|--------|
| **Hero сильный**, но термины «день №N · планета» без одного plain-language резюме в первой строке | Новичок: «и что мне делать?» за 2 секунды | 🟡 |
| **Нет прогресса trial** (день 1/3) на home | Неясно, сколько ценности «попробовал» | 🟡 |
| **Нет «одного числа» месяца наверху** для trial (только lock) | Не продаём глубину, только прячем | 🟡 |
| **Upcoming** — action обрезан (line-clamp) | Полезная инфа теряется | 🟡 |
| **Календарь** не подсвечивает «сегодня» достаточно агрессивно на busy month | Поиск «где я» | 🟢 |
| **Отсутствие связи** check-in вчера → hero сегодня | Нет ощущения «памяти» / companion | 🟢 (roadmap) |

**Вывод информативность:** ценность «сегодня» хорошая; **связь today → week → month** и **прогресс trial** нужно усилить без перегруза.

### 2.4. Продаваемость (conversion / monetization)

| Проблема | Почему важно | Оценка |
|----------|--------------|--------|
| **Много soft-sell, мало «доказательства ценности» Pro** | Teaser говорит «есть Pro», не показывает *кусок* Pro (blur preview best days) | 🔴 |
| **Нет CTA «Оплатить в Telegram» на home** для trial near end | Лишний клик → subscription → pay | 🟡 |
| **Coach free limit** не виден на home** | Upsell quota только внутри coach | 🟢 |
| **Year upsell** рядом с month lock** путает уровни (Pro vs Year) | Пользователь не понимает, за что платит $10 vs $50 | 🟡 |
| **Нет социального доказательства / «для кого»** | Слабее доверие в CIS-аудитории | 🟢 |
| **Paywall месяца** уже есть (модалка) | Хороший friction для конверсии | ✅ |

**Вывод продаваемость:** freemium-контракт (trial = today+calendar, Pro = depth) **правильный**. Усилить **preview Pro** и **один главный upsell** вместо 3–4 одинаковых карточек.

---

## 3. Целевая модель экрана (to-be)

### 3.1. Принципы

1. **One glance rule:** за 3 секунды — тон дня + одно действие.
2. **Two zones above fold (iPhone SE / 667):**  
   - Zone A: Today hero  
   - Zone B: «Неделя» (3 дня) **или** мини-календарь (переключатель)
3. **Calendar is product, not footer** — сетка не ниже 1.2 экрана у trial.
4. **Один primary upsell** на экран (не 4).
5. **Pro depth = expand**, не «ещё 3 секции всегда открыты».

### 3.2. Целевой порядок блоков

```
[Header: лого/имя · streak · 👑]
[Trial chip: «День 2/3 trial · осталось N»]     // компакт, не full card если не urgent
[TODAY HERO — fixed primary]
[Tabs: «Неделя» | «Месяц»]                      // НОВОЕ: переключатель контента
  └─ Неделя: 3 дня + coach chip
  └─ Месяц: сетка календаря + легенда
[Месяц/Год chips — locked preview for trial]
[Accordion «Инструменты»]                      // Pro: MonthPro/Year; trial: 1 teaser
[Evening check-in — после 18:00 или collapsed]
[Bottom nav]
```

Notify banner: только 1 раз / dismiss, не всегда.

---

## 4. ТЗ на улучшения (приоритеты)

### P0 — «Быстрые wins» (1–3 дня разработки)

#### P0.1. Сжать above-the-fold
- **Задача:** Today hero + Upcoming + entry to calendar видны без длинного скролла на 667px.
- **Как:**
  - Уменьшить padding hero (do-list max 2 пункта на home, 3-й «ещё в дне»).
  - Notify: dismiss + `localStorage`, не показывать если enabled.
  - Coach CTA → **компактная chip-строка** под hero (одна линия), не full card.
  - Evening check-in: показывать **после 17:00** или если ещё не отмечен; иначе collapsed «Отметить вечер →».
- **Критерий приёмки:** на iPhone SE screenshot first screen: hero полностью + хотя бы 1 upcoming card + «Календарь» visible without scroll > 20%.

#### P0.2. Один upsell-блок
- **Задача:** убрать конкуренцию 👑 + trial banner + year banner + premium card.
- **Как:**
  - Trial: один sticky/inline **UpgradeBar**: «Trial · N дн. · Открыть Pro» (ведёт на /subscription).
  - Year teaser только если **уже Pro month** (upsell year), не на trial.
  - Premium card variant=card **убрать** с home при наличии UpgradeBar.
- **Критерий:** ≤1 заметный paywall-блок на home одновременно (кроме 🔒 на chips).

#### P0.3. Иерархия Today hero
- **Задача:** 1-я строка = plain verdict, не «№ и планета».
- **Как:**
  - Порядок: `[точка тона] [«День действий / Ровный / Пауза»]` → action (крупнее) → title/meta мельче → do-list.
  - Meta «N · планета» — secondary.
- **Критерий:** пользователь без онбординга отвечает «что делать сегодня» глядя 2 сек на hero.

#### P0.4. Календарь ближе
- **Задача:** grid в зоне B через tab «Месяц» **или** anchor-кнопка «К календарю» сразу под upcoming.
- **Как (минимально):** кнопка «Месяц · [название]» scrollIntoView к `cal-panel`;  
  **лучше:** tabs Week/Month (P1).
- **Критерий:** до сетки ≤1 свайп у trial.

---

### P1 — Структура и продажа (3–7 дней)

#### P1.1. Tabs «Неделя / Месяц»
- **UI:** segmented control под hero.
- **Неделя:** Upcoming (3–7 дней) + coach chip + habit.
- **Месяц:** cal-panel + legend (compact).
- **Состояние:** `localStorage home_tab`.
- **Критерий:** переключение без потери scroll position header; analytics `home_tab_change`.

#### P1.2. Locked preview месяца/года (не пустой paywall)
- **При тапе trial на месяц/год:**
  - Модалка: 1–2 строки **публичного** тизера (планета, 1 focus line) + blur «ещё 4 пункта» + **Оформить подписку**.
  - Не открывать полный MonthYearDetail.
- **Критерий:** в модалке есть *конкретный* кусок value, не только «в Pro».

#### P1.3. Pro tools в accordion
- MonthProPanel + YearPerks **свёрнуты** по умолчанию: «Инструменты Pro ▾» (badge count).
- **Критерий:** у Pro year first paint ≈ trial length; expand — осознанный жест.

#### P1.4. Карта тарифов на home (конец trial)
- Если trial и `daysLeft ≤ 1`: UpgradeBar → primary **«Оплатить в Telegram»** deep-link year (популярный план), secondary «Смотреть тарифы».
- **Критерий:** 1 тап до бота оплаты.

#### P1.5. Развести Pro vs Year в копирайте
- Month lock: «Pro: разбор месяца».
- Year teaser: «Год: окна 30 дней + дайджест» — **только** после Pro или как «лучший план» на /subscription, не как второй lock рядом.
- **Критерий:** A/B copy review RU/EN без пересечения «Pro/Year».

---

### P2 — Дизайн-система и retention (позже)

| ID | Задача | Детали |
|----|--------|--------|
| P2.1 | Токены UI | 1 primary card style (hero), 1 secondary (list), 1 tertiary (chip); убрать 4+ градиентных «героя» |
| P2.2 | Wordmark / app icon в header | 24–28px icon + short name |
| P2.3 | Today ← check-in | «Вчера вы отметили 4/5 — учтём» 1 строка (если есть check-in) |
| P2.4 | Accessibility | contrast AA для muted; reduce motion; focus rings |
| P2.5 | Empty / first day | Если first open: 1-line «Начните с карточки сегодня» (без полного tour re-show) |
| P2.6 | Share «мой день» с home | secondary icon на hero → share card (viral) |
| P2.7 | Skeleton / content stability | CLS: фиксированная min-height hero |

---

## 5. Копирайт (RU) — ориентиры

| Место | Сейчас (смысл) | Предложение |
|-------|----------------|-------------|
| Hero meta | Сегодня · N · Планета | Сначала тон: «День действий» / action |
| UpgradeBar | разные тексты | «Trial: осталось N дн. · Полный месяц в Pro» |
| Month lock modal | abstract Pro | «Ваш месяц — {planet}. В Pro: фокус, даты, лучшие дни» |
| Coach chip | длинный hint | «Обсудить день · {remaining}/5» |

---

## 6. Метрики успеха

| Метрика | Сейчас (гипотеза) | Цель после P0–P1 |
|---------|-------------------|------------------|
| % сессий с открытием day detail с home | — | +15% |
| % trial → /subscription с home | — | +20% |
| Scroll depth до cal-panel (trial) | часто >1 screen | median ≤ 0.5 screen |
| Time to first meaningful action (tap today/upcoming) | — | p50 < 8s |
| Drop-off от «шума» (закрытие без взаимодействия) | — | −10% |
| NPS / «понятно за 10 сек» (опрос 5 юзеров) | — | ≥4/5 |

События analytics (добавить при реализации):
- `home_view`, `home_tab_change`, `home_upgrade_bar_click`, `home_month_lock_open`, `home_calendar_scroll`, `home_coach_chip`.

---

## 7. Out of scope (не в этом ТЗ)

- Редизайн landing.
- Новый расчётный движок / LLM на home.
- Push-сервер (остаётся PWA local notify).
- Смена платёжного провайдера (Ammer уже отдельно).

---

## 8. Рекомендуемый порядок внедрения

1. **P0.2** upsell consolidation + **P0.3** hero hierarchy (макс. impact / день)  
2. **P0.1** compress stack + **P0.4** calendar closer  
3. **P1.1** tabs Week/Month  
4. **P1.2** locked preview + **P1.3** accordion Pro  
5. **P1.4–P1.5** conversion copy + end-of-trial CTA  
6. P2 design system polish  

---

## 9. Acceptance checklist (релиз home v2)

- [ ] Trial: first screen = hero + week strip + calendar entry  
- [ ] ≤1 primary paywall block  
- [ ] Month/year tap → modal with teaser + «Оформить подписку» (не полный deep content)  
- [ ] Pro: Month/Year tools default collapsed  
- [ ] RU/EN copy updated  
- [ ] Analytics events wired  
- [ ] Manual QA: SE size, paid month, paid year, trial day 1 and day 3  
- [ ] No regression: day open, coach, export, pay deep-link  

---

## 10. Краткое резюме для стейкхолдера

Главный экран **уже несёт ценность** (карточка «сегодня», цвета, привычка), но **перегружен** вторичными карточками и upsell’ами, из‑за чего **календарь и ясный next step тонут**.  

Нужно: **сжать**, **одна иерархия**, **календарь ближе**, **один умный upsell**, **Pro-инструменты по запросу**, **тизер вместо пустого замка**.  

Это повысит и usability, и конверсию в подписку без смены «магии» продукта.
