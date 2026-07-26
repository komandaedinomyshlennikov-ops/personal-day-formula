# Аудит текстов приложения (RU / EN)

**Дата:** 2026-07-26  
**Роли:** Product copy · UX writing · Localization · Brand voice · Legal soft-check · Conversion  
**Источники:** `src/i18n/locales/ru.json`, `en.json` (~1477 ключей каждый), фрагменты UI/коучинга  

---

## 0. Резюме

| Ось | Оценка | Комментарий |
|-----|--------|-------------|
| **Полнота RU↔EN** | 9/10 | 1477 = 1477 ключей, **0 missing**, **0 mismatch `{{vars}}`**, нет «русского в EN» |
| **Тон и позиционирование** | 8/10 | Сильная линия «не гороскоп / не приказ / не ИИ-оракул» |
| **Консистентность продукта** | 5/10 | Конфликт: trial «всё» vs freemium; landing $ vs $10; activation codes vs auto-unlock |
| **Продаваемость** | 7/10 | Хорошие CTA и FAQ; цены/тарифы на landing устарели |
| **EN как отдельный рынок** | 6.5/10 | Качественный перевод, но местами calque / mixed US-UK / лишний tech jargon |
| **Юридическая осторожность** | 8/10 | Disclaimers сильные; оферта vs Terms; «консультация» в lifetime — обещание |

**Главный вывод:** языковая база **зрелая и выровненная по ключам**. Риски — не «плохой перевод», а **разъехавшийся product narrative**: в разных экранах обещания trial, цены, способ оплаты и роль «астро» звучат по-разному. Перед паблик-релизом нужна **copy pass «один источник правды»** по тарифам и pay flow.

---

## 1. Технический health-check локализации

| Проверка | Результат |
|----------|-----------|
| Число ключей RU / EN | 1477 / 1477 |
| Только в RU / только в EN | 0 / 0 |
| Пустые строки | 0 |
| Разные `{{placeholders}}` | 0 |
| Кириллица в EN | 0 |
| Явные untranslated (identical long) | 6 (в основном OK: `PDF / CSV`, `Instagram`, format tokens) |
| Поддерживаемые языки в runtime | **только ru + en** (`i18n/index.ts`) |

**Мелкий дефект:**  
- `settings.metricProTools`: EN/RU = `"Pro tools accordion"` — dev-жаргон в UI (admin metrics).  
- `calendar.storyTitleDay` есть в RU; в EN основной набор — `storyTitleFavorable/Hard/Neutral` (частичный drift ключей — проверить использование в коде).

---

## 2. Бренд-голос (что уже хорошо)

### 2.1. Единая «этическая рамка»
Повторяется в onboarding, landing, coach, FAQ, method disclaimer:

- «Не гороскоп» / «Not a horoscope»  
- «Подсказка / cue, не приказ»  
- «Не знаем судьбу»  
- «Не мед/фин/юр совет»  

Это **сильный актив** для доверия и App Store / жалоб на «магические обещания».

### 2.2. RU-голос
- «Вы»-регистр, мягкий wellness-тон, короткие предложения в hero.  
- Удачные формулировки: «День действий / Ровный / Пауза», «мягче», «если есть выбор».  
- CIS-friendly: «без банковской карты», Telegram, автор Татьяна Генюш.

### 2.3. EN-голос
- В целом естественный product English (contractions, short CTAs).  
- Удачно: “A prompt to think, not an order”, “not fortune-telling”.  
- Helper/coach framing лучше, чем “AI coach”.

---

## 3. Критические несоответствия (P0 для copy)

### 3.1. Landing pricing ≠ product pricing
| | Landing | Subscription (факт продукта) |
|--|---------|------------------------------|
| RU free | 0 ₽ | trial 3 дня |
| RU premium | **499 ₽/мес** | **$10 / $50 / $100** (USD) |
| EN free | $0 + «Limited astro events» | trial core only |
| EN premium | **$9.99/month** + «All astro events» | $10 month, year tools separate |

**Влияние:** недоверие, жалобы, риск «вводим в заблуждение» (реклама/оферта).  
**Решение:** один source of truth — вынести цены из дублирующего `landing.freePlan/premiumPlan` или синхронизировать с `subscription.plans` + `site.PLAN_PRICES`.

### 3.2. Trial: «всё» vs реальный freemium
| Текст | Обещает | Реальность |
|-------|---------|------------|
| `subscription.trialDesc` | «Попробуйте **все** функции без ограничений» | Нет month/year deep, export, notes tips, coach unlimited |
| `landing.freePlan.feature3` | «3 дня полного доступа» | Core only |
| `premium.trialValue*` | честнее: today + calendar + 3 days | OK |

**Решение:** trial-copy только: «сегодня + календарь + ближайшие дни + helper с лимитом». Убрать «все» / «без ограничений».

### 3.3. Activation / codes — зомби-копирайт
В продукте уже **auto-unlock без кода**, legacy codes **выключены в prod**, но живы:

- `subscription.haveCode`  
- весь блок `activation.*` («Введите код», «XXXX-XXXX»)  
- `activation.how2` «по реквизитам автора»  

**Влияние:** пользователь ищет код, которого нет → support load, drop-off.  
**Решение:** скрыть UI + тексты; оставить только «Оплатить → ссылка unlock» / legacy dev-only.

### 3.4. Оплата: карточный flow vs support fallback
Актуальные step1–3 (Telegram Payments) — **хорошие**.  
Параллельно:

- `subscription.paymentInfo` — «подтверждение в Telegram» (размыто)  
- `activation.how2` — реквизиты  
- EN `landing.freePlan.feature3` — «Limited **astro** events» (устаревший product language)  

**Решение:** один сценарий оплаты; fallback support — отдельный «Нужна помощь», не основной how-to.

---

## 4. Высокий приоритет (P1)

### 4.1. Смешение «астро / энергия / формула / Pro / Year»
| Термин | Где | Проблема |
|--------|-----|----------|
| «Астронавигатор» / AstroNavigator | бренд | Ок как имя |
| «астро-контекст», «astro events» | plans features | Усиливает гороскоп-фрейм, который FAQ отрицает |
| «энергия дня» | calendar/settings | Ок, если = tone |
| «формула» | coach | Ок для transparency |
| Pro / Year / trial / free (EN в RU) | UI | Нужен глоссарий: Pro = месяц+, Year = год+ |

**Рекомендация словаря (RU):**  
- «Личный день / месяц / год»  
- «Тон дня» вместо лишней «энергии» в продаже  
- «События цикла» вместо «астро-события»  
- Pro → «Подписка Pro (месяц)» / Year → «Годовой план»

### 4.2. Lifetime features overpromise
RU/EN: «Персональная консультация с автором», «пожизненный приоритет».  

Если консультация **не SLA** — риск.  
**Решение:** «Возможность записаться на консультацию (по договорённости)» или убрать.

### 4.3. EN quality issues (не ошибки, а polish)
| Ключ / паттерн | Замечание | Предложение |
|----------------|-----------|-------------|
| `landing.freeButton` “Show today’s day” | awkward | “See today’s tip” |
| `coach.ctaHome` “Discuss today’s day” | redundant | “Discuss today” |
| `premium.yearBody` “2026 tooling” | too product-y | “tools for the year ahead” |
| `premium.compassHint` “Stars = year emphasis” | confusable with Telegram Stars | “Star marks = focus weight” |
| `settings.highContrastDesc` “For visually impaired” | outdated phrasing | “Higher contrast for easier reading” |
| `subscription.trialDesc` “all features” | false | “core calendar & today” |
| Title Case everywhere in settings EN | heavy | Sentence case for mobile UI |
| `meta.description` “. free,” | typo space/period | fix punctuation |

### 4.4. RU polish
| Паттерн | Замечание |
|---------|-----------|
| `landing.trust3` “3 дня free” | англицизм |
| `meta.description` «. бесплатно» | строчная после точки |
| `subscription.features.dailyRecommendations` “Action-подсказки” | смешение |
| `premium.yearPerk2` “top-дни” | англицизм |
| `settings.metric*` Lock / viewport / accordion | admin UI, перевести если оставляем |
| `yearBadge` “Year · 2026” | год в бренде устареет в 2027 → “Year plan” |

### 4.5. Tone: EN “you” vs RU “вы” — OK  
RU устойчиво на «вы». EN — friendly contractions. Сохранять; не вводить «ты» в RU.

### 4.6. Social proof
`landing.proof1–3` — сильные, но **выглядят как реальные отзывы**. Если вымышлены — label “примеры” / “иллюстрации”. Юридический soft-risk.

---

## 5. Средний приоритет (P2)

### 5.1. Onboarding vs Landing дубли
Один и тот же месседж 3 раза (slides + landing hero + FAQ). Не ошибка, но можно **укоротить slides** (1 экран value + 1 дата).

### 5.2. Coach source lines (tech leakage)
`sourceLive` / `sourceReady` / `sourceLocal` — Llama, Groq, API.  
Для пользователя: «Онлайн-помощник» / «Офлайн-режим». Tech — в Settings для advanced.

### 5.3. Notifications
RU disclaimer честный (PWA). EN ok.  
Уточнить: «работает, пока приложение/вкладка могут работать» — уже есть.

### 5.4. Legal naming
RU «Публичная оферта» vs EN «Terms / Offer» — для EN рынка лучше **Terms of Use** + отдельный disclaimer; «оферта» — RU-специфика.

### 5.5. Glossary / energies
Длинные тексты планет (Раху, Венера…) — богатый слой, но **редко попадает в trial path**. Риск перегруза «астрологией» при deep links. Ок оставить в day detail; не тянуть на landing.

### 5.6. Unlock screen
Ключи `unlock.*` — проверить согласованность с auto-pay (loading/ok/fail). Fail body должен вести в Telegram support, не «введите код».

---

## 6. Матрица экранов (кратко)

| Экран | RU | EN | Главный риск |
|-------|----|----|--------------|
| **Landing** | сильный hero + FAQ | good, awkward CTAs | **цены 499₽ / $9.99** |
| **Onboarding** | отличный | отличный | trialNote ok |
| **Home / calendar** | ясный | ясный | — |
| **Subscription** | хорошо steps | хорошо | trialDesc «все»; haveCode |
| **Premium teasers** | ясно Pro vs Year | «2026 tooling» | yearBadge год |
| **Coach** | trustLine ⭐ | trustLine ⭐ | tech source lines |
| **Notes** | честно «не ИИ» | ok | — |
| **Activation** | устарело | устарело | **убрать из prod UX** |
| **Legal cookies** | ok | ok | — |
| **Settings metrics** | dev EN mix | — | admin only ok |

---

## 7. Рекомендуемый tone guide (зафиксировать)

### Do
- «Может подойти», «если есть выбор», «мягче», «ориентир»  
- «Helper / помощник», не «ИИ-коуч» в маркетинге  
- Честно: trial = core; Pro = глубина; Year = окна/дайджест  

### Don’t
- «Все функции», «без ограничений» для trial  
- «Гарантия», «предскажет», «изменит судьбу» (кроме отрицания)  
- «Код активации» в основном pay path  
- Смешивать ₽, $, «astro events», «AI», «LLM» в одном экране без нужды  

### Словарь Pro / Year
| RU | EN |
|----|-----|
| Пробный период | Trial |
| Pro (месяц) | Pro (monthly) |
| Годовой план | Annual plan |
| Навсегда | Lifetime |
| Открыть доступ | Open access |
| Оплатить в Telegram | Pay in Telegram |

---

## 8. ТЗ: copy pass (приоритеты)

### Wave A — до паблика (1–2 дня)
1. Синхронизировать **landing prices/features** с реальными $10/$50/$100 и freemium.  
2. Переписать **trialDesc / freePlan / «все функции»**.  
3. Убрать/скрыть **activation + haveCode** из UI strings (или пометить deprecated).  
4. Починить **meta.description** RU/EN пунктуацию.  
5. EN: `today’s day` → `today`; `Show today’s day` → `See today`.  
6. RU: `3 дня free` → `3 дня бесплатно`; «Action-подсказки» → «подсказки на день».  
7. Lifetime: смягчить «консультация с автором».  

### Wave B — неделя
8. Глоссарий терминов (астро → цикл/тон).  
9. Coach source lines → user-friendly.  
10. yearBadge без «2026».  
11. Social proof — label если не реальные отзывы.  
12. Проверка `unlock.*` + empty states.  

### Wave C — качество EN
13. Sentence case в settings.  
14. Accessibility phrasing.  
15. Убрать calques; native pass носителем (1–2 часа).  

---

## 9. Acceptance criteria copy release

- [x] Нет упоминания кодов активации в основном pay flow (RU+EN) — Wave A 2026-07-26  
- [x] Нет противоречия «trial = всё» — trialDesc / freePlan переписаны  
- [x] Landing prices = subscription prices ($0 / $10 / $50 / $100)  
- [ ] FAQ + method disclaimer на landing и в app  
- [x] Pro / Year / trial термины выровнены (Wave A)  
- [x] EN: critical calques Wave A  
- [x] Lifetime «консультация» смягчена (по договорённости)  
- [x] UI: «астро-события» → «события цикла» / cycle events (Wave B)  
- [x] Coach source без Llama/Groq/LLM/API (Wave B)  
- [x] yearBadge без года в бренде (Wave A+B)  
- [x] Social proof: label «иллюстрации» / illustrative (Wave B)  
- [x] unlock fail → Telegram, не код; notes empty + windowsEmpty согласованы (Wave B)  

### Wave A applied
См. commit copy Wave A: ru/en subscription, landing plans, activation→link, meta, coach CTA, yearBadge.

### Wave B applied
См. commit copy Wave B: glossary cycle/tone labels, coach source UX, proofNote, unlock/empty polish; brand «Астронавигатор» сохранён.

---

## 10. Итог для стейкхолдера

Тексты **не «сырые»**: RU/EN выровнены, голос заботливый и юридически аккуратный.  
Слабое место — **продуктовая правда в словах**: цены на лендинге, «полный trial», коды активации, «астро-события» и tech-строки коуча.  

Исправление Wave A — максимальный ROI перед запуском рекламы; Wave B/C — полировка бренда и EN-рынка.

---

*Метод: полный diff ключей + выборочный semantic review ключевых воронок (landing → trial → paywall → coach). Не заменяет native EN editorial pass.*
