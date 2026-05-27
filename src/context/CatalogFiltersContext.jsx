import { createContext, useContext, useMemo, useState } from 'react';

const CatalogFiltersContext = createContext(null);

export function CatalogFiltersProvider({ children }) {
  const [minRating, setMinRating] = useState(0);
  const [durationBucket, setDurationBucket] = useState('');
  const [viewsSort, setViewsSort] = useState('');

  const value = useMemo(
    () => ({
      minRating,
      durationBucket,
      viewsSort,
      setMinRating,
      setDurationBucket,
      setViewsSort,
      reset: () => {
        setMinRating(0);
        setDurationBucket('');
        setViewsSort('');
      },
    }),
    [minRating, durationBucket, viewsSort]
  );

  return <CatalogFiltersContext.Provider value={value}>{children}</CatalogFiltersContext.Provider>;
}

export function useCatalogFilters() {
  const ctx = useContext(CatalogFiltersContext);
  if (!ctx) throw new Error('useCatalogFilters must be used within CatalogFiltersProvider');
  return ctx;
}

