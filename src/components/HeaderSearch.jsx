import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import searchIcon from '../assets/search.svg';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

export default function HeaderSearch() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const mode = useMemo(() => {
    if (pathname === '/') return 'books';
    if (pathname === '/genres') return 'genres';
    if (pathname === '/authors') return 'authors';
    if (pathname === '/narrators') return 'narrators';
    return 'none';
  }, [pathname]);

  const label =
    mode === 'books'
      ? 'Поиск книг по названию'
      : mode === 'genres'
        ? 'Поиск жанров'
        : mode === 'authors'
          ? 'Поиск авторов'
          : mode === 'narrators'
            ? 'Поиск исполнителей'
          : '';

  const placeholder =
    mode === 'books'
      ? 'Поиск по названию книги…'
      : mode === 'genres'
        ? 'Поиск по жанру…'
        : mode === 'authors'
          ? 'Поиск по автору…'
          : mode === 'narrators'
            ? 'Поиск по исполнителю…'
          : '';

  const value = searchParams.get('q') || '';

  useEffect(() => {
    if (mode === 'none' && value) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (mode === 'none') return null;

  const setValue = (nextValue) => {
    const next = new URLSearchParams(searchParams);
    const v = normalize(nextValue);
    if (!v) next.delete('q');
    else next.set('q', nextValue);
    setSearchParams(next, { replace: true });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <div className="header-search" role="search" aria-label="Поиск">
      <form className="header-search__form" onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="header-search-input">
          {label}
        </label>
        <div className="header-search__input-wrap">
          <img className="header-search__icon" src={searchIcon} alt="" aria-hidden="true" />
          <input
            ref={inputRef}
            id="header-search-input"
            className="header-search__input"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            aria-label={label}
          />
        </div>
        {value ? (
          <button
            type="button"
            className="header-search__clear"
            onClick={() => setValue('')}
            aria-label="Очистить поиск"
          >
            Очистить
          </button>
        ) : null}
      </form>
    </div>
  );
}

