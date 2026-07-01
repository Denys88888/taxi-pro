import type { GeoPoint } from '../types';

// Geocoding via OpenStreetMap Nominatim (no API key). Be a good citizen: results
// are debounced by the caller and requests carry a descriptive UA-equivalent.

const NOMINATIM = 'https://nominatim.openstreetmap.org';

export interface AddressResult {
  displayName: string;
  lat: number;
  lng: number;
}

// Forward geocode: free-text query → candidate addresses.
export async function searchAddress(query: string): Promise<AddressResult[]> {
  if (query.trim().length < 3) return [];
  const url = `${NOMINATIM}/search?format=json&limit=6&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return data.map((d) => ({
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}

// Reverse geocode: coordinates → human-readable address.
export async function reverseGeocode(point: GeoPoint): Promise<string> {
  const url = `${NOMINATIM}/reverse?format=json&lat=${point.lat}&lon=${point.lng}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return '';
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? '';
  } catch {
    return '';
  }
}
