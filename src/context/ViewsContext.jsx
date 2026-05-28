import { createContext, useContext, useEffect, useState } from 'react';

const ViewsContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://audiobooksbackend.onrender.com';

export function ViewsProvider({ children, bookIds = [] }) {
  const [views, setViews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllViews = async () => {
      try {
        const viewsData = {};
        
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

    if (bookIds.length > 0) {
      fetchAllViews();
    } else {
      setLoading(false);
    }
  }, [bookIds]);

  return (
    <ViewsContext.Provider value={{ views, loading }}>
      {children}
    </ViewsContext.Provider>
  );
}

export function useViews() {
  const context = useContext(ViewsContext);
  if (!context) {
    throw new Error('useViews must be used within ViewsProvider');
  }
  return context;
}
