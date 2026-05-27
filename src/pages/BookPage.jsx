import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';
import books from '../data/books.json';
import eyeIcon from '../assets/eye.svg';

const VIEWS_PREFIX = 'audiobooks1:views:';
const VIEWED_PREFIX = 'audiobooks1:viewed:';

export default function BookPage() {
  const { id } = useParams();
  const book = books.find((b) => b.id === id);
  const [views, setViews] = useState(0);
  const authors = Array.isArray(book?.authors) && book.authors.length > 0 ? book.authors : [book?.author].filter(Boolean);
  const narrators = Array.isArray(book?.narrators) ? book.narrators.filter(Boolean) : [];

  if (!book) {
    return (
      <div className="not-found" role="alert">
        <h2 className="page-title">Книга не найдена</h2>
        <p>Запрошенная аудиокнига отсутствует в каталоге.</p>
        <Link to="/" className="not-found__link">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Проверяем наличие треков (глав)
  const hasTracks = book.tracks && book.tracks.length > 0;

  // Простейшие "просмотры" на localStorage: +1 один раз на пользователя/браузер для книги
  useEffect(() => {
    if (!book?.id) return;

    const viewsKey = `${VIEWS_PREFIX}${book.id}`;
    const viewedKey = `${VIEWED_PREFIX}${book.id}`;

    try {
      const current = Number(localStorage.getItem(viewsKey) ?? 0) || 0;
      const alreadyViewed = localStorage.getItem(viewedKey) === '1';

      if (!alreadyViewed) {
        const next = current + 1;
        localStorage.setItem(viewsKey, String(next));
        localStorage.setItem(viewedKey, '1');
        setViews(next);
      } else {
        setViews(current);
      }
    } catch {
      // если localStorage недоступен — просто ничего не делаем
    }
  }, [book?.id]);

  return (
    <article aria-labelledby="book-page-title">
      <Link to="/" className="book-page__back">
        ← Назад к каталогу
      </Link>

      <header className="book-page__header">
        <img
          src={book.cover}
          alt={`Обложка книги «${book.title}»`}
          className="book-page__cover"
          width={200}
          height={300}
        />
        <div className="book-page__info">
          <h2 id="book-page-title" className="book-page__title">
            {book.title}
          </h2>
          <p className="book-page__author">
            Автор{authors.length > 1 ? 'ы' : ''}:{' '}
            {authors.length > 0
              ? authors
                  .map((a, index) => (
                    <span key={`${a}-${index}`}>
                      {index > 0 ? <span aria-hidden="true">, </span> : null}
                      <Link
                        className="book-page__author-link"
                        to={`/authors/${encodeURIComponent(a)}`}
                      >
                        {a}
                      </Link>
                    </span>
                  ))
              : '—'}
          </p>
          <p className="book-page__meta">
            <span>Жанр: {book.genre}</span>
          </p>
          <p className="book-page__narrators">
            Чтец{narrators.length > 1 ? 'ы' : ''}:{' '}
            {narrators.length > 0
              ? narrators.map((narrator, index) => (
                  <span key={`${narrator}-${index}`}>
                    {index > 0 ? <span aria-hidden="true">, </span> : null}
                    <Link
                      to={`/narrators/${encodeURIComponent(narrator)}`}
                      className="book-page__narrator-link"
                    >
                      {narrator}
                    </Link>
                  </span>
                ))
              : '—'}
          </p>
          <p className="book-page__views">
            <img className="book-page__views-icon" src={eyeIcon} alt="" aria-hidden="true" />
            <span className="book-page__views-count">{views}</span>
          </p>
          <p className="book-page__duration-label">
            Длительность аудиоверсии: {book.duration} (
            {book.durationHours} часов)
          </p>
          {hasTracks}
        </div>
      </header>

      {hasTracks ? (
        <AudioPlayer bookId={book.id} title={book.title} tracks={book.tracks} />
      ) : (
        <p className="book-page__no-audio">
          Аудиоверсия пока недоступна.
        </p>
      )}
          <p className="book-page__description">{book.description}</p>

    </article>
  );
}
