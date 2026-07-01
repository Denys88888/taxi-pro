import { useEffect } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { GeoPoint } from '../../types';

// Colored pin built from a divIcon so we don't depend on Leaflet's image assets
// (which break under a non-root base path on GitHub Pages).
function pin(color: string, pulse = false): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative">
      ${pulse ? `<span style="position:absolute;inset:-8px;border-radius:9999px;background:${color};opacity:.3;animation:tp-pulse 1.6s ease-out infinite"></span>` : ''}
      <span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Recenter the map imperatively when the focus point changes.
function Recenter({ center }: { center: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);
  return null;
}

// Relays map tap coordinates to the parent (tap-to-select destination).
function ClickCapture({ onClick }: { onClick: (p: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface Props {
  center: GeoPoint;
  pickup?: GeoPoint | null;
  destination?: GeoPoint | null;
  driver?: GeoPoint | null;
  stops?: GeoPoint[];
  onMapClick?: (p: GeoPoint) => void;
  className?: string;
}

// The map surface: OSM tiles, pickup/stops/destination/driver markers, and a
// route line that threads through any intermediate stops.
export function MapView({
  center,
  pickup,
  destination,
  driver,
  stops = [],
  onMapClick,
  className,
}: Props) {
  const route: [number, number][] = [];
  if (pickup) route.push([pickup.lat, pickup.lng]);
  for (const s of stops) route.push([s.lat, s.lng]);
  if (destination) route.push([destination.lat, destination.lng]);

  return (
    <div className={className ?? 'h-full w-full overflow-hidden rounded-card'}>
      <LeafletMap
        center={[center.lat, center.lng]}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={driver ?? pickup ?? center} />
        {onMapClick && <ClickCapture onClick={onMapClick} />}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pin('#2979FF', true)} />}
        {stops.map((s, i) => (
          <Marker key={`stop-${i}`} position={[s.lat, s.lng]} icon={pin('#FFAB00')} />
        ))}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={pin('#FF1744')} />
        )}
        {driver && <Marker position={[driver.lat, driver.lng]} icon={pin('#00C853')} />}
        {route.length >= 2 && (
          <Polyline positions={route} pathOptions={{ color: '#7B3FE4', weight: 4 }} />
        )}
      </LeafletMap>
    </div>
  );
}
