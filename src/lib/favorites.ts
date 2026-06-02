export interface FavoriteAddress {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const STORAGE_KEY = 'taxipro_favorites';

export function getFavorites(): { home: FavoriteAddress | null; work: FavoriteAddress | null } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }

  // Default values
  return {
    home: null,
    work: null,
  };
}

export function saveFavorite(type: 'home' | 'work', fav: FavoriteAddress): void {
  const current = getFavorites();
  current[type] = fav;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function hasFavorites(): boolean {
  const f = getFavorites();
  return !!(f.home || f.work);
}
