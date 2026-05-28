import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src', 'data', 'books.json');
const backupPath = filePath + '.bak';

const raw = fs.readFileSync(filePath, 'utf8');
const books = JSON.parse(raw);

// Keep books that have tracks array with at least one entry and are not explicitly inactive
const filtered = books.filter((b) => {
  if (!b) return false;
  if (b.active === false) return false;
  if (!Array.isArray(b.tracks)) return false;
  if (b.tracks.length === 0) return false;
  return true;
});

const reindexed = filtered.map((b, bookIdx) => {
  const copy = { ...b };
  copy.id = String(bookIdx + 1);
  // Ensure tracks exist and renumber their index sequentially
  copy.tracks = (Array.isArray(b.tracks) ? b.tracks : []).map((t, i) => ({ ...t, index: i + 1 }));
  return copy;
});

fs.copyFileSync(filePath, backupPath);
fs.writeFileSync(filePath, JSON.stringify(reindexed, null, 2) + '\n', 'utf8');

console.log('Processed', books.length, '->', reindexed.length, 'books. Backup at', backupPath);
