import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Star, Navigation, Clock } from 'lucide-react';
import { autocompleteLocations, getDistanceKm } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import type { GeocodingResult } from '@/lib/geocoding';

interface LocationItem {
  name: string;
  address: string;
  lat: string;
  lng: string;
  postcode?: string;
  distance?: number;
}

// Popular/saved locations shown when search is empty
const POPULAR_PLACES: LocationItem[] = [
  { name: 'Красная площадь', address: 'Москва, Россия', lat: '55.7539', lng: '37.6208', postcode: '101000' },
  { name: 'Кремль', address: 'Москва, Россия', lat: '55.7520', lng: '37.6175', postcode: '101000' },
  { name: 'Москва-Сити', address: 'Москва, Россия', lat: '55.7495', lng: '37.5373', postcode: '123317' },
  { name: 'Аэропорт Шереметьево', address: 'Москва, Россия', lat: '55.9736', lng: '37.4125', postcode: '141400' },
  { name: 'Аэропорт Домодедово', address: 'Москва, Россия', lat: '55.4103', lng: '37.9023', postcode: '142015' },
  { name: 'ВДНХ', address: 'Москва, Россия', lat: '55.8261', lng: '37.6376', postcode: '129223' },
];

const SAVED_PLACES: LocationItem[] = [
  { name: 'Улица Арбат', address: 'Москва, Россия', lat: '55.7521', lng: '37.5952', postcode: '119019' },
  { name: 'Парк Горького', address: 'Москва, Россия', lat: '55.7314', lng: '37.6035', postcode: '119049' },
  { name: 'Стадион Лужники', address: 'Москва, Россия', lat: '55.7158', lng: '37.5536', postcode: '119048' },
  { name: 'Останкинская башня', address: 'Москва, Россия', lat: '55.8197', lng: '37.6119', postcode: '127427' },
  { name: 'Сокольники', address: 'Москва, Россия', lat: '55.7891', lng: '37.6797', postcode: '107014' },
  { name: 'Тверская улица', address: 'Москва, Россия', lat: '55.7648', lng: '37.6063', postcode: '125009' },
];

function convertToItem(result: GeocodingResult, refLat: number, refLng: number): LocationItem {
  const parts = result.display_name.split(',');
  const name = parts[0].trim();
  const address = parts.slice(1).join(',').trim();
  const dist = getDistanceKm(refLat, refLng, parseFloat(result.lat), parseFloat(result.lon));
  return {
    name,
    address,
    lat: result.lat,
    lng: result.lon,
    postcode: result.postcode || result.address?.postcode,
    distance: dist,
  };
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { setDestination, setPickup, pickup } = useApp();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const refLat = pickup?.lat ?? 55.7539;
  const refLng = pickup?.lng ?? 37.6208;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => { abortRef.current?.(); };
  }, []);

  const doSearch = useCallback((searchQuery: string) => {
    // Abort any previous search
    if (abortRef.current) abortRef.current();
    
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let aborted = false;
    abortRef.current = () => { aborted = true; };

    autocompleteLocations(searchQuery, (data) => {
      if (aborted) return;
      
      setResults(data.map((r: GeocodingResult) => convertToItem(r, refLat, refLng)));
      setLoading(false);
    });
  }, [refLat, refLng]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    doSearch(value);
  }, [doSearch]);

  const handleSelect = useCallback((item: LocationItem) => {
    setDestination({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lng),
      address: item.postcode ? `${item.name}, ${item.postcode}, ${item.address}` : `${item.name}, ${item.address}`,
      name: item.name,
      postcode: item.postcode,
    });
    navigate('/book');
  }, [setDestination, navigate]);

  const handleCurrentLocation = useCallback(() => {
    const saved = localStorage.getItem('taxipro_gps_pickup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPickup({
          lat: parsed.lat ?? 0,
          lng: parsed.lng ?? 0,
          address: parsed.address ?? 'Текущее местоположение',
          name: parsed.name ?? 'Мое местоположение',
        });
        navigate('/book');
      } catch { /* ignore */ }
    }
  }, [setPickup, navigate]);

  const hasGpsPickup = !!localStorage.getItem('taxipro_gps_pickup');

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <motion.button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ArrowLeft size={18} color="#FFFFFF" />
          </div>
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t('searchLocation')}
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
                  <p className="text-text-tertiary text-sm">{t('noLocationsFound')}</p>
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
                      <p className="text-text-tertiary text-xs truncate">
                        {item.postcode ? `${item.postcode}, ` : ''}{item.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.distance !== undefined && (
                        <span className="text-primary text-xs font-semibold">
                          {item.distance === 0 ? '< 1 км' : `${item.distance} км`}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            /* Recent + Saved + Current Location */
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {/* Current Location quick button */}
              {hasGpsPickup && (
                <>
                  <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">{t('nearby')}</h3>
                  <motion.button
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors mb-2"
                    onClick={handleCurrentLocation}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Navigation size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium">{t('myLocation')}</p>
                      <p className="text-text-tertiary text-xs truncate">{t('currentLocation')}</p>
                    </div>
                  </motion.button>
                </>
              )}

              {/* Popular */}
              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">{t('popular')}</h3>
              <div className="space-y-1">
                {POPULAR_PLACES.map((item, idx) => (
                  <motion.button
                    key={item.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
                      <Clock size={18} color="#666666" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.postcode ? `${item.postcode}, ${item.address}` : item.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Saved */}
              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 mt-6 px-1">{t('saved')}</h3>
              <div className="space-y-1">
                {SAVED_PLACES.map((item, idx) => (
                  <motion.button
                    key={item.name}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Star size={18} color="#9C27B0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{item.postcode ? `${item.postcode}, ${item.address}` : item.address}</p>
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
