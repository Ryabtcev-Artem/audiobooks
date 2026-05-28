import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookList from '../components/BookList';
import books from '../data/books.json';
import { filterBooks } from '../utils/filterBooks';
import { useCatalogFilters } from '../context/CatalogFiltersContext';
import { useViews } from '../context/ViewsContext';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function HomePage() {
  const { minRating, durationBucket, viewsSort } = useCatalogFilters();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // Получаем просмотры из контекста (загружаются один раз в App)
  const { views: viewsFromBackend } = useViews();

  const filteredBooks = useMemo(() => {
    const base = filterBooks(books, { minRating, durationBucket });
    const q = normalize(query);
    const byQuery = !q ? base : base.filter((b) => normalize(b.title).includes(q));

    if (!viewsSort) return byQuery;

    const sorted = [...byQuery].sort((a, b) => {
      const va = viewsFromBackend[a.id] ?? 0;
      const vb = viewsFromBackend[b.id] ?? 0;
      return viewsSort === 'unpopular' ? va - vb : vb - va;
    });

    return sorted;
  }, [minRating, durationBucket, viewsSort, query, viewsFromBackend]);

  return (
    <>
      {filteredBooks.length === 0 ? (
        <p className="filters__empty" role="status">
          Ничего не найдено. Измените условия фильтров или строку поиска.
        </p>
      ) : (
        <BookList books={filteredBooks} />
      )}
    </>
  );
}
