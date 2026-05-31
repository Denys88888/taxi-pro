import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  X,
  Navigation,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

// ─── Constants ─────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = 'piride_recent_searches';

// ─── Helper Functions ──────────────────────────────────────────

function loadRecentSearches(): LocationData[] {
  try {
    const stored = sessionStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return getDefaultRecentSearches();
}

function saveRecentSearch(location: LocationData) {
  const recent = loadRecentSearches();
  const filtered = recent.filter(
    (r) => r.lat !== location.lat || r.lng !== location.lng
  );
  const updated = [location, ...filtered].slice(0, 10);
  sessionStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function getDefaultRecentSearches(): LocationData[] {
  return [
    {
      lat: 37.7849,
      lng: -122.4094,
      name: 'Mission District',
      address: '456 Mission St, San Francisco, CA',
    },
    {
      lat: 37.7949,
      lng: -122.3994,
      name: 'Embarcadero',
      address: '321 Embarcadero, San Francisco, CA',
    },
    {
      lat: 37.7649,
      lng: -122.4294,
      name: 'Castro',
      address: '789 Castro St, San Francisco, CA',
    },
  ];
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return res.json();
}

// ─── Skeleton Loading Row ──────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-full bg-lightgray animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-lightgray rounded animate-pulse w-3/4" />
        <div className="h-3 bg-lightgray rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

// ─── Location Item ─────────────────────────────────────────────

function LocationItem({
  icon: Icon,
  iconBg,
  iconColor,
  name,
  address,
  onClick,
  delay = 0,
}: {
  icon: typeof MapPin;
  iconBg: string;
  iconColor: string;
  name: string;
  address: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      className="flex items-center gap-3 w-full text-left px-4 py-3 active:bg-navy/5 transition-colors"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay }}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-text-primary truncate">{name}</p>
        <p className="text-sm text-text-secondary truncate">{address}</p>
      </div>
      <ChevronRight size={16} className="text-text-tertiary shrink-0" />
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function SearchLocation() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);

  // ── Load recent searches on mount ──
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Debounced search ──
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchNominatim(query)
        .then((results) => {
          setSuggestions(results);
        })
        .catch((err) => {
          console.warn('Search error:', err);
          setSuggestions([]);
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ── Select location ──
  const selectLocation = useCallback(
    (location: LocationData) => {
      saveRecentSearch(location);
      sessionStorage.setItem('piride_destination', JSON.stringify(location));
      navigate('/ride');
    },
    [navigate]
  );

  // ── Select from Nominatim result ──
  const selectNominatimResult = useCallback(
    (result: NominatimResult) => {
      const location: LocationData = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
        name: result.name || result.display_name.split(',')[0],
      };
      selectLocation(location);
    },
    [selectLocation]
  );

  // ── Use current location as destination ──
  const useCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const location: LocationData = {
              lat,
              lng,
              address: data.display_name || 'Current location',
              name: 'Current Location',
            };
            selectLocation(location);
          } catch {
            selectLocation({
              lat,
              lng,
              address: 'Current location',
              name: 'Current Location',
            });
          }
        },
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, [selectLocation]);

  // ── Clear query ──
  const clearQuery = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  }, []);

  // ── Dismiss ──
  const dismiss = useCallback(() => {
    navigate('/ride');
  }, [navigate]);

  const hasQuery = query.trim().length > 0;

  return (
    <motion.div
      className="mobile-container bg-white relative z-modal-content flex flex-col"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* ── Search Header ── */}
      <div className="shrink-0 bg-white border-b border-midgray/50 px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          {/* Back / Dismiss */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={dismiss}
            className="shrink-0"
          >
            <ChevronDown size={24} className="text-text-primary" />
          </motion.button>

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 bg-lightgray rounded-piride-md px-3 h-10">
            <Search size={18} className="text-text-tertiary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where to?"
              className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-tertiary outline-none"
              autoComplete="off"
            />
            {hasQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={clearQuery}
              >
                <X size={18} className="text-text-tertiary" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Current Location Quick Button */}
        <motion.button
          className="flex items-center gap-2 mt-3 ml-9"
          onClick={useCurrentLocation}
          whileTap={{ scale: 0.97 }}
        >
          <Navigation size={16} className="text-emerald" />
          <span className="text-sm font-medium text-emerald">Current Location</span>
        </motion.button>
      </div>

      {/* ── Search Results ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-2"
            >
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </motion.div>
          )}

          {/* Suggestions */}
          {!isLoading && hasQuery && suggestions.length > 0 && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-2"
            >
              {suggestions.map((result, i) => {
                const name = result.name || result.display_name.split(',')[0];
                const address = result.display_name;
                return (
                  <LocationItem
                    key={result.place_id}
                    icon={MapPin}
                    iconBg="bg-navy/10"
                    iconColor="#2c3e50"
                    name={name}
                    address={address}
                    onClick={() => selectNominatimResult(result)}
                    delay={i * 0.05}
                  />
                );
              })}
            </motion.div>
          )}

          {/* No Results */}
          {!isLoading && hasQuery && suggestions.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <MapPin size={48} className="text-text-tertiary mb-4" />
              <p className="text-base text-text-secondary">No places found</p>
              <p className="text-sm text-text-tertiary mt-1">
                Try a different search term
              </p>
            </motion.div>
          )}

          {/* Recent Searches */}
          {!hasQuery && recentSearches.length > 0 && (
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-2"
            >
              <p className="px-4 text-sm font-medium text-text-secondary mb-2">
                Recent
              </p>
              {recentSearches.map((item, i) => (
                <LocationItem
                  key={`${item.lat}-${item.lng}`}
                  icon={Clock}
                  iconBg="bg-lightgray"
                  iconColor="#9ca3af"
                  name={item.name}
                  address={item.address}
                  onClick={() => selectLocation(item)}
                  delay={i * 0.05}
                />
              ))}
            </motion.div>
          )}

          {/* Empty Recent */}
          {!hasQuery && recentSearches.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center"
            >
              <p className="text-base text-text-tertiary">No recent searches</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
