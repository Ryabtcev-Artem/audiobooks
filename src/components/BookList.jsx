import { useEffect, useMemo, useRef, useState } from 'react';
import BookCard from './BookCard';

const PAGE_SIZE = 5;

export default function BookList({ books }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // если фильтры меняют список — начинаем показ сначала
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [books]);

  const visibleBooks = useMemo(() => books.slice(0, visibleCount), [books, visibleCount]);
  const hasMore = visibleCount < books.length;

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, books.length));
  };

  // Ленивая подгрузка при скролле (и кнопка ниже как доступный fallback)
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, books.length]);

  return (
    <section>
      <p
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Показано {visibleBooks.length} из {books.length}
      </p>
      <ul id="book-list" className="book-list">
        {visibleBooks.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            index={index}
            className="book-card--enter"
            aria-label={book.title}
            style={{ '--enter-delay': `${index * 40}ms` }}
          />
        ))}
      </ul>

      {hasMore && (
        <div className="book-list__more">
          <button
            type="button"
            className="book-list__more-btn"
            onClick={loadMore}
            aria-controls="book-list"
          >
            Показать ещё
          </button>
          <div ref={sentinelRef} className="book-list__sentinel" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
