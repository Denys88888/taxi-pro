import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapContainer';
import { AddressSearch } from '../components/map/AddressSearch';
import { VehicleTypeSelector } from '../components/ride/VehicleTypeSelector';
import { Button } from '../components/ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';
import { useToast } from '../hooks/useToast';
import { useAppStore } from '../store/useAppStore';
import { useRouter } from '../store/useRouter';
import { api } from '../services/api';
import { reverseGeocode } from '../services/mapService';
import { haversineKm } from '../utils/helpers';
import { formatPi, formatDistance, formatDuration } from '../utils/formatters';
import { isValidCoord } from '../utils/validators';
import type { GeoPoint, VehicleType } from '../types';

const DEFAULT_CENTER: GeoPoint = { lat: 52.2297, lng: 21.0122 }; // Warsaw fallback

// Passenger home: 60% map + a bottom sheet to pick pickup/destination, vehicle,
// see the fare estimate, and order a taxi.
export function PassengerHomeScreen() {
  const { t } = useTranslation();
  const { position, request } = useGeolocation();
  const { addToast } = useToast();
  const setCurrentRide = useAppStore((s) => s.setCurrentRide);
  const navigate = useRouter((s) => s.navigate);

  const [pickup, setPickup] = useState<GeoPoint | null>(null);
  const [destination, setDestination] = useState<GeoPoint | null>(null);
  const [vehicle, setVehicle] = useState<VehicleType>('economy');
  const [ordering, setOrdering] = useState(false);

  // Prefill pickup from GPS + reverse-geocoded address.
  useEffect(() => {
    if (position && !pickup) {
      setPickup(position);
      reverseGeocode(position).then((address) =>
        setPickup((p) => (p ? { ...p, address } : { ...position, address }))
      );
    }
  }, [position, pickup]);

  const center = pickup ?? position ?? DEFAULT_CENTER;

  const distanceKm = useMemo(
    () =>
      pickup && destination
        ? haversineKm(pickup.lat, pickup.lng, destination.lat, destination.lng)
        : 0,
    [pickup, destination]
  );
  const durationMin = Math.max(1, Math.round((distanceKm / 30) * 60));
  const fareEstimate = distanceKm * (vehicle === 'business' ? 1.4 : 1) + 1.5;

  const canOrder = isValidCoord(pickup) && isValidCoord(destination) && !ordering;

  const order = async (): Promise<void> => {
    if (!isValidCoord(pickup) || !isValidCoord(destination)) return;
    setOrdering(true);
    try {
      const ride = await api.createRide({ pickup, destination, vehicleType: vehicle });
      setCurrentRide(ride);
      addToast('success', t('home.searching'));
      navigate('ride', { id: ride.id });
    } catch {
      addToast('error', t('common.error'));
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[55%]">
        <MapView
          center={center}
          pickup={pickup}
          destination={destination}
          className="h-full w-full"
        />
        <button
          onClick={request}
          className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-fab active:scale-95"
          aria-label={t('home.useMyLocation')}
        >
          📍
        </button>
      </div>

      <div className="-mt-4 flex-1 overflow-y-auto rounded-t-2xl surface p-4 shadow-card">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15 dark:bg-white/20" />
        <div className="space-y-3">
          <AddressSearch
            label={t('home.from')}
            placeholder={t('home.fromPlaceholder')}
            value={pickup?.address ?? ''}
            icon="🟢"
            onSelect={setPickup}
          />
          <AddressSearch
            label={t('home.to')}
            placeholder={t('home.toPlaceholder')}
            value={destination?.address ?? ''}
            icon="🔴"
            onSelect={setDestination}
          />

          <div>
            <p className="mb-2 text-sm font-medium opacity-70">{t('home.chooseVehicle')}</p>
            <VehicleTypeSelector value={vehicle} onChange={setVehicle} distanceKm={distanceKm} />
          </div>

          {distanceKm > 0 && (
            <div className="flex items-center justify-between rounded-card bg-black/5 dark:bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs opacity-60">{t('home.estimatedFare')}</p>
                <p className="text-xl font-bold">{formatPi(fareEstimate)}</p>
              </div>
              <div className="text-right text-xs opacity-70">
                <p>{formatDistance(distanceKm)}</p>
                <p>{formatDuration(durationMin)}</p>
              </div>
            </div>
          )}

          <Button fullWidth loading={ordering} disabled={!canOrder} onClick={order} className="h-14">
            {t('home.order')}
          </Button>
        </div>
      </div>
    </div>
  );
}
