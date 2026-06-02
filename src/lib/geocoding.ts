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

/**
 * Search for locations using Nominatim (OpenStreetMap)
 * @param query - Search query (e.g., "Times Square New York")
 * @returns Array of geocoding results
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'TaxiPro/1.0 (taxipro@example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = (await response.json()) as GeocodingResult[];
    return data || [];
  } catch (error) {
    console.error('[Geocoding] Search error:', error);
    return [];
  }
}

/**
 * Reverse geocode - get address from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
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
