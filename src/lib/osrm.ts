export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  polyline: string; // encoded polyline
  decodedPolyline: [number, number][]; // decoded as [lat, lng][]
}

/**
 * Get a driving route between two points using OSRM
 * @param fromLat - Starting latitude
 * @param fromLng - Starting longitude
 * @param toLat - Destination latitude
 * @param toLng - Destination longitude
 */
export async function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('[OSRM] No route found');
      return null;
    }

    const route = data.routes[0];
    const encodedPolyline = route.geometry;

    // Decode the polyline manually (fallback for when PolylineUtil is not available)
    const decodedCoords: [number, number][] = decodePolylineManual(encodedPolyline);

    return {
      distance: route.distance / 1000, // convert meters to km
      duration: Math.round(route.duration / 60), // convert seconds to minutes
      polyline: encodedPolyline,
      decodedPolyline: decodedCoords,
    };
  } catch (error) {
    console.error('[OSRM] Route fetch error:', error);
    return null;
  }
}

/**
 * Manual polyline decoder (fallback if PolylineUtil is not available)
 * Decodes Google's encoded polyline format
 */
function decodePolylineManual(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}
