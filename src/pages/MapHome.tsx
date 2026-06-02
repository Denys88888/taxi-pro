import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, MapPin, Car, Clock, Users, ArrowRight, ArrowLeft, X, Search, Loader2 } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { FloatingSearchBar } from '@/components/FloatingSearchBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BottomSheet } from '@/components/BottomSheet';
import { reverseGeocode, searchLocations } from '@/lib/geocoding';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { getFavorites, saveFavorite, type FavoriteAddress } from '@/lib/favorites';
import type { GeocodingResult } from '@/lib/geocoding';

const FAVORITE_DEFS = [
  { icon: Home, labelKey: 'home' as const, type: 'home' as const },
  { icon: Briefcase, labelKey: 'work' as const, type: 'work' as const },
];

interface SearchResult {
  name: string;
  address: string;
  lat: string;
  lng: string;
}

function convertGeocodingToItem(result: GeocodingResult): SearchResult {
  return {
    name: result.display_name.split(',')[0],
    address: result.display_name,
    lat: result.lat,
    lng: result.lon,
  };
}

export default function MapHome() {
  const navigate = useNavigate();
  const { pickup, tariffs, selectedTariff, setSelectedTariff, setDestination, destination } = useApp();
  const [sheetOpen, setSheetOpen] = useState(true);
  const [mapToast, setMapToast] = useState<string | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<{ home: FavoriteAddress | null; work: FavoriteAddress | null }>({ home: null, work: null });

  // Setup dialog state
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupType, setSetupType] = useState<'home' | 'work'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    setDestination({
      lat,
      lng,
      address: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      name: address ? address.split(',')[0] : 'Selected Location',
    });
    setMapToast("Tap 'Book with Pi' to confirm");
    setTimeout(() => setMapToast(null), 3000);
  }, [setDestination]);

  const handleFavoriteSelect = useCallback((type: 'home' | 'work') => {
    const fav = favorites[type];
    if (fav) {
      // Use saved favorite
      setDestination({
        lat: fav.lat,
        lng: fav.lng,
        address: fav.address,
        name: fav.name,
      });
      navigate('/book');
    } else {
      // Show setup dialog
      setSetupType(type);
      setSearchQuery('');
      setSearchResults([]);
      setSetupDialogOpen(true);
    }
  }, [favorites, setDestination, navigate]);

  const handleSaveFavorite = useCallback((result: SearchResult) => {
    const fav: FavoriteAddress = {
      name: result.name,
      address: result.address,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lng),
    };
    saveFavorite(setupType, fav);
    setFavorites(getFavorites());
    setSetupDialogOpen(false);

    // Use it as destination
    setDestination({
      lat: fav.lat,
      lng: fav.lng,
      address: fav.address,
      name: fav.name,
    });
    navigate('/book');
  }, [setupType, setDestination, navigate]);

  const doSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setSearchResults([]);
      return;
    }
    if (trimmed.length < 2) return;

    setSearchLoading(true);
    try {
      const data = await searchLocations(query);
      if (data.length > 0) {
        setSearchResults(data.map(convertGeocodingToItem));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  }, [doSearch]);

  const handleClearDestination = useCallback(() => {
    setDestination(null);
  }, [setDestination]);

  const tariffIcons = {
    standard: Car,
    comfort: Car,
    xl: Users,
  };

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView onMapClick={handleMapClick} />

      {/* Map click toast */}
      <AnimatePresence>
        {mapToast && (
          <motion.div
            key="map-toast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-36 left-1/2 -translate-x-1/2 z-30 bg-bg-elevated/95 backdrop-blur-xl px-4 py-2 rounded-full border border-primary/30 shadow-lg"
          >
            <span className="text-primary text-sm font-medium">{mapToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 map-overlay-gradient-top z-map-overlay pointer-events-none" />

      {/* Search bar */}
      <FloatingSearchBar />

      {/* Destination label with clear button */}
      {destination && (
        <div className="absolute top-[180px] left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#1E1E1E] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-white text-sm truncate max-w-[200px]">{destination.address}</span>
            <button
              onClick={handleClearDestination}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Quick favorites */}
      <motion.div
        className="absolute top-24 left-4 right-4 z-floating flex gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {FAVORITE_DEFS.map((fav) => {
          const Icon = fav.icon;
          const saved = favorites[fav.type];
          return (
            <button
              key={fav.type}
              onClick={() => handleFavoriteSelect(fav.type)}
              className="flex items-center gap-2 bg-bg-elevated/90 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 shadow-md active:scale-95 transition-transform"
              title={saved ? saved.address : (fav.type === 'home' ? t('noHomeSet') : t('noWorkSet'))}
            >
              <Icon size={16} color={saved ? '#00C853' : '#666666'} />
              <span className="text-text-primary text-sm font-medium">{t(fav.labelKey)}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Bottom gradient for sheet transition */}
      <div className="absolute bottom-0 left-0 right-0 h-48 map-overlay-gradient z-map-overlay pointer-events-none" />

      {/* Pickup pin label */}
      <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 z-map-overlay pointer-events-none">
        <motion.div
          className="bg-bg-elevated/90 backdrop-blur px-3 py-1.5 rounded-full border border-primary/30 shadow-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-primary text-xs font-medium flex items-center gap-1">
            <MapPin size={12} />
            {pickup.name.length > 25 ? pickup.name.slice(0, 25) + '...' : pickup.name}
          </span>
        </motion.div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} initialSnap={0}>
        <div className="space-y-5 pb-8">
          {/* Sheet title */}
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-semibold">{t('chooseARide')}</h2>
            <span className="text-text-tertiary text-xs">{pickup.name.slice(0, 20)}...</span>
          </div>

          {/* Tariff cards */}
          <div className="space-y-2.5">
            {tariffs.map((tariff) => {
              const Icon = tariffIcons[tariff.id];
              const isSelected = selectedTariff === tariff.id;
              return (
                <button
                  key={tariff.id}
                  className={`w-full flex items-center gap-4 p-4 rounded-piride-lg border transition-colors text-left select-none ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-bg-surface border-white/5 active:bg-bg-elevated'
                  }`}
                  onClick={() => setSelectedTariff(tariff.id)}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-bg-elevated'}`}>
                    <Icon size={22} color={isSelected ? '#00C853' : '#A0A0A0'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-semibold text-sm">{tariff.name}</span>
                      <span className="text-text-tertiary text-xs flex items-center gap-0.5">
                        <Clock size={10} />
                        {tariff.eta}
                      </span>
                    </div>
                    <p className="text-text-tertiary text-xs mt-0.5">{tariff.description}</p>
                  </div>
                  <ArrowRight size={16} color="#666666" />
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <PrimaryButton
            onClick={() => {
              if (!destination) {
                navigate('/search');
              } else {
                navigate('/book');
              }
            }}
            icon={<MapPin size={18} />}
          >
            {destination ? t('bookWithPi') : t('chooseDestination')}
          </PrimaryButton>
        </div>
      </BottomSheet>

      {/* Favorite Setup Dialog */}
      <AnimatePresence>
        {setupDialogOpen && (
          <motion.div
            key="fav-setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-bg-body flex flex-col"
          >
            {/* Dialog Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
              <button
                onClick={() => setSetupDialogOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </button>
              <h2 className="text-text-primary text-lg font-semibold">
                {setupType === 'home' ? t('setHome') : t('setWork')}
              </h2>
            </div>

            {/* Search Input */}
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={t('enterAddress')}
                  className="w-full h-12 bg-bg-surface rounded-full px-4 pl-11 text-text-primary placeholder:text-text-tertiary text-base outline-none focus:ring-2 focus:ring-primary/40 border border-white/5"
                  autoFocus
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {searchLoading && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 size={20} color="#00C853" className="animate-spin" />
                  <p className="text-text-tertiary text-sm">{t('search')}...</p>
                </div>
              )}

              {!searchLoading && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <MapPin size={40} color="#333333" className="mx-auto mb-3" />
                  <p className="text-text-tertiary text-sm">{t('noLocationsFound')}</p>
                </div>
              )}

              {!searchLoading && searchQuery.trim().length === 0 && (
                <div className="text-center py-12">
                  <MapPin size={40} color="#333333" className="mx-auto mb-3" />
                  <p className="text-text-tertiary text-sm">{t('enterAddress')}</p>
                </div>
              )}

              <div className="space-y-1">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.name}-${idx}`}
                    className="w-full flex items-center gap-4 p-3 rounded-piride-md text-left active:bg-bg-elevated transition-colors"
                    onClick={() => handleSaveFavorite(result)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} color="#00C853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{result.name}</p>
                      <p className="text-text-tertiary text-xs truncate">{result.address}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-primary/20">
                      <span className="text-primary text-xs font-medium">{t('save')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
