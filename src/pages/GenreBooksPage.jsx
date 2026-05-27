import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookList from '../components/BookList';
import books from '../data/books.json';
import { decodeParam, filterBooks } from '../utils/filterBooks';

export default function GenreBooksPage() {
  const { genreSlug } = useParams();
  const genre = decodeParam(genreSlug);

  const genreBooks = useMemo(
    () => filterBooks(books, { genre }),
    [genre]
  );

  if (genreBooks.length === 0) {
    return (
      <div className="not-found" role="alert">
        <h2 className="page-title">Жанр не найден</h2>
        <p>Книг в жанре «{genre}» нет в каталоге.</p>
        <Link to="/genres" className="not-found__link">
          К списку жанров
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/genres" className="book-page__back">
        ← Назад к жанрам
      </Link>

      <h2 className="page-title">{genre}</h2>
      <p className="page-intro" role="status">
        Книг в жанре: {genreBooks.length}
      </p>

      <BookList books={genreBooks} />
    </>
  );
}
