import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookPage from './pages/BookPage';
import GenresPage from './pages/GenresPage';
import GenreBooksPage from './pages/GenreBooksPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorBooksPage from './pages/AuthorBooksPage';
import NarratorsPage from './pages/NarratorsPage';
import NarratorBooksPage from './pages/NarratorBooksPage';
import { ViewsProvider } from './context/ViewsContext';
import books from './data/books.json';

export default function App() {
  return (
    <ViewsProvider bookIds={books.map(b => b.id)}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="genres" element={<GenresPage />} />
            <Route path="genres/:genreSlug" element={<GenreBooksPage />} />
            <Route path="authors" element={<AuthorsPage />} />
            <Route path="authors/:authorSlug" element={<AuthorBooksPage />} />
            <Route path="narrators" element={<NarratorsPage />} />
            <Route path="narrators/:narratorSlug" element={<NarratorBooksPage />} />
            <Route path="book/:id" element={<BookPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ViewsProvider>
  );
}
