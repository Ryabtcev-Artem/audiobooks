import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookPage from './pages/BookPage';
import GenresPage from './pages/GenresPage';
import GenreBooksPage from './pages/GenreBooksPage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorBooksPage from './pages/AuthorBooksPage';
import NarratorsPage from './pages/NarratorsPage';
import NarratorBooksPage from './pages/NarratorBooksPage';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
