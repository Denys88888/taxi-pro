import { useEffect, useState, useCallback } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from 'leaflet';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons using SVG
const pickupIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z" fill="#27ae60"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#27ae60"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

const destinationIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z" fill="#e74c3c"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <path d="M16 16l8 8M24 16l-8 8" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

const driverIcon = L.divIcon({
  className: 'custom-pin',
  html: `<svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" fill="#2c3e50" stroke="white" stroke-width="2"/>
    <rect x="10" y="14" width="16" height="10" rx="3" fill="white"/>
    <rect x="13" y="10" width="10" height="6" rx="2" fill="#34495e"/>
    <circle cx="13" cy="26" r="2" fill="#9ca3af"/>
    <circle cx="23" cy="26" r="2" fill="#9ca3af"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map controller component for programmatic control
function MapController({
  center,
}: {
  center: LatLngTuple;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

// Default center (will be updated when geolocation is available)
const DEFAULT_CENTER: LatLngTuple = [37.7749, -122.4194]; // San Francisco

interface MapContainerProps {
  center?: LatLngTuple;
  pickupLocation?: LatLngTuple;
  destinationLocation?: LatLngTuple;
  driverLocation?: LatLngTuple;
  showUserLocation?: boolean;
  onMapClick?: (latlng: LatLngTuple) => void;
  children?: React.ReactNode;
}

export function MapContainer({
  center,
  pickupLocation,
  destinationLocation,
  driverLocation,
  showUserLocation = true,
  onMapClick,
  children,
}: MapContainerProps) {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(center || DEFAULT_CENTER);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  useEffect(() => {
    if (showUserLocation && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LatLngTuple = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          if (!center) {
            setMapCenter(loc);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [showUserLocation, center]);

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
    [onMapClick]
  );

  const MapClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      if (onMapClick) {
        map.on('click', handleClick);
        return () => {
          map.off('click', handleClick);
        };
      }
    }, [map]);
    return null;
  };

  return (
    <div className="absolute inset-0 z-map">
      <LeafletMap
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={false}
        touchZoom
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />
        <MapClickHandler />

        {/* User location with accuracy circle */}
        {userLocation && showUserLocation && (
          <>
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{ fillColor: '#3498db', fillOpacity: 0.1, color: '#3498db', weight: 1, opacity: 0.3 }}
            />
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location',
                html: `<div style="width:16px;height:16px;background:#3498db;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            />
          </>
        )}

        {/* Pickup marker */}
        {pickupLocation && <Marker position={pickupLocation} icon={pickupIcon} />}

        {/* Destination marker */}
        {destinationLocation && <Marker position={destinationLocation} icon={destinationIcon} />}

        {/* Driver marker */}
        {driverLocation && <Marker position={driverLocation} icon={driverIcon} />}
      </LeafletMap>

      {/* Overlay children */}
      {children}
    </div>
  );
}
