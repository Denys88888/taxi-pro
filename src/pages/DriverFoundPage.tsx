import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, X, Star, Shield, Car, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { MapView } from '@/components/MapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { wsClient } from '@/lib/api';
import SOSButton from '@/components/SOSButton';
import { notifyDriverFound } from '@/lib/notifications';

export default function DriverFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRide, setCurrentRide } = useApp();
  const { user } = useAuth();
  const [eta, setEta] = useState(3);
  const [driverDeclined, setDriverDeclined] = useState(false);

  // Notify when driver is found
  useEffect(() => {
    if (currentRide?.driver) {
      notifyDriverFound(currentRide.driver.name, eta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (eta > 0) {
      const timer = setTimeout(() => setEta((e) => e - 1), 60000);
      return () => clearTimeout(timer);
    }
  }, [eta]);

  // WebSocket: listen for driver assignment and decline events
  useEffect(() => {
    wsClient.connect();

    const handleRideAssigned = (data: any) => {
      if (data.rideId === currentRide?.id && data.driver) {
        setCurrentRide({
          ...currentRide!,
          driver: data.driver,
          driverId: data.driver.id,
          driverName: data.driver.name,
          status: 'driver_found',
        });
        setDriverDeclined(false);
      }
    };

    const handleRideDeclined = (data: any) => {
      if (data.rideId === currentRide?.id) {
        setDriverDeclined(true);
      }
    };

    wsClient.on('ride_assigned', handleRideAssigned);
    wsClient.on('ride_declined', handleRideDeclined);

    return () => {
      wsClient.off('ride_assigned', handleRideAssigned);
      wsClient.off('ride_declined', handleRideDeclined);
    };
  }, [currentRide, setCurrentRide]);

  const handleInCar = useCallback(() => {
    setCurrentRide({
      ...currentRide!,
      status: 'in_progress',
    });
    navigate('/ride');
  }, [currentRide, setCurrentRide, navigate]);

  const handleSearchAgain = useCallback(() => {
    setDriverDeclined(false);
    wsClient.send('ride_request', {
      rideId: currentRide?.id || `ride_${Date.now()}`,
      pickup: currentRide?.pickup,
      destination: currentRide?.destination,
      passengerId: user?.uid || 'demo_user',
    });
  }, [currentRide, user]);

  const handleCancel = useCallback(() => {
    navigate('/cancel-ride');
  }, [navigate]);

  if (!currentRide?.driver) {
    return (
      <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col items-center justify-center">
        <Car size={48} color="#333333" />
        <p className="text-text-secondary mt-4">{t('noActiveRide')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm">{t('goHome')}</button>
      </div>
    );
  }

  const driver = currentRide.driver;

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView driverLocation={{ lat: currentRide.pickup.lat + 0.001, lng: currentRide.pickup.lng + 0.001 }} />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-floating safe-area-top">
        <div className="mx-4 mt-4 flex items-center justify-between">
          <motion.div
            className="bg-bg-elevated/90 backdrop-blur-xl px-4 py-2 rounded-full border border-primary/30 shadow-glow"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="text-primary text-sm font-semibold">{t('driverAssigned')}</span>
          </motion.div>
          <motion.button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
            whileTap={{ scale: 0.9 }}
            title={t('cancelRideTitle')}
          >
            <X size={18} color="#FFFFFF" />
          </motion.button>
        </div>
      </div>

      {/* ETA banner */}
      <motion.div
        className="absolute top-20 left-0 right-0 z-floating flex justify-center"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-primary/90 backdrop-blur-xl px-5 py-2 rounded-full shadow-glow">
          <span className="text-white font-bold text-sm">{eta > 0 ? `${eta} ${t('min')}` : t('arrived')}</span>
        </div>
      </motion.div>

      {/* Bottom sheet - Driver Card */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-piride-xl z-bottom-sheet shadow-sheet border-t border-white/5 max-w-[430px] mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 pb-8 space-y-4">
          {driverDeclined && (
            <motion.div
              className="bg-warning/10 border border-warning/30 rounded-piride-md p-3 text-center space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <p className="text-warning text-sm font-medium">Driver declined. Searching for another...</p>
              <button
                onClick={handleSearchAgain}
                className="text-primary text-sm font-semibold underline"
              >
                Search Again
              </button>
            </motion.div>
          )}

          {/* Driver info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-piPurple/30 flex items-center justify-center border-2 border-primary/20">
              <User size={28} color="#00C853" />
            </div>
            <div className="flex-1">
              <h3 className="text-text-primary font-semibold text-lg">{driver.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <Star size={14} fill="#F5A623" color="#F5A623" />
                  <span className="text-piGold text-sm font-medium">{driver.rating}</span>
                </div>
                <span className="text-text-tertiary text-xs">({driver.trips.toLocaleString()} {t('rides')})</span>
              </div>
            </div>
          </div>

          {/* Car info */}
          <div className="bg-bg-surface rounded-piride-md p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center">
                  <Car size={18} color="#A0A0A0" />
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium">{driver.car}</p>
                  <p className="text-text-tertiary text-xs font-mono">{driver.licensePlate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Shield size={14} />
                <span className="text-xs font-medium">{t('verified')}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-white/5"
              whileTap={{ scale: 0.95 }}
            >
              <Phone size={18} color="#00C853" />
              <span className="text-text-primary text-sm font-medium">{t('call')}</span>
            </motion.button>
            <motion.button
              className="flex-1 h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-white/5"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
            >
              <MessageCircle size={18} color="#448AFF" />
              <span className="text-text-primary text-sm font-medium">{t('chat')}</span>
            </motion.button>
          </div>

          {/* Cancel ride */}
          <motion.button
            onClick={handleCancel}
            className="w-full h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-error/20 text-error font-medium text-sm active:scale-[0.97] transition-transform"
            whileTap={{ scale: 0.97 }}
            style={{ touchAction: 'manipulation' }}
          >
            <AlertTriangle size={16} />
            {t('cancelRideTitle')}
          </motion.button>

          {/* CTA */}
          <PrimaryButton onClick={handleInCar} icon={<ChevronRight size={18} />}>
            {t('imInTheCar')}
          </PrimaryButton>
        </div>
      </motion.div>

      <SOSButton visible={true} />
    </div>
  );
}
