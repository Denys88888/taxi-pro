export interface GeocodingResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  postcode?: string;
  aliases?: string[];
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
    postcode?: string;
    zipcode?: string;
  };
}


// ===== SEARCH LOGIC =====


// Extract text words (remove pure numbers like house numbers)




// Haversine distance
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ===== PUBLIC API =====

// Photon API cache (CORS-friendly geocoding)
const photonCache = new Map<string, GeocodingResult[]>();

async function fetchPhoton(query: string): Promise<GeocodingResult[]> {
  const cached = photonCache.get(query);
  if (cached) return cached;

  try {
    // Photon: free, CORS-friendly, worldwide geocoding
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results: GeocodingResult[] = (data.features || []).map((f: any) => {
      const p = f.properties || {};
      const [lon, lat] = f.geometry?.coordinates || [0, 0];
      // Build clean display name from components
      const parts: string[] = [];
      if (p.name && p.name !== p.street) parts.push(p.name);
      if (p.housenumber) parts.push(p.housenumber);
      if (p.street) parts.push(p.street);
      if (p.district && p.district !== p.city) parts.push(p.district);
      if (p.city) parts.push(p.city);
      if (p.state && p.state !== p.city) parts.push(p.state);
      if (p.country) parts.push(p.country);
      const displayName = parts.length > 0 ? parts.join(', ') : query;
      return {
        place_id: `osm_${p.osm_id || Math.random().toString(36).slice(2)}`,
        display_name: displayName,
        lat: String(lat),
        lon: String(lon),
        type: p.osm_type || 'place',
        importance: 0.5,
        postcode: p.postcode || '',
        address: {
          city: p.city,
          road: p.street,
          house_number: p.housenumber,
          suburb: p.district,
          postcode: p.postcode,
        },
      };
    });
    photonCache.set(query, results);
    return results;
  } catch {
    return [];
  }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  return fetchPhoton(query);
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await resp.json();
    const f = data.features?.[0];
    if (!f) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const p = f.properties || {};
    const parts: string[] = [];
    if (p.name && p.name !== p.street) parts.push(p.name);
    if (p.housenumber) parts.push(p.housenumber);
    if (p.street) parts.push(p.street);
    if (p.district && p.district !== p.city) parts.push(p.district);
    if (p.city) parts.push(p.city);
    if (p.country) parts.push(p.country);
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function autocompleteLocations(query: string, callback: (results: GeocodingResult[]) => void): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!query || query.trim().length < 2) { callback([]); return; }
  debounceTimer = setTimeout(async () => {
    const results = await searchLocations(query);
    callback(results);
  }, 250);
}
