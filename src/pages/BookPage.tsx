import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Car, Users, ChevronRight, Tag } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { PriceSlider } from '@/components/PriceSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import { getRoute } from '@/lib/osrm';
import { t } from '@/lib/i18n';
import type { TariffType } from '@/contexts/AppContext';

const tariffIcons: Record<TariffType, typeof Car> = {
  standard: Car,
  comfort: Car,
  xl: Users,
};

export default function BookPage() {
  const navigate = useNavigate();
  const {
    pickup,
    destination,
    selectedTariff,
    setSelectedTariff,
    price,
    setPrice,
    setRouteInfo,
    tariffs,
  } = useApp();

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  // Calculate route on mount
  useEffect(() => {
    if (pickup && destination) {
      getRoute(pickup.lat, pickup.lng, destination.lat, destination.lng).then((route) => {
        if (route) {
          setRouteCoords(route.decodedPolyline);
          // Validate distance: cap display if unreasonably large (>500 km)
          const displayDistance = route.distance > 500 ? 0 : route.distance;
          const displayDuration = route.duration > 600 ? 0 : route.duration;
          setDistance(displayDistance);
          setDuration(displayDuration);
          setRouteInfo(displayDistance, displayDuration);
          // Set initial price based on distance
          const basePrice = 2 + displayDistance * 1.5;
          setPrice(Number(basePrice.toFixed(2)));
        }
      });
    }
  }, [pickup, destination, setRouteInfo, setPrice]);

  const selectedTariffData = tariffs.find((t) => t.id === selectedTariff);
  const finalPrice = price * (selectedTariffData?.baseMultiplier || 1);
  const commission = finalPrice * 0.02;
  void commission; // used in JSX

  const handleBook = useCallback(() => {
    setPrice(finalPrice);
    navigate('/payment');
  }, [navigate, finalPrice, setPrice]);

  if (!destination) {
    return (
      <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col items-center justify-center">
        <MapPin size={48} color="#333333" />
        <p className="text-text-secondary mt-4">{t('noDestinationSelected')}</p>
        <PrimaryButton onClick={() => navigate('/search')} variant="secondary">
          {t('searchLocation')}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map with route */}
      <MapView showRoute routeCoords={routeCoords} />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-floating safe-area-top">
        <div className="mx-4 mt-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10 shadow-lg"
            
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </button>
          <h1 className="text-text-primary font-semibold text-lg">{t('confirmRide')}</h1>
        </div>
      </div>

      {/* Bottom sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-piride-xl z-bottom-sheet shadow-sheet border-t border-white/5 max-w-[430px] mx-auto"



      >
        {/* Grabber */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 pb-24 space-y-4 max-h-[78vh] overflow-y-auto no-scrollbar">
          {/* From/To addresses */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Navigation size={14} color="#00C853" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-tertiary text-xs">{t('pickup')}</p>
                <p className="text-text-primary text-sm font-medium truncate" title={pickup.address || pickup.name}>{pickup.address || pickup.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <MapPin size={14} color="#FF5252" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-tertiary text-xs">{t('destination')}</p>
                <p className="text-text-primary text-sm font-medium truncate" title={destination.address || destination.name}>{destination.address || destination.name}</p>
              </div>
            </div>
          </div>

          {/* Distance/Time */}
          <div className="flex gap-3">
            <div className="flex-1 bg-bg-surface rounded-piride-md p-3 text-center border border-white/5">
              <p className="text-text-tertiary text-xs">{t('distance')}</p>
              <p className="text-text-primary font-semibold text-sm">{distance > 500 ? '—' : `${distance.toFixed(1)} km`}</p>
            </div>
            <div className="flex-1 bg-bg-surface rounded-piride-md p-3 text-center border border-white/5">
              <p className="text-text-tertiary text-xs">{t('estTime')}</p>
              <p className="text-text-primary font-semibold text-sm">{duration > 600 ? '—' : `${duration} min`}</p>
            </div>
          </div>

          {/* Tariff selection */}
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">{t('selectClass')}</p>
            <div className="flex gap-2">
              {tariffs.map((tariff) => {
                const Icon = tariffIcons[tariff.id];
                const isSelected = selectedTariff === tariff.id;
                return (
                  <button
                    key={tariff.id}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-piride-md border transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary/40' : 'bg-bg-surface border-white/5'
                    }`}
                    onClick={() => setSelectedTariff(tariff.id)}
                    
                  >
                    <Icon size={20} color={isSelected ? '#00C853' : '#A0A0A0'} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                      {tariff.name}
                    </span>
                    <span className="text-text-tertiary text-[10px]">{tariff.eta}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price slider */}
          <PriceSlider value={price} onChange={setPrice} />

          {/* Fare breakdown */}
          <div className="bg-bg-surface rounded-piride-md p-4 space-y-2 border border-white/5">
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">{t('fareBreakdown')}</p>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1"><Tag size={12} /> {t('baseFare')}</span>
              <span className="text-text-primary font-mono">{2.00.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('distance')} ({distance.toFixed(1)} km)</span>
              <span className="text-text-primary font-mono">{(distance * 1.2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{t('tariff')} ({selectedTariffData?.name})</span>
              <span className="text-text-primary font-mono">x{selectedTariffData?.baseMultiplier}</span>
            </div>
            <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
              <span className="text-text-secondary">{t('commission')}</span>
              <span className="text-warning font-mono">-{commission.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/5 pt-2 flex justify-between">
              <span className="text-text-primary font-semibold">{t('total')}</span>
              <span className="text-primary font-bold text-lg font-mono">{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Book CTA */}
          <div className="mb-4">
            <PrimaryButton onClick={handleBook} icon={<ChevronRight size={18} />}>
              {t('bookWithPi')}
            </PrimaryButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
