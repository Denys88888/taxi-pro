import { useState, useCallback, useEffect } from 'react';
import { getCurrentPosition, reverseGeocode } from '@/lib/geocoding';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, MapPin, Car, Clock, Users, ArrowRight, Crosshair, Check } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { FloatingSearchBar } from '@/components/FloatingSearchBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BottomSheet } from '@/components/BottomSheet';
import { SkeletonMap } from '@/components/Skeleton';
import { LocateMeButton } from '@/components/LocateMeButton';
import { useApp } from '@/contexts/AppContext';
import { requestNotificationPermission } from '@/lib/notifications';
import { useTranslation } from '@/lib/i18n';

const FAVORITES = [
  { icon: Home, label: 'home', address: '742 Evergreen Terrace, SF' },
  { icon: Briefcase, label: 'work', address: '1 Market Street, SF' },
];

const MAP_LOADING_DELAY = 1500; // ms to show skeleton before revealing map

export default function MapHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pickup, tariffs, selectedTariff, setSelectedTariff, setDestination, destination, setPickup } = useApp();
  const [sheetOpen, setSheetOpen] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [clickPin, setClickPin] = useState<{ lat: number; lng: number } | null>(null);
  const [mapSelectMode, setMapSelectMode] = useState(false);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!mapSelectMode) return;
    setClickPin({ lat, lng });
  }, [mapSelectMode]);

  const handleConfirmPin = useCallback(() => {
    if (!clickPin) return;
    setDestination({
      lat: clickPin.lat,
      lng: clickPin.lng,
      address: `${clickPin.lat.toFixed(4)}, ${clickPin.lng.toFixed(4)}`,
      name: t('selectedPoint'),
    });
    setMapSelectMode(false);
    setClickPin(null);
    navigate('/book');
  }, [clickPin, setDestination, navigate, t]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  // Show skeleton for a brief period, then reveal map with fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoading(false);
    }, MAP_LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Get real GPS location on mount + reverse geocode to address
  useEffect(() => {
    getCurrentPosition()
      .then(async (pos) => {
        const address = await reverseGeocode(pos.lat, pos.lng);
        setPickup({
          lat: pos.lat,
          lng: pos.lng,
          address: address || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`,
          name: address?.split(',')[0] || 'Мое местоположение',
        });
      })
      .catch(() => { /* keep default pickup */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFavoriteSelect = useCallback((address: string) => {
    setDestination({
      lat: pickup.lat + (Math.random() - 0.5) * 0.02,
      lng: pickup.lng + (Math.random() - 0.5) * 0.02,
      address,
      name: address.split(',')[0],
    });
    navigate('/book');
  }, [pickup, setDestination, navigate]);

  const tariffIcons = {
    standard: Car,
    comfort: Car,
    xl: Users,
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton or real map */}
      <AnimatePresence mode="wait">
        {mapLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <SkeletonMap />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <MapView onMapClick={handleMapClick} clickPin={clickPin} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top gradient — only show when map is loaded */}
      {!mapLoading && (<>
      <div className="absolute top-0 left-0 right-0 h-32 map-overlay-gradient-top z-map-overlay pointer-events-none" />

      {/* Search bar */}
      <FloatingSearchBar />

      {/* Quick favorites */}
      <motion.div
        className="absolute top-24 left-4 right-4 z-floating flex gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {FAVORITES.map((fav) => {
          const Icon = fav.icon;
          return (
            <button
              key={fav.label}
              onClick={() => handleFavoriteSelect(fav.address)}
              className="flex items-center gap-2 bg-bg-elevated/90 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/10 shadow-md active:scale-95 transition-transform"
            >
              <Icon size={16} color="#00C853" />
              <span className="text-text-primary text-sm font-medium">{t(fav.label as 'home' | 'work')}</span>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-primary text-xs font-medium flex items-center gap-1">
            <MapPin size={12} />
            {pickup.name.length > 25 ? pickup.name.slice(0, 25) + '...' : pickup.name}
          </span>
        </motion.div>
      </div>

      {/* Locate me button */}
      <LocateMeButton onLocate={(pos) => setPickup(pos)} />

      </>)}

      {/* Bottom Sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} initialSnap={0}>
        <div className="space-y-5 pb-8">
          {/* Sheet title */}
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-semibold">{t('chooseARide')}</h2>
            <span className="text-text-tertiary text-xs">{pickup.name.slice(0, 20)}...</span>
          </div>

          {/* Tap-to-select banner */}
          <AnimatePresence>
            {mapSelectMode && (
              <motion.div
                className="bg-accent/10 border border-accent/30 rounded-piride-lg p-3 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Crosshair size={18} color="#FF9800" />
                <span className="text-accent text-sm font-medium">{t('tapOnMap')}</span>
                <button
                  onClick={() => { setMapSelectMode(false); setClickPin(null); }}
                  className="ml-auto text-text-tertiary text-xs underline"
                >
                  {t('cancel')}
                </button>
              </motion.div>
            )}
            {clickPin && mapSelectMode && (
              <motion.button
                className="w-full bg-primary text-bg-body py-3 rounded-piride-lg font-semibold flex items-center justify-center gap-2"
                onClick={handleConfirmPin}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check size={18} />
                {t('confirmPoint')}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Select on map button */}
          {!mapSelectMode && (
            <button
              onClick={() => setMapSelectMode(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-piride-lg border border-white/10 bg-bg-surface text-text-primary text-sm font-medium active:bg-bg-elevated transition-colors"
            >
              <Crosshair size={16} color="#FF9800" />
              {t('selectOnMap')}
            </button>
          )}

          {/* Tariff cards */}
          <div className="space-y-2.5">
            {tariffs.map((tariff, idx) => {
              const Icon = tariffIcons[tariff.id];
              const isSelected = selectedTariff === tariff.id;
              return (
                <motion.button
                  key={tariff.id}
                  className={`w-full flex items-center gap-4 p-4 rounded-piride-lg border transition-colors text-left select-none ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-bg-surface border-white/5 active:bg-bg-elevated'
                  }`}
                  onClick={() => setSelectedTariff(tariff.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-bg-elevated'}`}>
                    <Icon size={22} color={isSelected ? '#00C853' : '#A0A0A0'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-semibold text-sm">{tariff.name === 'XL' ? 'XL' : t(('tariff' + tariff.name) as any)}</span>
                      <span className="text-text-tertiary text-xs flex items-center gap-0.5">
                        <Clock size={10} />
                        {tariff.eta.replace('min', t('min'))}
                      </span>
                    </div>
                    <p className="text-text-tertiary text-xs mt-0.5">{t((tariff.id + 'Desc') as any)}</p>
                  </div>
                  <ArrowRight size={16} color="#666666" />
                </motion.button>
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
    </div>
  );
}
