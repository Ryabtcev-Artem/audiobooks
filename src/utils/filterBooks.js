import { GENRES } from '../data/genres';

export const DURATION_BUCKETS = {
  short: { id: 'short', label: 'До 1 часа', max: 1 },
  medium: { id: 'medium', label: '1–5 часов', min: 1, max: 5 },
  long: { id: 'long', label: 'Больше 5 часов', min: 5 },
};

export function getDurationBucket(hours) {
  if (hours < 1) return 'short';
  if (hours <= 5) return 'medium';
  return 'long';
}

function getBookAuthors(book) {
  if (Array.isArray(book.authors) && book.authors.length > 0) return book.authors;
  if (typeof book.author === 'string' && book.author.trim()) return [book.author.trim()];
  return [];
}

export function filterBooks(books, { minRating = 0, genre = '', author = '', durationBucket = '' }) {
  return books.filter((book) => {
    if (book.rating < minRating) return false;
    if (genre && book.genre !== genre) return false;
    if (author) {
      const authors = getBookAuthors(book);
      if (!authors.includes(author)) return false;
    }
    if (durationBucket && getDurationBucket(book.durationHours) !== durationBucket) {
      return false;
    }
    return true;
  });
}

function countByField(books, field) {
  const map = new Map();
  for (const book of books) {
    const key = book[field];
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

function countByAuthors(books) {
  const map = new Map();
  for (const book of books) {
    for (const author of getBookAuthors(book)) {
      map.set(author, (map.get(author) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

function countByNarrators(books) {
  const map = new Map();
  for (const book of books) {
    for (const narrator of book.narrators || []) {
      map.set(narrator, (map.get(narrator) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getGenreStats(books) {
  const base = GENRES.map((g) => g.name);
  const counts = new Map(countByField(books, 'genre').map((x) => [x.name, x.count]));
  return base.map((name) => ({ name, count: counts.get(name) || 0 }));
}

export function getAuthorStats(books) {
  return countByAuthors(books);
}

export function getNarratorStats(books) {
  return countByNarrators(books);
}

export function decodeParam(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
