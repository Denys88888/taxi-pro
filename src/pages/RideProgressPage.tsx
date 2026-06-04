import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Navigation, Share2, MapPin, Shield, Clock, MessageCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { MapView } from '@/components/MapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import SOSButton from '@/components/SOSButton';
import { notifyDriverArriving, notifyRideComplete } from '@/lib/notifications';
import { wsClient } from '@/lib/api';

export default function RideProgressPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRide, pickup, destination, routeDuration, setCurrentRide, addRideToHistory } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [shared, setShared] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ lat: pickup.lat + 0.001, lng: pickup.lng + 0.001 });
  const [unreadCount, setUnreadCount] = useState(0);

  // WebSocket integration for real-time driver location and chat messages
  useEffect(() => {
    wsClient.connect();

    const handleDriverLocation = (data: { rideId: string; lat: number; lng: number }) => {
      if (data.rideId === currentRide?.id) {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      }
    };

    const handleNewMessage = () => {
      setUnreadCount((c) => c + 1);
    };

    const handleConnected = () => {
      console.log('[WS] Connected');
    };

    wsClient.on('driver_location_update', handleDriverLocation);
    wsClient.on('new_message', handleNewMessage);
    wsClient.on('connected', handleConnected);

    return () => {
      wsClient.off('driver_location_update', handleDriverLocation);
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('connected', handleConnected);
    };
  }, [currentRide?.id]);

  // Simulate ride progress
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => {
        if (e >= (routeDuration || 10)) {
          clearInterval(interval);
          return e;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [routeDuration]);

  const progress = Math.min(100, (elapsed / (routeDuration || 10)) * 100);

  const handleComplete = useCallback(() => {
    notifyRideComplete();
    if (currentRide) {
      const completedRide = {
        ...currentRide,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
      addRideToHistory(completedRide);
      setCurrentRide(completedRide);
    }
    navigate('/complete');
  }, [currentRide, addRideToHistory, setCurrentRide, navigate]);

  // Notify when driver arrives (progress reaches 100%)
  useEffect(() => {
    if (progress >= 100 && currentRide?.driver) {
      notifyDriverArriving(currentRide.driver.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share?.({
        title: `${t('shareTrip')} Taxi Pro`,
        text: `${t('enRoute')} — ${destination?.name}`,
      });
    } catch {
      // Fallback
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }, [destination, t]);

  if (!currentRide) {
    return (
      <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col items-center justify-center">
        <MapPin size={48} color="#333333" />
        <p className="text-text-secondary mt-4">{t('noActiveRide')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm">{t('goHome')}</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView driverLocation={driverLocation} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-floating safe-area-top">
        <div className="mx-4 mt-4 flex items-center justify-between">
          <motion.div
            className="bg-bg-elevated/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="text-text-primary text-sm font-medium flex items-center gap-1.5">
              <Navigation size={14} color="#00C853" className="animate-spin" style={{ animationDuration: '3s' }} />
              {t('enRoute')}
            </span>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => { setUnreadCount(0); navigate('/chat'); }}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle size={18} color="#448AFF" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
              whileTap={{ scale: 0.9 }}
              title={t('shareRide')}
            >
              {shared ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary text-xs font-bold">OK</motion.span>
              ) : (
                <Share2 size={18} color="#FFFFFF" />
              )}
            </motion.button>
            <motion.button
              onClick={() => navigate('/cancel-ride')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
              whileTap={{ scale: 0.9 }}
              title={t('cancelRideTitle')}
            >
              <AlertTriangle size={18} color="#FF5252" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Progress overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-floating">
        <div className="map-overlay-gradient h-32 pointer-events-none" />
        <motion.div
          className="bg-bg-elevated rounded-t-piride-xl shadow-sheet border-t border-white/5 max-w-[430px] mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="px-4 pb-8 pt-4 space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary flex items-center gap-1">
                  <Clock size={12} /> {elapsed} {t('min')}
                </span>
                <span className="text-text-tertiary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-3 bg-bg-surface rounded-piride-md p-3 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <MapPin size={14} color="#FF5252" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-tertiary text-xs">{t('destination')}</p>
                <p className="text-text-primary text-sm font-medium truncate">{destination?.name}{destination?.postcode ? `, ${destination.postcode}` : ''}</p>
              </div>
            </div>

            {/* Safety note */}
            <div className="flex items-center gap-2 text-text-tertiary text-xs">
              <Shield size={12} color="#00C853" />
              <span>{t('rideCoveredByEscrow')}</span>
            </div>

            {/* Cancel ride */}
            <motion.button
              onClick={() => navigate('/cancel-ride')}
              className="w-full h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-error/20 text-error font-medium text-sm active:scale-[0.97] transition-transform"
              whileTap={{ scale: 0.97 }}
              style={{ touchAction: 'manipulation' }}
            >
              <AlertTriangle size={16} />
              {t('cancelRideTitle')}
            </motion.button>

            {/* CTA */}
            <PrimaryButton onClick={handleComplete}>
              {t('completeRide')}
            </PrimaryButton>
          </div>
        </motion.div>
      </div>

      <SOSButton visible={true} />
    </div>
  );
}
