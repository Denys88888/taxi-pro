import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Clock, Star, Navigation, X, Loader2 } from 'lucide-react';
import { searchLocations, reverseGeocode, getLocalSuggestions } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import type { GeocodingResult } from '@/lib/geocoding';

interface LocationItem {
  name: string;
  address: string;
  lat: string;
  lng: string;
  city?: string;
  country?: string;
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

const POPULAR_PLACES: LocationItem[] = [
  { name: 'Красная площадь', address: 'Красная площадь, Москва, Россия', lat: '55.7539', lng: '37.6208', city: 'Москва', country: 'Россия' },
  { name: 'Тверская улица', address: 'Тверская улица, Москва, Россия', lat: '55.7582', lng: '37.6173', city: 'Москва', country: 'Россия' },
  { name: 'Невский проспект', address: 'Невский проспект, Санкт-Петербург, Россия', lat: '59.9343', lng: '30.3351', city: 'Санкт-Петербург', country: 'Россия' },
  { name: 'Times Square', address: 'Times Square, New York, USA', lat: '40.7580', lng: '-73.9855', city: 'New York', country: 'USA' },
  { name: 'Golden Gate Bridge', address: 'Golden Gate Bridge, San Francisco, CA, USA', lat: '37.8199', lng: '-122.4783', city: 'San Francisco', country: 'USA' },
  { name: 'Eiffel Tower', address: 'Champ de Mars, Paris, France', lat: '48.8584', lng: '2.2945', city: 'Paris', country: 'France' },
];

function convertGeocodingToItem(result: GeocodingResult): LocationItem {
  const addr = result.address;
  const city = addr?.city || addr?.town || addr?.village || addr?.suburb || '';
  const country = addr?.country || '';
  return {
    name: result.display_name.split(',')[0],
    address: result.display_name,
    lat: result.lat,
    lng: result.lon,
    city,
    country,
  };
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { setDestination, setPickup } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Load popular local places immediately
    const popular = getLocalSuggestions('').slice(0, 8);
    setResults(popular.map(convertGeocodingToItem));
  }, []);

  const doSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      // Show popular places when empty
      const popular = getLocalSuggestions('').slice(0, 8);
      setResults(popular.map(convertGeocodingToItem));
      return;
    }

    // Always show local matches INSTANTLY first
    const local = getLocalSuggestions(trimmed);
    setResults(local.map(convertGeocodingToItem));

    if (trimmed.length < 2) return;

    // Then try Nominatim in background
    setLoading(true);
    try {
      const data = await searchLocations(searchQuery);
      if (data.length > 0) {
        // Merge: Nominatim first, then local that weren't in Nominatim
        const nominatimNames = new Set(data.map(d => d.display_name));
        const merged = [...data, ...local.filter(l => !nominatimNames.has(l.display_name))];
        setResults(merged.map(convertGeocodingToItem));
      }
      // If Nominatim empty/failed, local results already shown
    } catch {
      // Local results already shown
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
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

  const getCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          setPickup({
            lat: latitude,
            lng: longitude,
            address: address || t('currentLocation'),
            name: address ? address.split(',')[0] : t('currentLocation'),
          });
          navigate('/');
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('Unable to retrieve your location. Please check permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [setPickup, navigate]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t('whereTo')}
            className="w-full h-11 bg-bg-surface rounded-full px-4 pl-10 text-text-primary placeholder:text-text-tertiary text-base outline-none focus:ring-2 focus:ring-primary/40 border border-white/5"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          {query.length > 0 && (
            <button
              onClick={clearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X size={12} color="#666666" />
            </button>
          )}
        </div>
      </div>

      {/* My Location button */}
      <div className="px-4 pt-3">
        <button
          onClick={getCurrentLocation}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1E1E1E] active:bg-[#2A2A2A] border border-white/5"
        >
          <Navigation className="w-5 h-5 text-[#00C853]" />
          <span className="text-white font-medium">{t('myLocation')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {query.trim().length > 0 ? (
            /* Search Results */
            <motion.div
              key="results"



              className="p-4 space-y-1"
            >
              {/* Loading indicator + results */}
              {loading && (
                <div className="flex items-center justify-center py-3 gap-2">
                  <Loader2 size={20} color="#00C853" className="animate-spin" />
                  <p className="text-text-tertiary text-xs">{t('search')}...</p>
                </div>
              )}
              {results.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <MapPin size={40} color="#333333" className="mx-auto mb-3" />
                  <p className="text-text-tertiary text-sm">{t('noLocationsFound')}</p>
                </div>
              ) : (
                results.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors -active:scale-[0.98] transition-transform"
                    onClick={() => handleSelect(item)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.address}</p>
                      {(item.city || item.country) && (
                        <p className="text-text-tertiary/60 text-[11px] truncate">
                          {[item.city, item.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          ) : (
            /* Popular + Recent + Saved */
            <motion.div
              key="recent"



              className="p-4"
            >
              {/* Popular local places */}
              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">Популярные места</h3>
              <div className="space-y-1 mb-6">
                {POPULAR_PLACES.map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors -active:scale-[0.98] transition-transform"
                    onClick={() => handleSelect(item)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.address}</p>
                      {(item.city || item.country) && (
                        <p className="text-text-tertiary/60 text-[11px] truncate">
                          {[item.city, item.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">{t('recent')}</h3>
              <div className="space-y-1">
                {RECENT_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors -active:scale-[0.98] transition-transform"
                    onClick={() => handleSelect(loc)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center shrink-0">
                      <Clock size={18} color="#A0A0A0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-6 mb-3 px-1">{t('saved')}</h3>
              <div className="space-y-1">
                {SAVED_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors -active:scale-[0.98] transition-transform"
                    onClick={() => handleSelect(loc)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center shrink-0">
                      <Star size={18} color="#6700C2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{loc.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{loc.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
