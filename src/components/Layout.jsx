import { NavLink, Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import books from '../data/books.json';
import { filterBooks, getAuthorStats, getGenreStats, getNarratorStats } from '../utils/filterBooks';
import HeaderSearch from './HeaderSearch';
import BookFilters from './BookFilters';
import { CatalogFiltersProvider, useCatalogFilters } from '../context/CatalogFiltersContext';

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('ru');
}

function HeaderCatalogFilters() {
  const { pathname } = useLocation();
  const { minRating, durationBucket, viewsSort, setMinRating, setDurationBucket, setViewsSort, reset } = useCatalogFilters();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  if (pathname !== '/') return null;

  const resultCount = (() => {
    const base = filterBooks(books, { minRating, durationBucket });
    const q = normalize(query);
    if (!q) return base.length;
    return base.filter((b) => normalize(b.title).includes(q)).length;
  })();

  return (
    <BookFilters
      minRating={minRating}
      durationBucket={durationBucket}
      viewsSort={viewsSort}
      resultCount={resultCount}
      totalCount={books.length}
      onMinRatingChange={setMinRating}
      onDurationChange={setDurationBucket}
      onViewsSortChange={setViewsSort}
      onReset={reset}
    />
  );
}

export default function Layout() {
  const genreCount = getGenreStats(books).length;
  const authorCount = getAuthorStats(books).length;
  const narratorCount = getNarratorStats(books).length;

  return (
    <CatalogFiltersProvider>
      <div className="layout">
      <header className="layout__header" role="banner">
        <Link style={{ textDecoration: 'none', color: 'inherit' }} to="/">
          <h1 className="layout__title">Голоса книг</h1>
        </Link>
        <nav className="layout__nav" aria-label="Основная навигация">
          <ul className="layout__nav-list" role="list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
                }
                aria-label={`Каталог аудиокниг, всего ${books.length}`}
              >
                Каталог
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/genres"
                className={({ isActive }) =>
                  `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
                }
              >
                <span>Жанры</span>{' '}
                <span className="layout__nav-count" aria-hidden="true">
                  ({genreCount})
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/authors"
                className={({ isActive }) =>
                  `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
                }
              >
                <span>Авторы</span>{' '}
                <span className="layout__nav-count" aria-hidden="true">
                  ({authorCount})
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/narrators"
                className={({ isActive }) =>
                  `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
                }
              >
                <span>Исполнители</span>{' '}
                <span className="layout__nav-count" aria-hidden="true">
                  ({narratorCount})
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <HeaderSearch />
        <HeaderCatalogFilters />
      </header>

      <main id="main-content" className="layout__main" role="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="layout__footer" role="contentinfo">
        <p>
          © {new Date().getFullYear()} Голоса книг. Сайт создан для
          незрячих и слабовидящих пользователей.
        </p>
      </footer>
      </div>
    </CatalogFiltersProvider>
  );
}
