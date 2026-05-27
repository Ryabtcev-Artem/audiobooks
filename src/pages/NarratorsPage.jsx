import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CatalogIndexList from '../components/CatalogIndexList';
import books from '../data/books.json';
import { getNarratorStats } from '../utils/filterBooks';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function NarratorsPage() {
  const narrators = useMemo(() => getNarratorStats(books), []);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredNarrators = useMemo(() => {
    const q = normalize(query);
    if (!q) return narrators;
    return narrators.filter((n) => normalize(n.name).includes(q));
  }, [narrators, query]);

  return (
    <>
      <Link to="/" className="book-page__back">
        ← Назад к каталогу
      </Link>

      <h2 className="page-title">Исполнители</h2>
      <p className="page-intro">
        Список исполнителей аудиокниг. Рядом указано, сколько книг озвучил
        каждый исполнитель.
      </p>

      <CatalogIndexList
        items={filteredNarrators}
        basePath="/narrators"
        ariaLabel="Список исполнителей с количеством книг"
      />
    </>
  );
}

