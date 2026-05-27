import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookList from '../components/BookList';
import books from '../data/books.json';
import { decodeParam, filterBooks } from '../utils/filterBooks';

export default function AuthorBooksPage() {
  const { authorSlug } = useParams();
  const author = decodeParam(authorSlug);

  const authorBooks = useMemo(
    () => filterBooks(books, { author }),
    [author]
  );

  if (authorBooks.length === 0) {
    return (
      <div className="not-found" role="alert">
        <h2 className="page-title">Автор не найден</h2>
        <p>Книг автора «{author}» нет в каталоге.</p>
        <Link to="/authors" className="not-found__link">
          К списку авторов
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/authors" className="book-page__back">
        ← Назад к авторам
      </Link>

      <h2 className="page-title">{author}</h2>
      <p className="page-intro" role="status">
        Книг автора: {authorBooks.length}
      </p>

      <BookList books={authorBooks} />
    </>
  );
}
