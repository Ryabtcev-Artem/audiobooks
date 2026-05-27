import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CatalogIndexList from '../components/CatalogIndexList';
import books from '../data/books.json';
import { getAuthorStats } from '../utils/filterBooks';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function AuthorsPage() {
  const authors = useMemo(() => getAuthorStats(books), []);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredAuthors = useMemo(() => {
    const q = normalize(query);
    if (!q) return authors;
    return authors.filter((a) => normalize(a.name).includes(q));
  }, [authors, query]);

  return (
    <>
      <Link to="/" className="book-page__back">
        ← Назад к каталогу
      </Link>

      <h2 className="page-title">Авторы</h2>
      <p className="page-intro">
        Все авторы в библиотеке. Число в скобках — количество их книг. Нажмите
        Enter, чтобы открыть список произведений автора.
      </p>

      <CatalogIndexList
        items={filteredAuthors}
        basePath="/authors"
        ariaLabel="Список авторов с количеством книг"
      />
    </>
  );
}
