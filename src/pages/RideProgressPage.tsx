import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Navigation, Share2, MapPin, Shield, Clock } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';

export default function RideProgressPage() {
  const navigate = useNavigate();
  const { currentRide, pickup, destination, routeDuration, setCurrentRide, addRideToHistory } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [shared, setShared] = useState(false);

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

  const handleShare = useCallback(async () => {
    try {
      await navigator.share?.({
        title: 'My Taxi Pro Trip',
        text: `I'm on a ride to ${destination?.name}. Track my trip!`,
      });
    } catch {
      // Fallback
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }, [destination]);

  if (!currentRide) {
    return (
      <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col items-center justify-center">
        <MapPin size={48} color="#333333" />
        <p className="text-text-secondary mt-4">No active ride</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm">Go Home</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView driverLocation={{ lat: pickup.lat + (progress / 100) * 0.005, lng: pickup.lng + (progress / 100) * 0.005 }} />

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
              En Route
            </span>
          </motion.div>
          <motion.button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
            whileTap={{ scale: 0.9 }}
          >
            {shared ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary text-xs font-bold">OK</motion.span>
            ) : (
              <Share2 size={18} color="#FFFFFF" />
            )}
          </motion.button>
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
                  <Clock size={12} /> {elapsed} min
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
                <p className="text-text-tertiary text-xs">Destination</p>
                <p className="text-text-primary text-sm font-medium truncate">{destination?.name}</p>
              </div>
            </div>

            {/* Safety note */}
            <div className="flex items-center gap-2 text-text-tertiary text-xs">
              <Shield size={12} color="#00C853" />
              <span>Ride covered by escrow protection</span>
            </div>

            {/* CTA */}
            <PrimaryButton onClick={handleComplete}>
              Complete Ride
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
