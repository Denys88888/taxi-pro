import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, X, Star, Shield, Car, ChevronRight, User } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';

export default function DriverFoundPage() {
  const navigate = useNavigate();
  const { currentRide, setCurrentRide } = useApp();
  const [eta, setEta] = useState(3);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    if (eta > 0) {
      const timer = setTimeout(() => setEta((e) => e - 1), 60000);
      return () => clearTimeout(timer);
    }
  }, [eta]);

  const handleInCar = useCallback(() => {
    setCurrentRide({
      ...currentRide!,
      status: 'in_progress',
    });
    navigate('/ride');
  }, [currentRide, setCurrentRide, navigate]);

  const handleCancel = useCallback(() => {
    if (!cancelConfirm) {
      setCancelConfirm(true);
    } else {
      setCurrentRide(null);
      navigate('/');
    }
  }, [cancelConfirm, setCurrentRide, navigate]);

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


          >
            <span className="text-primary text-sm font-semibold">{t('driverAssigned')}</span>
          </motion.div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
            
          >
            <X size={18} color={cancelConfirm ? '#FF5252' : '#FFFFFF'} />
          </button>
        </div>
      </div>

      {/* ETA banner */}
      <motion.div
        className="absolute top-20 left-0 right-0 z-floating flex justify-center"



      >
        <div className="bg-primary/90 backdrop-blur-xl px-5 py-2 rounded-full shadow-glow">
          <span className="text-white font-bold text-sm">{eta > 0 ? `${eta} ${t('eta')}` : t('arrived')}</span>
        </div>
      </motion.div>

      {/* Bottom sheet - Driver Card */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-piride-xl z-bottom-sheet shadow-sheet border-t border-white/5 max-w-[430px] mx-auto"



      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 pb-8 space-y-4">
          {cancelConfirm && (
            <motion.div
              className="bg-error/10 border border-error/30 rounded-piride-md p-3 text-center"


            >
              <p className="text-error text-sm font-medium">{t('tapCancelAgain')}</p>
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
                <span className="text-text-tertiary text-xs">({driver.trips.toLocaleString()} {t('rides').toLowerCase()})</span>
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
            <button
              className="flex-1 h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-white/5"
              
            >
              <Phone size={18} color="#00C853" />
              <span className="text-text-primary text-sm font-medium">{t('call')}</span>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="flex-1 h-12 bg-bg-surface rounded-piride-lg flex items-center justify-center gap-2 border border-white/5"
            >
              <MessageCircle size={18} color="#448AFF" />
              <span className="text-text-primary text-sm font-medium">{t('chat')}</span>
            </button>
          </div>

          {/* CTA */}
          <PrimaryButton onClick={handleInCar} icon={<ChevronRight size={18} />}>
            {t('imInTheCar')}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}
