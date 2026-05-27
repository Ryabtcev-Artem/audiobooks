import { Link } from 'react-router-dom';
import penIcon from '../assets/pen.svg';
import clockIcon from '../assets/clock.svg';

export default function BookCard({ book, index, className = '', style }) {
  const authors = Array.isArray(book?.authors) && book.authors.length > 0 ? book.authors : [book?.author].filter(Boolean);
  return (
    <li className={`book-card ${className}`.trim()} style={style}>
      <article aria-labelledby={`book-title-${book.id}`}>
        <div className="book-card__link" aria-describedby={`book-meta-${book.id}`}>
          <img
            src={book.cover}
            alt=""
            className="book-card__cover"
            width={200}
            height={300}
            loading="lazy"
          />
          <div className="book-card__body">
            <span className="book-card__number visually-hidden">
              Книга номер {index + 1}
            </span>
            <h2 id={`book-title-${book.id}`} className="book-card__title">
              <Link to={`/book/${book.id}`} className="book-card__title-link">
                {book.title}
              </Link>
            </h2>
            <div className='book-card__preview' id={`book-meta-${book.id}`}>
              <div className="book-card__author-wrap">
              <img
                className='book-card__pen'
                width="16" height="16" src={penIcon} alt="" aria-hidden="true" />
              
              <p className="book-card__author">
                {authors.length > 0
                  ? authors
                      .map((a, i) => (
                        <Link
                          key={`${a}-${i}`}
                          to={`/authors/${encodeURIComponent(a)}`}
                          className="book-card__meta-link"
                        >
                          {a}
                        </Link>
                      ))
                      .reduce((prev, curr, i) => [prev, i > 0 && ', ', curr])
                  : '—'}

              </p>
              </div>
            <div className="book-card__time-wrap">

                              <img
                className='book-card__clock'
                width="16" height="16" src={clockIcon} alt="" aria-hidden="true" />
                <p className="book-card__time">
                  {book.durationFormatted}
                </p>
            </div>

            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
