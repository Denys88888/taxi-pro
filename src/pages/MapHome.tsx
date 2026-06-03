import { useState, useCallback, useEffect } from 'react';
import { getCurrentPosition } from '@/lib/geolocation';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Home, Briefcase, MapPin, Car, Clock, Users, ArrowRight } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { FloatingSearchBar } from '@/components/FloatingSearchBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BottomSheet } from '@/components/BottomSheet';
import { useApp } from '@/contexts/AppContext';
import { requestNotificationPermission } from '@/lib/notifications';

const FAVORITES = [
  { icon: Home, label: 'Домой', address: '742 Evergreen Terrace, SF' },
  { icon: Briefcase, label: 'На работу', address: '1 Market Street, SF' },
];

export default function MapHome() {
  const navigate = useNavigate();
  const { pickup, tariffs, selectedTariff, setSelectedTariff, setDestination, destination, setPickup } = useApp();
  const [sheetOpen, setSheetOpen] = useState(true);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  // Get real GPS location on mount
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setPickup({
          lat: pos.lat,
          lng: pos.lng,
          address: 'Current Location',
          name: 'My Location',
        });
      })
      .catch(() => { /* keep default Union Square */ });
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
      {/* Map */}
      <MapView />

      {/* Top gradient */}
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
              <span className="text-text-primary text-sm font-medium">{fav.label}</span>
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

      {/* Bottom Sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} initialSnap={0}>
        <div className="space-y-5 pb-8">
          {/* Sheet title */}
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-semibold">Выберите поездку</h2>
            <span className="text-text-tertiary text-xs">{pickup.name.slice(0, 20)}...</span>
          </div>

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
                      <span className="text-text-primary font-semibold text-sm">{tariff.name}</span>
                      <span className="text-text-tertiary text-xs flex items-center gap-0.5">
                        <Clock size={10} />
                        {tariff.eta}
                      </span>
                    </div>
                    <p className="text-text-tertiary text-xs mt-0.5">{tariff.description}</p>
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
            {destination ? 'Забронировать с Pi' : 'Выберите пункт назначения'}
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
