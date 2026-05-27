import { DURATION_BUCKETS } from '../utils/filterBooks';

export default function BookFilters({
  minRating,
  durationBucket,
  viewsSort,
  resultCount,
  totalCount,
  onMinRatingChange,
  onDurationChange,
  onViewsSortChange,
  onReset,
}) {
  const hasActiveFilters = minRating > 0 || durationBucket !== '' || viewsSort !== '';

  return (
    <section className="filters" aria-labelledby="filters-heading">
      <h2 id="filters-heading" className="filters__title visually-hidden">
        Фильтры каталога
      </h2>

      <form
        className="filters__form"
        onSubmit={(e) => e.preventDefault()}
        aria-describedby="filters-result-count"
      >

        <div className="filters__field">
          <label htmlFor="filter-duration" className="filters__label visually-hidden">
            Длительность аудиоверсии
          </label>
          <select
            id="filter-duration"
            className="filters__select"
            value={durationBucket}
            onChange={(e) => onDurationChange(e.target.value)}
          >
            <option value="">Длительность</option>
            {Object.values(DURATION_BUCKETS).map((bucket) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filters__field">
          <label htmlFor="filter-views" className="filters__label visually-hidden">
            Популярность (просмотры)
          </label>
          <select
            id="filter-views"
            className="filters__select"
            value={viewsSort}
            onChange={(e) => onViewsSortChange(e.target.value)}
          >
            <option value="">Популярность</option>
            <option value="popular">Популярные</option>
            <option value="unpopular">Непопулярные</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="filters__reset"
            onClick={onReset}
            aria-label="Сбросить все фильтры"
          >
            Сбросить фильтры
          </button>
        )}
      </form>

      <p
        id="filters-result-count"
        className="filters__count"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Показано книг: {resultCount} из {totalCount}
      </p>
    </section>
  );
}
