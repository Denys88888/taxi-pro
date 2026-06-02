import { getLang } from './i18n';

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

interface LocalLocation {
  name: string;
  address: string;
  lat: string;
  lng: string;
  city: string;
  country: string;
}

// ─── Local Fallback Locations ──────────────────────────────────

const LOCAL_LOCATIONS_RU: LocalLocation[] = [
  { name: 'Красная площадь', address: 'Красная площадь, Москва, Россия', lat: '55.7539', lng: '37.6208', city: 'Москва', country: 'Россия' },
  { name: 'Тверская улица', address: 'Тверская улица, Москва, Россия', lat: '55.7582', lng: '37.6173', city: 'Москва', country: 'Россия' },
  { name: 'Невский проспект', address: 'Невский проспект, Санкт-Петербург, Россия', lat: '59.9343', lng: '30.3351', city: 'Санкт-Петербург', country: 'Россия' },
  { name: 'Эрмитаж', address: 'Эрмитаж, Санкт-Петербург, Россия', lat: '59.9398', lng: '30.3146', city: 'Санкт-Петербург', country: 'Россия' },
  { name: 'Арбат', address: 'Старый Арбат, Москва, Россия', lat: '55.7495', lng: '37.5917', city: 'Москва', country: 'Россия' },
  { name: 'Площадь Революции', address: 'Площадь Революции, Москва, Россия', lat: '55.7567', lng: '37.6224', city: 'Москва', country: 'Россия' },
  { name: 'ВДНХ', address: 'ВДНХ, Москва, Россия', lat: '55.8268', lng: '37.6380', city: 'Москва', country: 'Россия' },
  { name: 'Собор Василия Блаженного', address: 'Красная площадь, 2, Москва, Россия', lat: '55.7525', lng: '37.6231', city: 'Москва', country: 'Россия' },
  { name: 'МГУ', address: 'Ленинские Горы, 1, Москва, Россия', lat: '55.7038', lng: '37.5288', city: 'Москва', country: 'Россия' },
  { name: 'Сочи', address: 'Сочи, Краснодарский край, Россия', lat: '43.6028', lng: '39.7342', city: 'Сочи', country: 'Россия' },
  { name: 'Казанский вокзал', address: 'Комсомольская площадь, 2, Москва, Россия', lat: '55.7733', lng: '37.6576', city: 'Москва', country: 'Россия' },
  { name: 'Парк Горького', address: 'Крымский вал, 9, Москва, Россия', lat: '55.7314', lng: '37.6034', city: 'Москва', country: 'Россия' },
  { name: 'Мариинский театр', address: 'Театральная площадь, 1, Санкт-Петербург, Россия', lat: '59.9258', lng: '30.2956', city: 'Санкт-Петербург', country: 'Россия' },
  { name: 'Байкал', address: 'Ольхон, Иркутская область, Россия', lat: '53.1732', lng: '107.3869', city: 'Иркутск', country: 'Россия' },
];

const LOCAL_LOCATIONS_EN: LocalLocation[] = [
  { name: 'Times Square', address: 'Times Square, New York, NY, USA', lat: '40.7580', lng: '-73.9855', city: 'New York', country: 'USA' },
  { name: 'Central Park', address: 'Central Park, New York, NY, USA', lat: '40.7851', lng: '-73.9683', city: 'New York', country: 'USA' },
  { name: 'Empire State Building', address: '20 W 34th St, New York, NY, USA', lat: '40.7484', lng: '-73.9857', city: 'New York', country: 'USA' },
  { name: 'Golden Gate Bridge', address: 'Golden Gate Bridge, San Francisco, CA, USA', lat: '37.8199', lng: '-122.4783', city: 'San Francisco', country: 'USA' },
  { name: 'Hollywood Sign', address: 'Hollywood Sign, Los Angeles, CA, USA', lat: '34.1341', lng: '-118.3215', city: 'Los Angeles', country: 'USA' },
  { name: 'Statue of Liberty', address: 'Liberty Island, New York, NY, USA', lat: '40.6892', lng: '-74.0445', city: 'New York', country: 'USA' },
  { name: 'White House', address: '1600 Pennsylvania Avenue, Washington, DC, USA', lat: '38.8977', lng: '-77.0365', city: 'Washington', country: 'USA' },
  { name: 'Big Ben', address: 'Westminster, London, UK', lat: '51.4994', lng: '-0.1245', city: 'London', country: 'UK' },
  { name: 'Eiffel Tower', address: 'Champ de Mars, Paris, France', lat: '48.8584', lng: '2.2945', city: 'Paris', country: 'France' },
  { name: 'Colosseum', address: 'Piazza del Colosseo, Rome, Italy', lat: '41.8902', lng: '12.4922', city: 'Rome', country: 'Italy' },
  { name: 'Sydney Opera House', address: 'Bennelong Point, Sydney, Australia', lat: '-33.8568', lng: '151.2153', city: 'Sydney', country: 'Australia' },
  { name: 'Burj Khalifa', address: '1 Sheikh Mohammed bin Rashid Blvd, Dubai, UAE', lat: '25.1972', lng: '55.2744', city: 'Dubai', country: 'UAE' },
  { name: 'Berlin Wall', address: 'East Side Gallery, Berlin, Germany', lat: '52.5050', lng: '13.4397', city: 'Berlin', country: 'Germany' },
  { name: 'CN Tower', address: '301 Front St W, Toronto, Canada', lat: '43.6426', lng: '-79.3871', city: 'Toronto', country: 'Canada' },
  { name: 'Tokyo Tower', address: '4 Chome-2-8 Shibakoen, Tokyo, Japan', lat: '35.6586', lng: '139.7454', city: 'Tokyo', country: 'Japan' },
];

function getLocalLocations(): LocalLocation[] {
  return getLang() === 'ru' ? LOCAL_LOCATIONS_RU : LOCAL_LOCATIONS_EN;
}

function localToGeocodingResult(loc: LocalLocation): GeocodingResult {
  return {
    place_id: `local_${loc.name}`,
    display_name: loc.address,
    lat: loc.lat,
    lon: loc.lng,
    type: 'local',
    importance: 1,
    address: {
      city: loc.city,
      country: loc.country,
    },
  };
}

function searchLocalLocations(query: string): GeocodingResult[] {
  const q = query.trim().toLowerCase();
  const locations = getLocalLocations();
  if (!q) return locations.slice(0, 8).map(localToGeocodingResult);
  const matches = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q)
  );
  return matches.map(localToGeocodingResult);
}

/**
 * Search for locations using Nominatim (OpenStreetMap) with local fallback
 * @param query - Search query (e.g., "Times Square New York")
 * @returns Array of geocoding results
 */
// Helper: fetch with timeout
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const q = query?.trim() || '';
  if (!q) return [];

  // Always show local results first (instant)
  const localResults = searchLocalLocations(q);

  // If short query, return only local (fast)
  if (q.length < 3) return localResults;

  const encodedQuery = encodeURIComponent(q);
  const lang = getLang();
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1&accept-language=${lang === 'ru' ? 'ru,en' : 'en'}`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept-Language': lang === 'ru' ? 'ru' : 'en',
        'User-Agent': 'TaxiPro/1.0',
      },
    }, 3000);

    if (!response.ok) {
      return localResults;
    }

    const data = (await response.json()) as GeocodingResult[];
    if (data && data.length > 0) {
      // Merge Nominatim + local results (Nominatim first)
      return [...data, ...localResults.filter(l => !data.some(d => d.display_name === l.display_name))];
    }
    return localResults;
  } catch {
    // Timeout or network error — return local results instantly
    return localResults;
  }
}

/**
 * Get local suggestions for a partial query (useful for query < 2 chars)
 */
export function getLocalSuggestions(query: string): GeocodingResult[] {
  if (!query || query.trim().length === 0) return [];
  return searchLocalLocations(query).slice(0, 6);
}

/**
 * Reverse geocode - get address from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const lang = getLang();
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${lang === 'ru' ? 'ru' : 'en'}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': lang === 'ru' ? 'ru' : 'en',
        'User-Agent': 'TaxiPro/1.0 (taxipro@example.com)',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('[Geocoding] Reverse geocode error:', error);
    return null;
  }
}
