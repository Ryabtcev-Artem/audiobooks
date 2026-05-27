import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const books = JSON.parse(
  readFileSync(join(root, 'src/data/books.json'), 'utf8')
);

let md = `# Каталог русской классической литературы (аудио)

Данные собраны по открытым источникам (ЛитРес, LiveLib, Goodreads): жанры — по классификации изданий; рейтинги — средние оценки пользователей (шкала 5 баллов × 2 = /10); длительность — типичная полная аудиоверсия на ЛитРес; чтецы — наиболее популярные исполнители на ЛитРес/YouTube.

| № | Название | Автор | Жанр | Рейтинг (/10) | Длительность (ч) | Чтецы |
|---:|---|---|---|---:|---:|---|
`;

books.forEach((b, i) => {
  const authors = Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.join(', ') : (b.author || '');
  md += `| ${i + 1} | ${b.title} | ${authors} | ${b.genre} | ${b.rating.toFixed(1)} | ${b.durationHours} | ${b.narrators.join(', ')} |\n`;
});

md += `
## Как работают фильтры на сайте

1. **Минимальный рейтинг** — показываются только книги, у которых поле \`rating\` не ниже выбранного порога (например, «От 8.0» скрывает всё с рейтингом 7.9 и ниже).
2. **Жанр** — точное совпадение с полем \`genre\` в каталоге; список жанров формируется автоматически из всех 50 книг.
3. **Длительность** — по полю \`durationHours\`: *до 1 ч* (< 1), *1–5 ч* (от 1 до 5 включительно), *больше 5 ч* (> 5).

Фильтры применяются одновременно (логическое И). Кнопка «Сбросить фильтры» возвращает полный каталог. Счётчик «Показано книг: N из 50» обновляется для экранных дикторов (\`aria-live\`).
`;

mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs/CATALOG.md'), md, 'utf8');
console.log('docs/CATALOG.md written');
