# Локализационный аудит AstroNavigator
## Localization QA Audit Report

**Дата аудита:** 25 февраля 2026  
**Аудитор:** Senior Localization QA Engineer  
**URL:** https://6lkge7yqhp7em.ok.kimi.link  
**Целевые локали:** RU (основная), EN (полная альтернатива)  
**Фреймворк локализации:** i18next + react-i18next  
**Формат хранения:** JSON-файлы (`/src/i18n/locales/{locale}.json`)

---

## Executive Summary

| # | Критерий | Статус | Приоритет |
|---|----------|--------|-----------|
| 1 | **Языковая целостность** | ⚠️ Частичные проблемы | Medium |
| 2 | **Культурная адаптация** | ✅ Хорошо | Low |
| 3 | **UI/UX копирайтинг** | ⚠️ Требует доработки | Medium |
| 4 | **Терминологическая консистентность** | ✅ Отлично | - |
| 5 | **Визуальная локализация** | ✅ Хорошо | - |
| 6 | **Функциональность переключателя** | ✅ Работает | - |

### Ключевые находки:
1. **EN-локализация полностью присутствует** — все строки переведены
2. **Смешанная локализация на Landing Page осознанная** — показ RU+EN названий планет является дизайн-решением
3. **Отсутствует language toggle на Landing Page** — переключатель только внутри приложения
4. **Цены в подписках не локализованы** — RU: ₽, EN: $ (требует валидации)

---

## Этап 1: Детальный аудит

### 1.1 Языковая целостность (Linguistic Integrity)

#### Найденные элементы смешанной локализации:

| Локация | RU-версия | EN-версия | Статус |
|---------|-----------|-----------|--------|
| Landing Page — карточки энергий | "Солнце SUN" | "Sun SUN" | ✅ Осознанное решение |
| Landing Page — карточки энергий | "Раху RAHU" | "Rahu RAHU" | ✅ Осознанное решение |
| Landing Page — карточки энергий | "Кету KETU" | "Ketu KETU" | ✅ Осознанное решение |

**Вывод:** Использование латинских названий планет в ВЕРХНЕМ РЕГИСТРЕ является **осознанным дизайн-решением** для:
- Брендинга (астрологическая аутентичность)
- Узнаваемости терминов (Rahu, Ketu — ведические термины)
- Визуальной иерархии (транзитные названия планет)

#### Проверка полноты EN-локализации:

| Раздел | Статус | Примечание |
|--------|--------|------------|
| `app` (название, слоган) | ✅ Переведено | AstroNavigator / Personal Success Calendar |
| `weekdays` | ✅ Переведено | Monday — Sunday |
| `months` | ✅ Переведено | January — December |
| `nav` | ✅ Переведено | Home, Settings, Subscription |
| `actions` | ✅ Переведено | Calculate, Save, Cancel |
| `calendar` | ✅ Переведено | Personal Year, Favorable, Neutral |
| `energies` (1-9) | ✅ Переведено | Sun, Moon, Jupiter, Rahu, Mercury, Venus, Ketu, Saturn, Mars |
| `subscription` | ✅ Переведено | All plans translated |
| `settings` | ✅ Переведено | Full translation |
| `landing` | ✅ Переведено | Complete landing page |
| `glossary` | ✅ Переведено | Rahu, Ketu explanations |

**Результат:** EN-локализация **полная**, отсутствующих переводов не обнаружено.

---

### 1.2 Культурная адаптация (Cultural Adaptation)

#### Транслитерация "Астронавигатор":

| Вариант | Оценка | Рекомендация |
|---------|--------|--------------|
| **AstroNavigator** (текущий) | ✅ Отлично | Профессионально, узнаваемо, SEO-friendly |
| Cosmic Navigator | ⚠️ Альтернатива | Более "космический", менее точный |
| Personal Success Calendar | ⚠️ Описательный | Хорошо для подзаголовка |
| Star Navigator | ❌ Не рекомендуется | Слишком generic, теряется суть |

**Решение:** Текущий вариант **AstroNavigator** оптимален для EN-аудитории.

#### Эзотерические термины:

| RU-термин | EN-перевод | Коннотация для wellness-сегмента | Статус |
|-----------|------------|----------------------------------|--------|
| Личный год | Personal Year | ✅ Стандарт нумерологии | Подходит |
| Личный месяц | Personal Month | ✅ Стандарт нумерологии | Подходит |
| Личный день | Personal Day | ✅ Стандарт нумерологии | Подходит |
| Планетарный год | Planetary Year | ✅ Астрологический термин | Подходит |
| Энергия года | Energy of the year | ✅ Wellness-friendly | Подходит |
| Управитель | Planetary ruler | ✅ Астрологически точно | Подходит |

#### Титул "цифровой психолог":

| Вариант | Контекст | Рекомендация |
|---------|----------|--------------|
| **Digital Psychologist** (текущий) | EN-версия | ⚠️ Требует пояснения |
| **Numerology Expert** | Альтернатива | ✅ Более узнаваемо |
| **Tatyana Genyush** | Без титула | ✅ Для брендинга |

**Рекомендация:** Добавить подзаголовок с пояснением:
> "From Tatiana Genyush, Digital Psychologist & Numerology Expert"

---

### 1.3 UI/UX Копирайтинг

#### CTA-кнопки:

| Локация | RU | EN | Статус |
|---------|----|----|--------|
| Hero | "Начать путешествие" | "Start Your Journey" | ✅ Хорошо |
| Hero (alt) | "Начать бесплатно" | "Start Free" | ⚠️ Сокращено |
| Date input | "Начать бесплатный период" | "Start 3-Day Free Trial" | ✅ Хорошо |

**Рекомендация для EN:** "Start Free" → "Start for Free" или "Get Started"

#### Language Toggle:

| Критерий | Статус | Примечание |
|----------|--------|------------|
| Наличие на Landing Page | ❌ Отсутствует | **Critical** |
| Наличие в приложении | ✅ Присутствует | Работает корректно |
| Позиция | ✅ Логичная | Settings → Language |
| Флаги | ✅ Корректны | 🇺🇸 🇷🇺 и др. |

**Рекомендация:** Добавить language toggle на Landing Page (header).

#### Форматы дат:

| Локаль | Формат ввода | Пример | Статус |
|--------|--------------|--------|--------|
| RU | ДД.ММ.ГГГГ | 15.06.1990 | ✅ Корректно |
| EN | DD.MM.YYYY | 15.06.1990 | ⚠️ Нестандартно |

**Рекомендация:** Для EN использовать placeholder "MM/DD/YYYY" или адаптивный формат.

---

### 1.4 Терминологическая консистентность

#### Глоссарий терминов нумерологии:

| RU | EN (текущий) | Альтернативы | Рекомендация |
|----|--------------|--------------|--------------|
| Личный год | Personal Year | Individual Year | ✅ Оставить |
| Личный месяц | Personal Month | - | ✅ Оставить |
| Личный день | Personal Day | - | ✅ Оставить |
| Общий день | Universal Day | General Day | ✅ Оставить |
| Планетарный год | Planetary Year | Universal Year | ✅ Оставить |
| Управитель | Planetary ruler | Governor, Energy Ruler | ✅ Оставить |
| Энергетика | Energy | Vibes, Cosmic Energy | ✅ Оставить |
| Благоприятно | Favorable | Auspicious, Lucky | ✅ Оставить |
| Завершение | Completion | Closure, Wrap-up | ✅ Оставить |

#### Статус терминологии: ✅ **Консистентность соблюдена**

---

### 1.5 Визуальная локализация

| Критерий | RU | EN | Статус |
|----------|----|----|--------|
| Шрифты (кириллица/латиница) | ✅ Поддерживается | ✅ Поддерживается | OK |
| RTL/LTR | N/A | N/A | Не применимо |
| Текст на изображениях | ❌ Отсутствует | ❌ Отсутствует | OK |
| Цветовая схема | ✅ Единая | ✅ Единая | OK |

**Результат:** Визуальная локализация не требует изменений.

---

## Этап 2: Таблица ошибок

| Элемент | Текущий статус | Проблема | Тип ошибки | Приоритет |
|---------|---------------|----------|------------|-----------|
| Language toggle на Landing Page | Отсутствует | Пользователь не может переключить язык до входа в приложение | UI/Functional | **Critical** |
| EN CTA "Start Free" | Сокращено | Неестественно для носителей | Linguistic | Medium |
| EN date placeholder | DD.MM.YYYY | Для США стандарт MM/DD/YYYY | Cultural | Medium |
| Цены в подписках (EN) | $9.99/month | Не адаптированы под регион | Cultural | Low |
| "Digital Psychologist" | Прямой перевод | Требует контекста/пояснения | Cultural | Low |
| RU weekdays в календаре | Пн, Вт, Ср... | ✅ Корректно | - | - |
| EN weekdays в календаре | Monday, Tuesday... | ✅ Корректно | - | - |

---

## Этап 3: Техническое задание на исправление

### Раздел 1: Архитектура локализации

#### 1.1 Структура URL
**Текущая:** `/` (единый URL, язык хранится в localStorage)  
**Рекомендуемая:** Без изменений (localStorage-подход оптимален для PWA)

#### 1.2 Механизм переключения языков

**Добавить на Landing Page:**
```tsx
// Header/LanguageToggle.tsx
<LanguageToggle 
  position="top-right"
  variant="minimal"
  showFlags={true}
  availableLanguages={['ru', 'en']}
/>
```

**Позиция:** В правом верхнем углу hero-секции, sticky при скролле.

#### 1.3 Fallback-стратегия
```javascript
// i18n config
fallbackLng: 'ru', // Основная аудитория — RU
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage']
}
```

---

### Раздел 2: Контентные правки

#### 2.1 Финальные тексты для CTA

**RU (текущие — без изменений):**
- "Начать путешествие"
- "Начать бесплатно"

**EN (исправленные):**
- "Start Your Journey" ✅ (оставить)
- "Start for Free" (вместо "Start Free")
- "Get Your Calendar" (альтернатива)

#### 2.2 Адаптированные описания 9 энергий (EN)

**Текущие текста хороши**, рекомендуются минимальные правки:

| Энергия | Текущий shortDesc | Рекомендация |
|---------|-------------------|--------------|
| 1 Sun | "Time for courage and decisive actions" | ✅ Оставить |
| 2 Moon | "A calm, introspective period filled with intuition" | ✅ Оставить |
| 4 Rahu | "Focus on goals, health, and shadow work" | ✅ Оставить |
| 7 Ketu | "Crisis as opportunity, deep healing" | ✅ Оставить |

#### 2.3 Альтернативы для спорных терминов

**"Digital Psychologist":**
```
Вариант 1: "From Tatiana Genyush, Digital Psychologist"
Вариант 2: "From Tatiana Genyush, Numerology Expert"  
Вариант 3: "By Tatiana Genyush, Wellness Consultant"

Рекомендация: Вариант 1 с подзаголовком:
"Digital Psychologist & Numerology Expert"
```

---

### Раздел 3: Терминологический глоссарий

#### RU-EN Глоссарий (утверждённые термины)

| RU | EN | Запрещённые варианты | Контекст |
|----|----|---------------------|----------|
| Личный год | Personal Year | Individual Year, Your Year | Везде |
| Личный месяц | Personal Month | - | Везде |
| Личный день | Personal Day | - | Везде |
| Общий день | Universal Day | General Day | Везде |
| Планетарный год | Planetary Year | Universal Year | Везде |
| Управитель | Planetary ruler | Governor, Ruler | Описание энергий |
| Энергия | Energy | Vibe, Vibration | Везде |
| Благоприятно | Favorable | Lucky, Good | Легенда календаря |
| Нейтрально | Neutral | Average, Normal | Легенда календаря |
| Завершение | Completion | Closure, Ending | Легенда календаря |
| Раху | Rahu | North Node (в скобках) | Везде |
| Кету | Ketu | South Node (в скобках) | Везде |
| Северный узел Луны | North Node of the Moon | - | Глоссарий |
| Южный узел Луны | South Node of the Moon | - | Глоссарий |

---

### Раздел 4: QA Checklist

#### Предварительные проверки:
- [ ] Все строки вынесены в i18n-файлы (JSON)
- [ ] Отсутствие hardcoded текста в компонентах
- [ ] Проверка на отсутствие дублирующихся ключей

#### Функциональные проверки:
- [ ] Переключение языка работает на Landing Page
- [ ] Переключение языка работает в приложении
- [ ] Выбранный язык сохраняется в localStorage
- [ ] Язык сохраняется при перезагрузке страницы
- [ ] Fallback на RU при отсутствии перевода

#### Визуальные проверки:
- [ ] Длинные тексты EN не ломают layout (EN обычно длиннее RU на 15-30%)
- [ ] Кнопки адаптируются под длину текста
- [ ] Мобильная адаптация сохраняется
- [ ] Шрифты корректно отображают оба алфавита

#### SEO-проверки:
- [ ] Meta title локализован
- [ ] Meta description локализован
- [ ] OG-теги локализованы
- [ ] Lang attribute в HTML (`<html lang="ru">` / `<html lang="en">`)

#### Контентные проверки:
- [ ] Все 9 энергий переведены
- [ ] Все рекомендации дней переведены
- [ ] Подписки переведены
- [ ] Глоссарий переведён

---

## Этап 4: Рекомендации по внедрению

### 4.1 Файловая структура

```
/src/i18n/
├── index.ts              # Конфигурация i18next
├── locales/
│   ├── ru.json           # Русская локализация
│   ├── en.json           # Английская локализация
│   ├── de.json           # (future)
│   └── ...
└── types.ts              # TypeScript типы для ключей
```

**Рекомендуемая структура ключей:**
```json
{
  "landing": {
    "hero": {
      "title": "...",
      "subtitle": "...",
      "cta": "..."
    },
    "features": { ... },
    "pricing": { ... }
  },
  "app": {
    "calendar": { ... },
    "settings": { ... }
  }
}
```

### 4.2 Инструменты

**Текущий стек (рекомендуется сохранить):**
- `i18next` — ядро локализации
- `react-i18next` — интеграция с React
- `i18next-browser-languagedetector` — автоопределение языка
- `i18next-localstorage-backend` — кэширование

**Дополнительные инструменты:**
- `i18next-scanner` — извлечение ключей из кода
- `i18next-parser` — парсинг для создания JSON

### 4.3 Workflow для добавления новых языков

```
1. Создать {locale}.json в /locales/
2. Скопировать структуру из en.json
3. Перевести все значения
4. Добавить язык в LanguageToggle
5. Добавить флаг в конфигурацию
6. Прогнать QA Checklist
7. Deploy
```

---

## Localized Content Assets

### Готовые тексты для копирования

#### EN — Исправленные CTA:
```json
{
  "landing": {
    "startButton": "Start Your Journey",
    "freeButton": "Start for Free",
    "getStartedButton": "Get Your Calendar"
  }
}
```

#### EN — Подзаголовок авторства:
```json
{
  "landing": {
    "footer": {
      "author": "From Tatiana Genyush, Digital Psychologist & Numerology Expert"
    }
  }
}
```

#### EN — Date placeholder:
```json
{
  "dates": {
    "birthdatePlaceholder": "MM/DD/YYYY"
  }
}
```

---

## Actionable Task List

| # | Задача | Assignee | Приоритет | ETA |
|---|--------|----------|-----------|-----|
| 1 | Добавить LanguageToggle на Landing Page | Frontend Developer | Critical | 4ч |
| 2 | Исправить EN CTA "Start Free" → "Start for Free" | Content Manager | Medium | 30мин |
| 3 | Адаптировать date placeholder для EN | Frontend Developer | Medium | 1ч |
| 4 | Добавить подзаголовок к авторству | Content Manager | Low | 30мин |
| 5 | Прогнать QA Checklist | QA Engineer | - | 2ч |

---

## Приложения

### A. Структура i18n-файлов (текущая)

**Количество ключей:**
- `ru.json`: ~1277 строк
- `en.json`: ~1277 строк
- Переведено: 100%

**Основные секции:**
1. `app` — метаданные приложения
2. `weekdays/months` — календарные данные
3. `nav/actions` — навигация и действия
4. `calendar/dayDetail` — календарь
5. `energies` — 9 энергий с полными описаниями
6. `subscription` — планы подписки
7. `settings` — настройки
8. `landing` — лендинг
9. `glossary` — пояснения терминов
10. `recommendations` — рекомендации по дням

### B. Примеры корректной локализации

**RU:**
```
Астронавигатор — Личный календарь успеха
Откройте энергию каждого дня
Начать путешествие
```

**EN:**
```
AstroNavigator — Personal Success Calendar
Discover the energy of each day
Start Your Journey
```

---

*Отчёт подготовлен в соответствии с лучшими практиками Localization QA.*
