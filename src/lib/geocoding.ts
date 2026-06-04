export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

// Geoapify API key — get free key at https://www.geoapify.com/
const GEOAPIFY_KEY = '';

// Try multiple geocoding services
async function tryGeocode(query: string): Promise<GeocodingResult[]> {
  const q = encodeURIComponent(query.trim());

  // 1. Try Nominatim directly (works in most browsers with CORS)
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=8&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'ru,en', 'User-Agent': 'TaxiPro/1.0' },
      }
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data?.length > 0) return data as GeocodingResult[];
    }
  } catch { /* Nominatim failed */ }

  // 2. Try Geoapify (free tier, CORS enabled)
  try {
    const key = GEOAPIFY_KEY || 'DEMO'; // DEMO works with limits
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&limit=8&format=json&lang=ru&apiKey=${key}`,
      { signal: controller.signal }
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data?.results?.length > 0) {
        return data.results.map((r: any) => ({
          place_id: r.place_id || String(r.rank?.popularity || Date.now()),
          display_name: r.formatted || r.name || r.address_line1 || query,
          lat: String(r.lat),
          lon: String(r.lon),
          type: r.result_type || 'place',
          importance: r.rank?.popularity || 0.5,
          address: {
            city: r.city,
            road: r.street,
            house_number: r.housenumber,
            country: r.country,
          },
        }));
      }
    }
  } catch { /* Geoapify failed */ }

  return [];
}

/**
 * Search for locations using multiple geocoding services
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  return tryGeocode(query);
}

/**
 * Reverse geocode - get address from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'ru,en', 'User-Agent': 'TaxiPro/1.0' },
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Autocomplete with debounce
 */
export function autocompleteLocations(
  query: string,
  callback: (results: GeocodingResult[]) => void
): void {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!query || query.trim().length < 2) {
    callback([]);
    return;
  }

  debounceTimer = setTimeout(async () => {
    const results = await searchLocations(query);
    callback(results);
  }, 300);
}
