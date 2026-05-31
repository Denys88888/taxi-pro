import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, X, MapPin, ChevronUp } from 'lucide-react';
import { MapContainer } from '@/components/MapContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PriceDisplay } from '@/components/PriceDisplay';
import type { LatLngTuple } from 'leaflet';
import React from 'react';

// ─── Types ─────────────────────────────────────────────────────

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_CENTER: LatLngTuple = [37.7749, -122.4194];

const RECENT_SEARCHES_KEY = 'piride_recent_searches';

// ─── Helper Functions ──────────────────────────────────────────

function saveRecentSearch(location: LocationData) {
  const recentStr = sessionStorage.getItem(RECENT_SEARCHES_KEY);
  const recent: LocationData[] = recentStr ? JSON.parse(recentStr) : [];
  const filtered = recent.filter(
    (r) => r.lat !== location.lat || r.lng !== location.lng
  );
  const updated = [location, ...filtered].slice(0, 10);
  sessionStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || 'Unknown location';
  } catch {
    return 'Unknown location';
  }
}

async function fetchRouteDistance(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ distance: number; duration: number } | null> {
  try {
    const res = await fetch(
      `http://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
    );
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return {
        distance: data.routes[0].distance / 1000,
        duration: data.routes[0].duration,
      };
    }
  } catch (err) {
    console.warn('OSRM error:', err);
  }
  return null;
}

function calculatePrice(distanceKm: number): {
  base: number;
  distancePrice: number;
  subtotal: number;
  commission: number;
  total: number;
  driverGets: number;
} {
  const base = 2.0;
  const distancePrice = distanceKm * 1.2;
  const subtotal = base + distancePrice;
  const commission = subtotal * 0.02;
  const total = subtotal + commission;
  return {
    base: Number(base.toFixed(2)),
    distancePrice: Number(distancePrice.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    total: Number(total.toFixed(2)),
    driverGets: Number(subtotal.toFixed(2)),
  };
}

// ─── Pickup Pin Pulse ──────────────────────────────────────────

const PickupPinPulse = React.memo(function PickupPinPulse() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[38px] pointer-events-none z-map-overlay">
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-emerald"
        animate={{ scale: [1, 2], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <svg width="36" height="44" viewBox="0 0 40 48" fill="none">
        <path
          d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z"
          fill="#27ae60"
        />
        <circle cx="20" cy="20" r="8" fill="white" />
        <circle cx="20" cy="20" r="4" fill="#27ae60" />
      </svg>
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white rounded-piride-sm shadow-sm px-2 py-0.5 whitespace-nowrap">
        <span className="text-xs font-medium text-text-primary">Pickup</span>
      </div>
    </div>
  );
});

// ─── Main Page ─────────────────────────────────────────────────

export default function Ride() {
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState<LatLngTuple>(DEFAULT_CENTER);
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<ReturnType<typeof calculatePrice> | null>(null);
  const [isUserLocating, setIsUserLocating] = useState(false);

  // ── Geolocation on mount ──
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: LatLngTuple = [position.coords.latitude, position.coords.longitude];
          setMapCenter(loc);
          const address = await reverseGeocode(loc[0], loc[1]);
          setPickupLocation({ lat: loc[0], lng: loc[1], address });
        },
        () => {
          setPickupLocation({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], address: 'San Francisco, CA' });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // ── Check for destination from search ──
  useEffect(() => {
    const destData = sessionStorage.getItem('piride_destination');
    if (destData) {
      try {
        const dest: LocationData = JSON.parse(destData);
        setDestination(dest);
        sessionStorage.removeItem('piride_destination');
        saveRecentSearch(dest);
      } catch { /* ignore */ }
    }
  }, []);

  // ── Fetch route when both locations set ──
  useEffect(() => {
    if (pickupLocation && destination) {
      fetchRouteDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        destination.lat,
        destination.lng
      ).then((info) => {
        if (info) {
          setRouteInfo(info);
          setPriceBreakdown(calculatePrice(info.distance));
        }
      });
    }
  }, [pickupLocation, destination]);

  // ── Go to current location ──
  const goToCurrentLocation = useCallback(() => {
    setIsUserLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LatLngTuple = [position.coords.latitude, position.coords.longitude];
          setMapCenter(loc);
          setIsUserLocating(false);
        },
        () => setIsUserLocating(false),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // ── Open search ──
  const openSearch = useCallback(() => {
    if (pickupLocation) {
      sessionStorage.setItem('piride_pickup', JSON.stringify(pickupLocation));
    }
    navigate('/search');
  }, [navigate, pickupLocation]);

  // ── Clear destination ──
  const clearDestination = useCallback(() => {
    setDestination(null);
    setRouteInfo(null);
    setPriceBreakdown(null);
  }, []);

  // ── Book ride → preview ──
  const goToPreview = useCallback(() => {
    if (pickupLocation && destination && routeInfo && priceBreakdown) {
      sessionStorage.setItem('piride_preview_pickup', JSON.stringify(pickupLocation));
      sessionStorage.setItem('piride_preview_destination', JSON.stringify(destination));
      sessionStorage.setItem('piride_preview_route', JSON.stringify(routeInfo));
      sessionStorage.setItem('piride_preview_price', JSON.stringify(priceBreakdown));
      navigate('/preview');
    }
  }, [navigate, pickupLocation, destination, routeInfo, priceBreakdown]);

  // ── Map markers ──
  const pickupTuple = pickupLocation
    ? ([pickupLocation.lat, pickupLocation.lng] as LatLngTuple)
    : undefined;
  const destTuple = destination
    ? ([destination.lat, destination.lng] as LatLngTuple)
    : undefined;

  return (
    <div className="mobile-container bg-offwhite relative overflow-hidden">
      {/* ── Full-screen Map ── */}
      <div className="absolute inset-0 z-map">
        <MapContainer
          center={mapCenter}
          pickupLocation={pickupTuple}
          destinationLocation={destTuple}
          showUserLocation={!destination}
        />
      </div>

      {/* ── Center Pickup Pin (when no destination) ── */}
      {!destination && <PickupPinPulse />}

      {/* ── Floating Search Bar ── */}
      <motion.div
        className="absolute top-4 left-4 right-4 z-floating"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay: 0.3 }}
      >
        <motion.button
          className="w-full h-[52px] bg-white rounded-piride-lg shadow-md flex items-center gap-3 px-4 text-left"
          onClick={openSearch}
          whileTap={{ scale: 0.98 }}
        >
          <Search size={20} className="text-text-tertiary shrink-0" />
          {destination ? (
            <>
              <span className="flex-1 text-base text-text-primary truncate">
                {destination.name || destination.address}
              </span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => { e.stopPropagation(); clearDestination(); }}
                className="shrink-0"
              >
                <X size={18} className="text-text-tertiary" />
              </motion.button>
            </>
          ) : (
            <>
              <span className="flex-1 text-base text-text-tertiary">Where to?</span>
              <Navigation size={20} className="text-navy shrink-0" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ── Current Location FAB ── */}
      <motion.button
        className="absolute right-4 bottom-28 z-floating w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center"
        onClick={goToCurrentLocation}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      >
        <Navigation
          size={20}
          className={isUserLocating ? 'text-emerald' : 'text-navy'}
        />
      </motion.button>

      {/* ── Bottom Sheet ── */}
      <AnimatePresence>
        {destination && priceBreakdown && routeInfo ? (
          <motion.div
            key="destination-sheet"
            className="absolute bottom-0 left-0 right-0 z-bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-black/10 -top-[100dvh]" />

            <div className="relative bg-white rounded-t-piride-xl shadow-lg">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-midgray rounded-full" />
              </div>

              <div className="px-4 pb-6">
                <motion.div
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-emerald" />
                    <span className="text-sm text-text-secondary">
                      {routeInfo.distance.toFixed(1)} km
                    </span>
                  </div>
                  <div className="w-px h-4 bg-midgray" />
                  <span className="text-sm text-text-secondary">
                    ~{Math.ceil(routeInfo.duration / 60)} min
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <PriceDisplay amount={priceBreakdown.total} size="large" showFee />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <PrimaryButton onClick={goToPreview}>
                    Book Ride
                  </PrimaryButton>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hint-sheet"
            className="absolute bottom-0 left-0 right-0 z-bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 0.2 }}
          >
            <div className="relative bg-white rounded-t-piride-xl shadow-lg">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-midgray rounded-full" />
              </div>
              <div className="px-4 pb-6 text-center">
                <p className="text-base text-text-secondary">
                  Set your destination to get started
                </p>
                <ChevronUp size={20} className="mx-auto mt-2 text-text-tertiary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar spacer ── */}
      <div className="fixed bottom-0 left-0 right-0 h-16 z-floating pointer-events-none" style={{ maxWidth: 430, margin: '0 auto' }} />
    </div>
  );
}
