# Астронавигатор — Личный календарь успеха

Персональный астро-календарь по дате рождения. Планируйте важные события, дела и решения в соответствии с планетарными энергиями.

## Стек

- React 19 + TypeScript
- Vite 7
- Tailwind CSS + shadcn/ui
- i18next (RU, EN и другие языки)
- Framer Motion

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Деплой

Приложение публикуется на **GitHub Pages** через GitHub Actions (`.github/workflows/deploy.yml`) при каждом пуше в `main`.

## Документация

- [Анализ AstroNavigator](docs/AstroNavigator_Analysis_and_Recommendations.md)
- [Анализ календаря](docs/Calendar_Analysis_and_Recommendations.md)
- [Аудит локализации](docs/Localization_Audit_Report_AstroNavigator.md)
