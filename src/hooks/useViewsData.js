import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://audiobooksbackend.onrender.com';

export function useViewsData(bookIds = []) {
  const [views, setViews] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookIds || bookIds.length === 0) return;

    const fetchAllViews = async () => {
      setLoading(true);
      try {
        const viewsData = {};
        
        // Загружаем просмотры для каждой книги параллельно
        const promises = bookIds.map(async (bookId) => {
          try {
            const response = await fetch(`${BACKEND_URL}/views/${encodeURIComponent(bookId)}`);
            if (response.ok) {
              const result = await response.json();
              viewsData[bookId] = Number(result.views ?? 0);
            } else {
              viewsData[bookId] = 0;
            }
          } catch {
            viewsData[bookId] = 0;
          }
        });

        await Promise.all(promises);
        setViews(viewsData);
      } catch (error) {
        console.error('Failed to fetch views:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllViews();
  }, [bookIds]);

  return { views, loading };
}
