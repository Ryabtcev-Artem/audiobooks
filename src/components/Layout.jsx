import { NavLink, Link, Outlet } from 'react-router-dom';
import books from '../data/books.json';
import { getAuthorStats, getGenreStats, getNarratorStats } from '../utils/filterBooks';
import HeaderSearch from './HeaderSearch';

export default function Layout() {
  const genreCount = getGenreStats(books).length;
  const authorCount = getAuthorStats(books).length;
  const narratorCount = getNarratorStats(books).length;

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>

      <header className="layout__header" role="banner">
        <Link style={{ textDecoration: 'none', color: 'inherit' }} to="/" aria-label="Голосовая библиотека — на главную">
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
                aria-label={`Жанры, всего ${genreCount}`}
              >
                Жанры{' '}
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
                aria-label={`Авторы, всего ${authorCount}`}
              >
                Авторы{' '}
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
                aria-label={`Исполнители, всего ${narratorCount}`}
              >
                Исполнители{' '}
                <span className="layout__nav-count" aria-hidden="true">
                  ({narratorCount})
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <HeaderSearch />
      </header>

      <main id="main-content" className="layout__main" role="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="layout__footer" role="contentinfo">
        <p>
          © {new Date().getFullYear()} Голосовая библиотека. Сайт создан для
          незрячих и слабовидящих пользователей.
        </p>
      </footer>
    </div>
  );
}
