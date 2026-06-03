export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export function watchPosition(callback: (pos: GeoPosition) => void): number {
  if (!navigator.geolocation) return -1;
  return navigator.geolocation.watchPosition(
    (pos) => callback({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }),
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

export function clearWatch(watchId: number): void {
  if (watchId >= 0) navigator.geolocation.clearWatch(watchId);
}
