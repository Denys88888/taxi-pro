import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Clock, Star } from 'lucide-react';
import { searchLocations } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import type { GeocodingResult } from '@/lib/geocoding';

interface LocationItem {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

const RECENT_LOCATIONS: LocationItem[] = [
  { name: 'San Francisco Airport', address: 'San Francisco International Airport, CA', lat: '37.6213', lng: '-122.379' },
  { name: 'Golden Gate Park', address: 'Golden Gate Park, San Francisco, CA', lat: '37.7694', lng: '-122.4862' },
  { name: 'Pier 39', address: 'Pier 39, San Francisco, CA', lat: '37.8087', lng: '-122.4098' },
];

const SAVED_LOCATIONS: LocationItem[] = [
  { name: 'Home', address: '742 Evergreen Terrace, SF', lat: '37.7749', lng: '-122.4194' },
  { name: 'Work', address: '1 Market Street, SF', lat: '37.7949', lng: '-122.3994' },
];

function convertGeocodingToItem(result: GeocodingResult): LocationItem {
  return {
    name: result.display_name.split(',')[0],
    address: result.display_name,
    lat: result.lat,
    lng: result.lon,
  };
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { setDestination } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocations(searchQuery);
      setResults(data.map(convertGeocodingToItem));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  }, [doSearch]);

  const handleSelect = useCallback((item: LocationItem) => {
    setDestination({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng),
      address: item.address,
      name: item.name,
    });
    navigate('/book');
  }, [setDestination, navigate]);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <motion.button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Where to?"
            className="w-full h-11 bg-bg-surface rounded-full px-4 pl-10 text-text-primary placeholder:text-text-tertiary text-base outline-none focus:ring-2 focus:ring-primary/40 border border-white/5"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {query.trim().length >= 2 ? (
            /* Search Results */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-1"
            >
              {loading ? (
                /* Skeleton loading */
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-piride-md">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 shimmer rounded" />
                      <div className="h-3 w-1/2 shimmer rounded" />
                    </div>
                  </div>
                ))
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin size={40} color="#333333" className="mx-auto mb-3" />
                  <p className="text-text-tertiary text-sm">No locations found</p>
                </div>
              ) : (
                results.map((item, idx) => (
                  <motion.button
                    key={`${item.name}-${idx}`}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.address}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            /* Recent + Saved locations */
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">Recent</h3>
              <div className="space-y-1">
                {RECENT_LOCATIONS.map((loc, idx) => (
                  <motion.button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(loc)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center shrink-0">
                      <Clock size={18} color="#A0A0A0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-6 mb-3 px-1">Saved</h3>
              <div className="space-y-1">
                {SAVED_LOCATIONS.map((loc, idx) => (
                  <motion.button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(loc)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center shrink-0">
                      <Star size={18} color="#6700C2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
