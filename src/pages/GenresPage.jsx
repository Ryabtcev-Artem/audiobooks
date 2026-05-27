import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CatalogIndexList from '../components/CatalogIndexList';
import books from '../data/books.json';
import { getGenreStats } from '../utils/filterBooks';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function GenresPage() {
  const genres = useMemo(() => getGenreStats(books), []);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredGenres = useMemo(() => {
    const q = normalize(query);
    if (!q) return genres;
    return genres.filter((g) => normalize(g.name).includes(q));
  }, [genres, query]);

  return (
    <>
      <Link to="/" className="book-page__back">
        ← Назад к каталогу
      </Link>

      <h2 className="page-title">Жанры</h2>
      <CatalogIndexList
        items={filteredGenres}
        basePath="/genres"
        ariaLabel="Список жанров с количеством книг"
      />
    </>
  );
}
