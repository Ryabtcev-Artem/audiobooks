# Голосовая библиотека

Доступный сайт аудиокниг для незрячих пользователей. React + Vite, чистый JavaScript.

## Запуск

```bash
npm install
npm run dev
```

Сборка: `npm run build`

## Доступность

- WCAG: контрастная тёмная тема, крупные кнопки, skip-link
- ARIA-метки на плеере и кнопках
- Клавиатура: Tab, Enter, Пробел, стрелки влево/вправо
- Совместимость с TalkBack и VoiceOver

## Структура

- `src/components/` — BookList, BookCard, BookFilters, AudioPlayer, Layout
- `src/pages/` — HomePage, BookPage
- `src/data/books.json` — каталог 50 классических книг (жанр, рейтинг, длительность, чтецы)
- `src/styles/global.css` — глобальные стили
- `docs/CATALOG.md` — полная Markdown-таблица каталога

## Фильтры

На главной: минимальный рейтинг (/10) и длительность (до 1 ч / 1–5 ч / больше 5 ч). Жанры и авторы — отдельные страницы в меню наверху.
