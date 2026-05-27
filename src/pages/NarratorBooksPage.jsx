import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookList from '../components/BookList';
import books from '../data/books.json';
import { decodeParam } from '../utils/filterBooks';

export default function NarratorBooksPage() {
  const { narratorSlug } = useParams();
  const narrator = decodeParam(narratorSlug);

  const narratorBooks = useMemo(
    () => books.filter((book) => (book.narrators || []).includes(narrator)),
    [narrator]
  );

  if (narratorBooks.length === 0) {
    return (
      <div className="not-found" role="alert">
        <h2 className="page-title">Исполнитель не найден</h2>
        <p>Книг исполнителя «{narrator}» нет в каталоге.</p>
        <Link to="/narrators" className="not-found__link">
          К списку исполнителей
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/narrators" className="book-page__back">
        ← Назад к исполнителям
      </Link>

      <h2 className="page-title">{narrator}</h2>
      <p className="page-intro" role="status">
        Книг исполнителя: {narratorBooks.length}
      </p>

      <BookList books={narratorBooks} />
    </>
  );
}

