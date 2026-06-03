import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Clock, Star, Navigation } from 'lucide-react';
import { searchLocations } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import type { GeocodingResult } from '@/lib/geocoding';

interface LocationItem {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

const LOCAL_FALLBACK: LocationItem[] = [
  // Moscow (12)
  { name: 'Red Square', address: 'Moscow, Russia', lat: '55.7539', lng: '37.6208' },
  { name: 'Kremlin', address: 'Moscow, Russia', lat: '55.7520', lng: '37.6175' },
  { name: 'Moscow City (CBD)', address: 'Moscow International Business Center, Russia', lat: '55.7495', lng: '37.5373' },
  { name: 'Sheremetyevo Airport', address: 'Moscow, Russia', lat: '55.9736', lng: '37.4125' },
  { name: 'Domodedovo Airport', address: 'Moscow, Russia', lat: '55.4103', lng: '37.9023' },
  { name: 'VDNKh', address: 'Moscow, Russia', lat: '55.8261', lng: '37.6376' },
  { name: 'Arbat Street', address: 'Moscow, Russia', lat: '55.7521', lng: '37.5952' },
  { name: 'Gorky Park', address: 'Moscow, Russia', lat: '55.7314', lng: '37.6035' },
  { name: 'Luzhniki Stadium', address: 'Moscow, Russia', lat: '55.7158', lng: '37.5536' },
  { name: 'Ostankino Tower', address: 'Moscow, Russia', lat: '55.8197', lng: '37.6119' },
  { name: ' Sokolnicheskaya Metro', address: 'Moscow, Russia', lat: '55.7891', lng: '37.6797' },
  { name: 'Tverskaya Street', address: 'Moscow, Russia', lat: '55.7648', lng: '37.6063' },
  // Saint Petersburg (12)
  { name: 'Palace Square', address: 'Saint Petersburg, Russia', lat: '59.9402', lng: '30.3159' },
  { name: 'Hermitage Museum', address: 'Saint Petersburg, Russia', lat: '59.9398', lng: '30.3146' },
  { name: 'Nevsky Prospect', address: 'Saint Petersburg, Russia', lat: '59.9343', lng: '30.3351' },
  { name: 'Peter and Paul Fortress', address: 'Saint Petersburg, Russia', lat: '59.9500', lng: '30.3167' },
  { name: 'Pulkovo Airport', address: 'Saint Petersburg, Russia', lat: '59.8003', lng: '30.2625' },
  { name: 'St. Isaac\'s Cathedral', address: 'Saint Petersburg, Russia', lat: '59.9341', lng: '30.3062' },
  { name: 'Kazan Cathedral', address: 'Saint Petersburg, Russia', lat: '59.9343', lng: '30.3245' },
  { name: 'Church of the Savior on Blood', address: 'Saint Petersburg, Russia', lat: '59.9400', lng: '30.3289' },
  { name: 'Summer Garden', address: 'Saint Petersburg, Russia', lat: '59.9461', lng: '30.3364' },
  { name: 'Mariinsky Theatre', address: 'Saint Petersburg, Russia', lat: '59.9258', lng: '30.2966' },
  { name: 'Vasilyevsky Island', address: 'Saint Petersburg, Russia', lat: '59.9400', lng: '30.2900' },
  { name: 'Finland Station', address: 'Saint Petersburg, Russia', lat: '59.9553', lng: '30.3558' },
  // Kyiv (12)
  { name: 'Maidan Nezalezhnosti', address: 'Kyiv, Ukraine', lat: '50.4504', lng: '30.5245' },
  { name: 'Kyiv Pechersk Lavra', address: 'Kyiv, Ukraine', lat: '50.4343', lng: '30.5592' },
  { name: 'Boryspil Airport', address: 'Kyiv, Ukraine', lat: '50.3450', lng: '30.8947' },
  { name: 'Golden Gate', address: 'Kyiv, Ukraine', lat: '50.4484', lng: '30.5133' },
  { name: 'Khreshchatyk Street', address: 'Kyiv, Ukraine', lat: '50.4475', lng: '30.5221' },
  { name: 'St. Sophia\'s Cathedral', address: 'Kyiv, Ukraine', lat: '50.4531', lng: '30.5144' },
  { name: 'Motherland Monument', address: 'Kyiv, Ukraine', lat: '50.4266', lng: '30.5630' },
  { name: 'Olimpiyskiy Stadium', address: 'Kyiv, Ukraine', lat: '50.4333', lng: '30.5217' },
  { name: 'Podil District', address: 'Kyiv, Ukraine', lat: '50.4667', lng: '30.5167' },
  { name: 'Zhuliany Airport', address: 'Kyiv, Ukraine', lat: '50.4019', lng: '30.4497' },
  { name: 'Andriyivskyy Descent', address: 'Kyiv, Ukraine', lat: '50.4594', lng: '30.5179' },
  { name: 'Obolon District', address: 'Kyiv, Ukraine', lat: '50.5050', lng: '30.4983' },
  // Minsk (12)
  { name: 'Independence Square', address: 'Minsk, Belarus', lat: '53.8958', lng: '27.5478' },
  { name: 'Victory Square', address: 'Minsk, Belarus', lat: '53.9081', lng: '27.5742' },
  { name: 'National Library', address: 'Minsk, Belarus', lat: '53.9216', lng: '27.6589' },
  { name: 'Minsk Airport', address: 'Minsk, Belarus', lat: '53.8885', lng: '28.0445' },
  { name: 'Gorky Park', address: 'Minsk, Belarus', lat: '53.9023', lng: '27.5736' },
  { name: 'Nemiga Street', address: 'Minsk, Belarus', lat: '53.9059', lng: '27.5545' },
  { name: 'Dinamo Stadium', address: 'Minsk, Belarus', lat: '53.8956', lng: '27.5605' },
  { name: 'Trinity Hill', address: 'Minsk, Belarus', lat: '53.9083', lng: '27.5563' },
  { name: 'Palace of Republic', address: 'Minsk, Belarus', lat: '53.9028', lng: '27.5613' },
  { name: 'Komarovsky Market', address: 'Minsk, Belarus', lat: '53.8892', lng: '27.5386' },
  { name: 'Botanical Garden', address: 'Minsk, Belarus', lat: '53.9167', lng: '27.6167' },
  { name: 'Zamok Shopping Center', address: 'Minsk, Belarus', lat: '53.9288', lng: '27.5826' },
  // Almaty (12)
  { name: 'Republic Square', address: 'Almaty, Kazakhstan', lat: '43.2380', lng: '76.9459' },
  { name: 'Ascension Cathedral', address: 'Almaty, Kazakhstan', lat: '43.2581', lng: '76.9530' },
  { name: 'Kok Tobe', address: 'Almaty, Kazakhstan', lat: '43.2346', lng: '76.9783' },
  { name: 'Almaty Airport', address: 'Almaty, Kazakhstan', lat: '43.3521', lng: '77.0405' },
  { name: 'Medeu Skating Rink', address: 'Almaty, Kazakhstan', lat: '43.2098', lng: '77.0861' },
  { name: 'Shymbulak Ski Resort', address: 'Almaty, Kazakhstan', lat: '43.1283', lng: '77.0810' },
  { name: 'Arbat Street', address: 'Almaty, Kazakhstan', lat: '43.2567', lng: '76.9533' },
  { name: 'Dostyk Plaza', address: 'Almaty, Kazakhstan', lat: '43.2408', lng: '76.9189' },
  { name: 'First President Park', address: 'Almaty, Kazakhstan', lat: '43.2267', lng: '76.9225' },
  { name: 'Mega Park Mall', address: 'Almaty, Kazakhstan', lat: '43.2028', lng: '76.8933' },
  { name: 'Abay Opera House', address: 'Almaty, Kazakhstan', lat: '43.2414', lng: '76.9194' },
  { name: 'Rahat Palace', address: 'Almaty, Kazakhstan', lat: '43.2450', lng: '76.9167' },
  // International (12+)
  { name: 'Times Square', address: 'New York City, USA', lat: '40.7580', lng: '-73.9855' },
  { name: 'Central Park', address: 'New York City, USA', lat: '40.7829', lng: '-73.9654' },
  { name: 'JFK Airport', address: 'New York City, USA', lat: '40.6413', lng: '-73.7781' },
  { name: 'Big Ben', address: 'London, United Kingdom', lat: '51.4994', lng: '-0.1245' },
  { name: 'Heathrow Airport', address: 'London, United Kingdom', lat: '51.4700', lng: '-0.4543' },
  { name: 'Eiffel Tower', address: 'Paris, France', lat: '48.8584', lng: '2.2945' },
  { name: 'Charles de Gaulle Airport', address: 'Paris, France', lat: '49.0097', lng: '2.5479' },
  { name: 'Tokyo Tower', address: 'Tokyo, Japan', lat: '35.6586', lng: '139.7454' },
  { name: 'Narita Airport', address: 'Tokyo, Japan', lat: '35.7647', lng: '140.3864' },
  { name: 'Burj Khalifa', address: 'Dubai, UAE', lat: '25.1972', lng: '55.2744' },
  { name: 'Dubai Airport', address: 'Dubai, UAE', lat: '25.2532', lng: '55.3657' },
  { name: 'Singapore Changi Airport', address: 'Singapore', lat: '1.3644', lng: '103.9915' },
  { name: 'Sydney Opera House', address: 'Sydney, Australia', lat: '-33.8568', lng: '151.2153' },
  { name: 'Berlin Central Station', address: 'Berlin, Germany', lat: '52.5251', lng: '13.3694' },
  { name: 'Rome Colosseum', address: 'Rome, Italy', lat: '41.8902', lng: '12.4922' },
  { name: 'Barcelona Sagrada Familia', address: 'Barcelona, Spain', lat: '41.4036', lng: '2.1744' },
  { name: 'Toronto CN Tower', address: 'Toronto, Canada', lat: '43.6426', lng: '-79.3871' },
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
  const { setDestination, setPickup } = useApp();
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
      if (data.length === 0) {
        // Fallback: search local database
        const q = searchQuery.toLowerCase();
        const fallback = LOCAL_FALLBACK.filter(
          (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.address.toLowerCase().includes(q)
        );
        setResults(fallback);
      } else {
        setResults(data.map(convertGeocodingToItem));
      }
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

  const handleCurrentLocation = useCallback(() => {
    const saved = localStorage.getItem('taxipro_gps_pickup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPickup({
          lat: parsed.lat ?? 0,
          lng: parsed.lng ?? 0,
          address: parsed.address ?? 'Current Location',
          name: parsed.name ?? 'My Location',
        });
        navigate('/book');
      } catch {
        // ignore parse errors
      }
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
          <ArrowLeft size={20} color="#FFFFFF" />
        </motion.button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Куда поедем?"
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
                  <p className="text-text-tertiary text-sm">Локации не найдены</p>
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
                  <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">Быстрый доступ</h3>
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
                      <p className="text-text-primary text-sm font-medium">Текущее местоположение</p>
                      <p className="text-text-tertiary text-xs truncate">Использовать GPS</p>
                    </div>
                  </motion.button>
                </>
              )}

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 px-1">Популярные</h3>
              <div className="space-y-1">
                {LOCAL_FALLBACK.slice(0, 6).map((loc, idx) => (
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

              <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-6 mb-3 px-1">Избранное</h3>
              <div className="space-y-1">
                {LOCAL_FALLBACK.slice(6, 12).map((loc, idx) => (
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
