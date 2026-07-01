import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapContainer';
import { RideStatusBadge } from '../components/ride/RideStatusBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { useRouter } from '../store/useRouter';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../hooks/useToast';
import { usePayments } from '../hooks/usePayments';
import { wsService } from '../services/wsService';
import { api } from '../services/api';
import { chatIdForRide } from '../utils/helpers';
import { formatPi, formatDistance, formatDuration } from '../utils/formatters';
import type { GeoPoint, Ride } from '../types';

// Ride tracking screen: live map + status, driver actions, cancel + rating flow.
export function RideDetailsScreen() {
  const { t } = useTranslation();
  const params = useRouter((s) => s.params);
  const navigate = useRouter((s) => s.navigate);
  const back = useRouter((s) => s.back);
  const { addToast } = useToast();
  const { payRide, processing } = usePayments();
  const storeRide = useAppStore((s) => s.currentRide);

  const [ride, setRide] = useState<Ride | null>(storeRide);
  const [driverPos, setDriverPos] = useState<GeoPoint | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [rating, setRating] = useState(0);

  const rideId = params.id ?? storeRide?.id ?? '';

  useEffect(() => {
    if (!rideId) return;
    api.getRide(rideId).then(setRide).catch(() => {});
    const offStatus = wsService.on('ride_status_update', (msg) => {
      if (String(msg.rideId) === rideId) api.getRide(rideId).then(setRide).catch(() => {});
    });
    const offAssigned = wsService.on('ride_assigned', (msg) => {
      if (String(msg.rideId) === rideId) api.getRide(rideId).then(setRide).catch(() => {});
    });
    const offLoc = wsService.on('driver_location_update', (msg) => {
      if (String(msg.rideId) === rideId) {
        setDriverPos({ lat: Number(msg.lat), lng: Number(msg.lng) });
      }
    });
    return () => {
      offStatus();
      offAssigned();
      offLoc();
    };
  }, [rideId]);

  if (!ride) {
    return <div className="flex h-full items-center justify-center opacity-60">{t('common.loading')}</div>;
  }

  const feeApplies = ride.status === 'arrived' || ride.status === 'in_progress';

  const doCancel = async (): Promise<void> => {
    try {
      await api.cancelRide(ride.id, feeApplies ? 'late-cancel' : 'user-cancel');
      wsService.send('ride_decline', { rideId: ride.id });
      addToast('info', t('ride.statusCancelled'));
      setShowCancel(false);
      back();
    } catch {
      addToast('error', t('common.error'));
    }
  };

  const submitRating = async (): Promise<void> => {
    try {
      await api.updateRide(ride.id, { driverRating: rating });
      addToast('success', t('common.success'));
      navigate('home');
    } catch {
      addToast('error', t('common.error'));
    }
  };

  const pay = async (): Promise<void> => {
    const txid = await payRide(ride.id);
    if (txid) api.getRide(ride.id).then(setRide).catch(() => {});
  };

  return (
    <div className="flex h-full flex-col">
      <div className="h-[52%]">
        <MapView
          center={driverPos ?? ride.pickup}
          pickup={ride.pickup}
          destination={ride.destination}
          driver={driverPos}
          className="h-full w-full"
        />
      </div>

      <div className="-mt-4 flex-1 space-y-4 overflow-y-auto rounded-t-2xl surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <RideStatusBadge status={ride.status} />
          <span className="text-lg font-bold">{formatPi(ride.fare)}</span>
        </div>

        {ride.driverId && (
          <Card className="flex items-center gap-3">
            <Avatar name={ride.driverId} size={48} />
            <div className="flex-1">
              <p className="font-semibold">{ride.driverId}</p>
              <p className="text-xs opacity-60">
                {formatDistance(ride.distanceKm)} · {formatDuration(ride.estimatedDurationMin)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success"
                aria-label={t('ride.callDriver')}
              >
                📞
              </button>
              <button
                onClick={() => navigate('chat', { chatId: chatIdForRide(ride.id) })}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary"
                aria-label={t('ride.messageDriver')}
              >
                💬
              </button>
            </div>
          </Card>
        )}

        {/* Completed → pay (if unpaid) then rate. */}
        {ride.status === 'completed' && !ride.txid && (
          <Button fullWidth loading={processing} onClick={pay}>
            {t('ride.fare')}: {formatPi(ride.fare)} — π Pay
          </Button>
        )}
        {ride.status === 'completed' && (
          <Card className="space-y-3">
            <p className="text-center font-semibold">{t('ride.rateTitle')}</p>
            <div className="flex justify-center gap-2 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="active:scale-90">
                  {n <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <Button fullWidth disabled={rating === 0} onClick={submitRating}>
              {t('ride.rateSubmit')}
            </Button>
          </Card>
        )}

        {/* Active ride actions: share, SOS, cancel. */}
        {!['completed', 'cancelled'].includes(ride.status) && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                const { shareToken } = await api.shareRide(ride.id);
                await navigator.clipboard?.writeText(
                  `${location.origin}${location.pathname}?share=${shareToken}`
                );
                addToast('success', t('ride.shareCopied'));
              }}
            >
              🔗 {t('ride.share')}
            </Button>
            <Button
              variant="danger"
              onClick={() => addToast('warning', t('ride.sosSent'))}
            >
              🆘 {t('ride.sos')}
            </Button>
            <Button variant="ghost" className="col-span-2 !text-danger" onClick={() => setShowCancel(true)}>
              {t('ride.cancel')}
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={showCancel}
        title={t('ride.cancel')}
        onClose={() => setShowCancel(false)}
        onConfirm={doCancel}
        confirmLabel={t('ride.cancel')}
        confirmVariant="danger"
        cancelLabel={t('common.back')}
      >
        {feeApplies ? t('ride.cancelFeeWarning') : t('ride.cancelConfirm')}
      </Modal>
    </div>
  );
}
