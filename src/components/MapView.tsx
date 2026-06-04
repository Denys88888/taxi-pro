import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { useApp } from '@/contexts/AppContext';

// ─── Custom Icons ──────────────────────────────────────────────

const pickupIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <path d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z" fill="#00C853" filter="url(#glow)"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#00C853"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

const destinationIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z" fill="#FF5252"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#FF5252"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

const driverIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" fill="#00C853" stroke="white" stroke-width="2"/>
    <rect x="9" y="13" width="18" height="10" rx="3" fill="white"/>
    <circle cx="13" cy="24" r="2" fill="#A0A0A0"/>
    <circle cx="23" cy="24" r="2" fill="#A0A0A0"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// ─── Map Recenter Component ───────────────────────────────────

function MapController({ center, shouldCenter }: { center: LatLngExpression; shouldCenter: boolean }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (shouldCenter && !hasCentered.current) {
      map.setView(center, 14, { animate: true, duration: 0.5 });
      hasCentered.current = true;
    }
  }, [center, shouldCenter, map]);

  return null;
}

// ─── Map Click Handler ────────────────────────────────────────

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onClick]);
  return null;
}

// ─── MapView Component ─────────────────────────────────────────

interface MapViewProps {
  showRoute?: boolean;
  routeCoords?: [number, number][];
  driverLocation?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  clickPin?: { lat: number; lng: number } | null;
}

const clickPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z" fill="#FF9800"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#FF9800"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

export function MapView({
  showRoute = false,
  routeCoords = [],
  driverLocation,
  onMapClick,
  clickPin,
}: MapViewProps) {
  const { pickup, destination, currentRide } = useApp();

  const center: [number, number] = useMemo(() => {
    if (currentRide?.driver) {
      return [pickup.lat + 0.002, pickup.lng];
    }
    return [pickup.lat, pickup.lng];
  }, [pickup, currentRide]);

  const hasRoute = showRoute && routeCoords.length > 0;

  return (
    <div className="absolute inset-0 z-map">
      <MapContainer
        center={center}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} shouldCenter={!hasRoute} />
        <MapClickHandler onClick={onMapClick} />

        {/* Click pin (tap-to-select) */}
        {clickPin && (
          <Marker position={[clickPin.lat, clickPin.lng]} icon={clickPinIcon} />
        )}

        {/* Pickup marker */}
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />

        {/* Pickup pulse effect */}
        <CircleMarker
          center={[pickup.lat, pickup.lng]}
          radius={20}
          pathOptions={{
            fillColor: '#00C853',
            fillOpacity: 0.1,
            color: '#00C853',
            weight: 1,
            opacity: 0.3,
          }}
        />

        {/* Destination marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        )}

        {/* Driver marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
        )}

        {/* Route polyline */}
        {hasRoute && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#00C853',
              weight: 4,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Route shadow polyline */}
        {hasRoute && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#00C853',
              weight: 8,
              opacity: 0.2,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
