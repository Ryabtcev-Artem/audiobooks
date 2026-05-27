import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookFilters from '../components/BookFilters';
import BookList from '../components/BookList';
import books from '../data/books.json';
import { filterBooks } from '../utils/filterBooks';

const VIEWS_PREFIX = 'audiobooks1:views:';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function HomePage() {
  const [minRating, setMinRating] = useState(0);
  const [durationBucket, setDurationBucket] = useState('');
  const [viewsSort, setViewsSort] = useState('');
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredBooks = useMemo(() => {
    const base = filterBooks(books, { minRating, durationBucket });
    const q = normalize(query);
    const byQuery = !q ? base : base.filter((b) => normalize(b.title).includes(q));

    if (!viewsSort) return byQuery;

    const getViews = (bookId) => {
      try {
        return Number(localStorage.getItem(`${VIEWS_PREFIX}${bookId}`) ?? 0) || 0;
      } catch {
        return 0;
      }
    };

    const sorted = [...byQuery].sort((a, b) => {
      const va = getViews(a.id);
      const vb = getViews(b.id);
      return viewsSort === 'unpopular' ? va - vb : vb - va;
    });

    return sorted;
  }, [minRating, durationBucket, viewsSort, query]);

  const handleReset = () => {
    setMinRating(0);
    setDurationBucket('');
    setViewsSort('');
  };

  return (
    <>
      <h2 className="page-title">Каталог аудиокниг</h2>
      <BookFilters
        minRating={minRating}
        durationBucket={durationBucket}
        viewsSort={viewsSort}
        resultCount={filteredBooks.length}
        totalCount={books.length}
        onMinRatingChange={setMinRating}
        onDurationChange={setDurationBucket}
        onViewsSortChange={setViewsSort}
        onReset={handleReset}
      />

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
