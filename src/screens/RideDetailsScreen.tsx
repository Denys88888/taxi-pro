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
import { formatPi, formatDistance, formatDuration, formatDate, maskPhone } from '../utils/formatters';
import type { GeoPoint, Ride, RideParty, FareOffer } from '../types';

// Ride tracking screen: live map + status, counterpart contact (phone/call),
// driver offers for negotiable rides, cancel + pay + rate.
export function RideDetailsScreen() {
  const { t } = useTranslation();
  const params = useRouter((s) => s.params);
  const navigate = useRouter((s) => s.navigate);
  const back = useRouter((s) => s.back);
  const { addToast } = useToast();
  const { payRide, processing } = usePayments();
  const storeRide = useAppStore((s) => s.currentRide);
  const uid = useAppStore((s) => s.user?.uid ?? '');

  const [ride, setRide] = useState<Ride | null>(storeRide);
  const [driverPos, setDriverPos] = useState<GeoPoint | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [rating, setRating] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');

  const rideId = params.id ?? storeRide?.id ?? '';

  useEffect(() => {
    if (!rideId) return;
    const refresh = () => api.getRide(rideId).then(setRide).catch(() => {});
    refresh();
    const offStatus = wsService.on('ride_status_update', (msg) => {
      if (String(msg.rideId) === rideId) refresh();
    });
    const offAssigned = wsService.on('ride_assigned', (msg) => {
      if (String(msg.rideId) === rideId) refresh();
    });
    const offOffers = wsService.on('fare_offers', (msg) => {
      if (String(msg.rideId) === rideId) {
        setRide((r) => (r ? { ...r, offers: msg.offers as FareOffer[] } : r));
      }
    });
    const offLoc = wsService.on('driver_location_update', (msg) => {
      if (String(msg.rideId) === rideId) {
        setDriverPos({ lat: Number(msg.lat), lng: Number(msg.lng) });
      }
    });
    return () => {
      offStatus();
      offAssigned();
      offOffers();
      offLoc();
    };
  }, [rideId]);

  if (!ride) {
    return <div className="flex h-full items-center justify-center opacity-60">{t('common.loading')}</div>;
  }

  const isDriver = ride.driverId === uid;
  const counterpart: RideParty | null | undefined = isDriver ? ride.passenger : ride.driver;
  const feeApplies = ride.status === 'arrived' || ride.status === 'in_progress';

  const doCancel = async (): Promise<void> => {
    try {
      await api.cancelRide(ride.id, feeApplies ? 'late-cancel' : 'user-cancel');
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

  const submitReport = async (): Promise<void> => {
    const reportedId = isDriver ? ride.passengerId : ride.driverId;
    if (!reportedId) return;
    try {
      await api.createReport(ride.id, reportedId, 'complaint', reportText.trim() || 'No details');
      addToast('success', t('ride.reportSent'));
      setShowReport(false);
      setReportText('');
    } catch {
      addToast('error', t('common.error'));
    }
  };

  const acceptOffer = async (offer: FareOffer): Promise<void> => {
    try {
      await api.acceptOffer(ride.id, offer.driverId);
      // Refetch so the enriched driver contact card (phone/call) appears.
      const fresh = await api.getRide(ride.id);
      setRide(fresh);
      addToast('success', t('ride.acceptOffer'));
    } catch {
      addToast('error', t('common.error'));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="h-[48%]">
        <MapView
          center={driverPos ?? ride.pickup}
          pickup={ride.pickup}
          destination={ride.destination}
          stops={ride.stops}
          driver={driverPos}
          className="h-full w-full"
        />
      </div>

      <div className="-mt-4 flex-1 space-y-4 overflow-y-auto rounded-t-2xl surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <RideStatusBadge status={ride.status} />
          <span className="text-lg font-bold">{formatPi(ride.fare)}</span>
        </div>

        {ride.status === 'scheduled' && ride.scheduledAt && (
          <Card className="text-sm">
            🗓 {t('ride.scheduledFor')}: <b>{formatDate(ride.scheduledAt)}</b>
          </Card>
        )}

        {/* Counterpart contact card with phone + call (once assigned). */}
        {counterpart && (
          <Card className="flex items-center gap-3">
            <Avatar name={counterpart.name} src={counterpart.avatar} size={48} />
            <div className="flex-1">
              <p className="font-semibold">{counterpart.name}</p>
              <p className="text-xs opacity-60">
                ⭐ {counterpart.rating.toFixed(1)}
                {counterpart.brand ? ` · ${counterpart.brand} ${counterpart.model} · ${counterpart.number}` : ''}
              </p>
              {counterpart.phone && <p className="text-xs opacity-50">{maskPhone(counterpart.phone)}</p>}
            </div>
            <div className="flex gap-2">
              {counterpart.phone && (
                <a
                  href={`tel:${counterpart.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success"
                  aria-label={t('ride.callDriver')}
                >
                  📞
                </a>
              )}
              <button
                onClick={() => navigate('chat', { chatId: chatIdForRide(ride.id) })}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary"
                aria-label={t('ride.messageDriver')}
              >
                💬
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger"
                aria-label={t('ride.report')}
              >
                🚩
              </button>
            </div>
          </Card>
        )}

        {/* Negotiable ride: incoming driver offers (passenger picks one). */}
        {ride.negotiable && ride.status === 'searching' && !isDriver && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t('ride.offers')}</p>
            {(!ride.offers || ride.offers.length === 0) && (
              <p className="text-sm opacity-50">{t('ride.noOffers')}</p>
            )}
            {ride.offers?.map((o) => (
              <Card key={o.driverId} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{formatPi(o.amount)}</p>
                  <p className="text-xs opacity-60">
                    {o.driverName} · ⭐ {o.driverRating.toFixed(1)}
                    {o.etaMin != null ? ` · ${o.etaMin} min` : ''}
                  </p>
                </div>
                <Button variant="success" className="px-4 py-2" onClick={() => acceptOffer(o)}>
                  {t('ride.acceptOffer')}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {ride.status === 'completed' && !ride.txid && !isDriver && (
          <Button fullWidth loading={processing} onClick={pay}>
            {t('ride.fare')}: {formatPi(ride.fare)} — π Pay
          </Button>
        )}
        {ride.status === 'completed' && !isDriver && (
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

        <div className="flex items-center justify-between text-xs opacity-60">
          <span>{formatDistance(ride.distanceKm)} · {formatDuration(ride.estimatedDurationMin)}</span>
          {ride.stops && ride.stops.length > 0 && (
            <span>{ride.stops.length} {t('ride.stops')}</span>
          )}
        </div>

        {!['completed', 'cancelled'].includes(ride.status) && !isDriver && (
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
            <Button variant="danger" onClick={() => addToast('warning', t('ride.sosSent'))}>
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

      <Modal
        open={showReport}
        title={t('ride.report')}
        onClose={() => setShowReport(false)}
        onConfirm={submitReport}
        confirmLabel={t('common.submit')}
        confirmVariant="danger"
        cancelLabel={t('common.cancel')}
      >
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder={t('ride.reportReason')}
          rows={3}
          className="w-full rounded-lg border border-[#E0E0E0] dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </Modal>
    </div>
  );
}
