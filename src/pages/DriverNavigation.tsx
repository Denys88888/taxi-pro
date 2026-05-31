import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Play,
  CheckCircle,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  Car,
  User,
} from 'lucide-react';
import { MapContainer } from '@/components/MapContainer';
import { useApp } from '@/contexts/AppContext';
import type { LatLngTuple } from 'leaflet';
import type { Ride } from '@/contexts/AppContext';

// ─── Types ─────────────────────────────────────────────────────

type NavPhase = 'to_pickup' | 'start_ride' | 'to_destination' | 'completed';

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_CENTER: LatLngTuple = [37.7749, -122.4194];

// Mock driver route positions for simulation
const DRIVER_PATH_TO_PICKUP: LatLngTuple[] = [
  [37.7749, -122.4194],
  [37.7755, -122.4188],
  [37.7762, -122.4180],
  [37.7768, -122.4173],
  [37.7775, -122.4165],
  [37.7780, -122.4158],
  [37.7789, -122.4154],
];

const DRIVER_PATH_TO_DEST: LatLngTuple[] = [
  [37.7789, -122.4154],
  [37.7783, -122.4162],
  [37.7775, -122.4170],
  [37.7765, -122.4180],
  [37.7755, -122.4190],
  [37.7745, -122.4200],
  [37.7735, -122.4210],
  [37.7725, -122.4220],
  [37.7715, -122.4230],
  [37.7709, -122.4234],
];

// ─── Animated counter hook ─────────────────────────────────────

function useAnimatedCounter(target: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((target * eased).toFixed(2)));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration, enabled]);

  return enabled ? value : 0;
}

// ─── Passenger Info Sheet ──────────────────────────────────────

function PassengerSheet({
  ride,
  phase,
}: {
  ride: Ride;
  phase: NavPhase;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const driverGets = Number((ride.price * 0.98).toFixed(2));
  const commission = Number((ride.price * 0.02).toFixed(2));

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-piride-xl shadow-xl z-bottom-sheet"
      style={{ maxWidth: 430, margin: '0 auto' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 0.4 }}
    >
      {/* Drag Handle */}
      <div
        className="w-full flex justify-center pt-3 pb-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-10 h-1 bg-midgray rounded-full cursor-pointer" />
      </div>

      {/* Collapsed Hint */}
      {!isExpanded && (
        <div className="text-center pb-2">
          <span className="text-xs text-text-tertiary">Swipe up for details</span>
        </div>
      )}

      {/* Collapsed: Quick Info */}
      {!isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                <User size={20} className="text-navy" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {ride.passengerName}
                </p>
                <p className="text-xs text-text-secondary">
                  {phase === 'to_pickup' || phase === 'start_ride'
                    ? 'Pickup: ' + ride.pickup.address
                    : 'To: ' + ride.destination.address}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald">
                π {driverGets}
              </p>
              <p className="text-xs text-text-secondary">earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded: Full Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="px-4 pb-6 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Passenger Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                <User size={24} className="text-navy" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {ride.passengerName}
                </p>
                <p className="text-sm text-text-secondary">Passenger</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-midgray my-3" />

            {/* Ride Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald" />
                <span className="text-sm text-text-primary truncate">
                  {ride.pickup.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-sm text-text-primary truncate">
                  {ride.destination.address}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Ride distance: ~{Number((ride.price * 0.6).toFixed(1))} km
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-midgray my-3" />

            {/* Earnings Preview */}
            <div className="mb-4">
              <p className="text-xs text-text-secondary mb-1">You will earn</p>
              <p className="text-xl font-bold text-emerald">π {driverGets}</p>
              <p className="text-xs text-text-tertiary">
                (π {ride.price.toFixed(2)} total minus π {commission.toFixed(2)} 2% fee)
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-midgray my-3" />

            {/* Contact Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 h-12 rounded-piride-md border-[1.5px] border-navy text-navy font-medium text-sm flex items-center justify-center gap-2 active:bg-navy/5">
                <MessageCircle size={18} />
                Message
              </button>
              <button className="flex-1 h-12 rounded-piride-md border-[1.5px] border-navy text-navy font-medium text-sm flex items-center justify-center gap-2 active:bg-navy/5">
                <Phone size={18} />
                Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Completion Summary Sheet ──────────────────────────────────

function CompletionSummary({
  ride,
  distance,
  duration,
  onDone,
}: {
  ride: Ride;
  distance: number;
  duration: number;
  onDone: () => void;
}) {
  const earnings = Number((ride.price * 0.98).toFixed(2));
  const animatedEarnings = useAnimatedCounter(earnings, 800, true);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-piride-xl shadow-xl z-bottom-sheet"
      style={{ maxWidth: 430, margin: '0 auto' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="flex flex-col items-center px-6 pt-8 pb-6">
        {/* Success Icon */}
        <motion.div
          className="w-16 h-16 rounded-full bg-emerald flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
        >
          <CheckCircle size={32} className="text-white" />
        </motion.div>

        <h3 className="text-xl font-semibold text-text-primary mb-1">
          Ride Complete!
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Great job! Here is your ride summary.
        </p>

        {/* Stats */}
        <div className="w-full flex items-center justify-around mb-6">
          <div className="flex flex-col items-center">
            <Car size={20} className="text-navy mb-1" />
            <span className="text-lg font-semibold text-text-primary">
              {distance.toFixed(1)} km
            </span>
            <span className="text-xs text-text-secondary">Distance</span>
          </div>
          <div className="w-px h-10 bg-midgray" />
          <div className="flex flex-col items-center">
            <Clock size={20} className="text-navy mb-1" />
            <span className="text-lg font-semibold text-text-primary">
              {duration} min
            </span>
            <span className="text-xs text-text-secondary">Duration</span>
          </div>
          <div className="w-px h-10 bg-midgray" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-emerald">
              π {animatedEarnings.toFixed(2)}
            </span>
            <span className="text-xs text-text-secondary">Earned</span>
          </div>
        </div>

        {/* Route */}
        <div className="w-full flex items-center gap-2 px-4 py-3 bg-offwhite rounded-piride-md mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald flex-shrink-0" />
          <span className="text-xs text-text-primary truncate">
            {ride.pickup.address}
          </span>
          <Navigation size={12} className="text-text-tertiary flex-shrink-0" />
          <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
          <span className="text-xs text-text-primary truncate">
            {ride.destination.address}
          </span>
        </div>

        <p className="text-xs text-text-tertiary">
          Redirecting to earnings...
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────

export default function DriverNavigation() {
  const navigate = useNavigate();
  const { currentRide, setCurrentRide, setDriverStatus, addRideToHistory } = useApp();

  const [phase, setPhase] = useState<NavPhase>('to_pickup');
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [driverPos, setDriverPos] = useState(0);
  const [simDistance, setSimDistance] = useState(1.2);
  const [rideDuration, setRideDuration] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Get active ride from context or use a mock fallback
  const activeRide = currentRide;

  // Build ride positions for map
  const pickupLocation: LatLngTuple | undefined = activeRide
    ? [activeRide.pickup.lat, activeRide.pickup.lng]
    : undefined;

  const destinationLocation: LatLngTuple | undefined = activeRide
    ? [activeRide.destination.lat, activeRide.destination.lng]
    : undefined;

  const driverLocation: LatLngTuple | undefined =
    phase === 'to_pickup'
      ? DRIVER_PATH_TO_PICKUP[Math.min(driverPos, DRIVER_PATH_TO_PICKUP.length - 1)]
      : phase === 'to_destination'
      ? DRIVER_PATH_TO_DEST[Math.min(driverPos, DRIVER_PATH_TO_DEST.length - 1)]
      : pickupLocation;

  // Simulate driver movement along the path
  useEffect(() => {
    if (phase === 'completed') return;

    const interval = setInterval(() => {
      setDriverPos((prev) => {
        const maxPos =
          phase === 'to_pickup'
            ? DRIVER_PATH_TO_PICKUP.length - 1
            : phase === 'to_destination'
            ? DRIVER_PATH_TO_DEST.length - 1
            : 0;
        if (prev >= maxPos) return prev;
        return prev + 1;
      });

      // Decrease remaining distance
      setSimDistance((prev) => Math.max(0, prev - 0.15));

      // Track ride duration
      if (phase === 'to_destination') {
        setRideDuration(Math.floor((Date.now() - startTimeRef.current) / 60000));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  // Handle phase transitions
  const handleArrived = useCallback(() => {
    setPhase('start_ride');
    setDriverPos(0);
    setSimDistance(3.8);
  }, []);

  const handleStartRide = useCallback(() => {
    setPhase('to_destination');
    startTimeRef.current = Date.now();
    setDriverPos(0);
  }, []);

  const handleCompleteRide = useCallback(() => {
    setPhase('completed');

    // Store earnings for dashboard
    if (activeRide) {
      const earnings = Number((activeRide.price * 0.98).toFixed(2));
      localStorage.setItem(
        'piride_last_ride_earnings',
        JSON.stringify({ amount: earnings, rideId: activeRide.id })
      );

      // Add to history
      const completedRide = {
        ...activeRide,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
      addRideToHistory(completedRide);
    }

    setDriverStatus('online');
  }, [activeRide, addRideToHistory, setDriverStatus]);

  const handleNavigateToEarnings = useCallback(() => {
    setCurrentRide(null);
    navigate('/earnings');
  }, [navigate, setCurrentRide]);

  // Handle back button
  const handleBack = useCallback(() => {
    if (phase === 'to_destination' || phase === 'start_ride') {
      setShowBackConfirm(true);
    } else {
      setCurrentRide(null);
      setDriverStatus('online');
      navigate('/driver');
    }
  }, [phase, navigate, setCurrentRide, setDriverStatus]);

  const confirmCancel = useCallback(() => {
    setCurrentRide(null);
    setDriverStatus('online');
    setShowBackConfirm(false);
    navigate('/driver');
  }, [navigate, setCurrentRide, setDriverStatus]);

  // If no active ride, show a message
  if (!activeRide) {
    return (
      <div className="mobile-container relative flex flex-col items-center justify-center bg-offwhite">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-4">
          <Navigation size={32} className="text-navy" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          No Active Ride
        </h1>
        <p className="text-sm text-text-secondary text-center px-8 mb-6">
          You do not have an active ride. Go back to the dashboard to accept a ride request.
        </p>
        <button
          onClick={() => navigate('/driver')}
          className="px-6 py-3 bg-emerald text-white rounded-piride-md font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-container relative overflow-hidden" style={{ height: '100dvh' }}>
      {/* Full-screen Map */}
      <motion.div
        className="absolute inset-0 z-map"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <MapContainer
          center={driverLocation || pickupLocation || DEFAULT_CENTER}
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          driverLocation={driverLocation}
          showUserLocation={false}
        />
      </motion.div>

      {/* Floating Back Button */}
      <motion.button
        className="absolute top-4 left-4 z-floating w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
        onClick={handleBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={20} className="text-text-primary" />
      </motion.button>

      {/* Ride Info Card */}
      <motion.div
        className="absolute top-16 left-4 right-4 z-floating bg-white rounded-piride-lg shadow-md px-4 py-3"
        style={{ maxWidth: 430, margin: '0 auto' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {(phase === 'to_pickup' || phase === 'start_ride') && (
            <motion.div
              key="pickup-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-emerald" />
                <span className="text-sm text-text-primary truncate">
                  Pickup: {activeRide.pickup.address}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                {phase === 'to_pickup'
                  ? `Distance remaining: ${Math.max(0.1, simDistance).toFixed(1)} km`
                  : 'Waiting for passenger — tap Start Ride when ready'}
              </span>
            </motion.div>
          )}
          {phase === 'to_destination' && (
            <motion.div
              key="dest-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Navigation size={14} className="text-emerald" />
                <span className="text-sm text-text-primary truncate">
                  To: {activeRide.destination.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  {Math.max(0.1, simDistance).toFixed(1)} km remaining
                </span>
                <span className="text-xs text-emerald font-medium">
                  π {(activeRide.price * 0.98).toFixed(2)} earnings
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Action Bar */}
      {phase !== 'completed' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-piride-lg shadow-xl z-bottom-sheet"
          style={{ maxWidth: 430, margin: '0 auto' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
            delay: 0.4,
          }}
        >
          <div className="px-4 pt-4 pb-6 safe-area-bottom">
            <AnimatePresence mode="wait">
              {/* State 1: I have arrived */}
              {phase === 'to_pickup' && (
                <motion.div
                  key="arrived"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="w-full h-[52px] rounded-piride-md bg-emerald text-white font-medium text-base flex items-center justify-center gap-2 active:bg-emerald-light"
                    onClick={handleArrived}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <MapPin size={20} />
                    I have Arrived at Pickup
                  </motion.button>
                  <p className="text-center text-xs text-text-secondary mt-2">
                    Pickup: {activeRide.pickup.address}
                  </p>
                </motion.div>
              )}

              {/* State 2: Start Ride */}
              {phase === 'start_ride' && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="w-full h-[52px] rounded-piride-md bg-navy text-white font-medium text-base flex items-center justify-center gap-2 active:bg-navy-light"
                    onClick={handleStartRide}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Play size={20} />
                    Start Ride
                  </motion.button>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-xs text-text-secondary truncate flex-1 mr-2">
                      Heading to: {activeRide.destination.address}
                    </p>
                    <p className="text-xs font-medium text-emerald">
                      π {(activeRide.price * 0.98).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* State 3: Complete Ride */}
              {phase === 'to_destination' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    className="w-full h-[52px] rounded-piride-md bg-emerald text-white font-medium text-base flex items-center justify-center gap-2 active:bg-emerald-light"
                    onClick={handleCompleteRide}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <CheckCircle size={20} />
                    Complete Ride
                  </motion.button>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-xs text-text-secondary">
                      {Math.max(0.1, simDistance).toFixed(1)} km remaining
                    </p>
                    <p className="text-xs font-medium text-emerald">
                      π {(activeRide.price * 0.98).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Passenger Info Sheet */}
      {phase !== 'completed' && (
        <PassengerSheet ride={activeRide} phase={phase} />
      )}

      {/* Completion Summary Overlay */}
      <AnimatePresence>
        {phase === 'completed' && (
          <CompletionSummary
            ride={activeRide}
            distance={Number((activeRide.price * 0.6).toFixed(1))}
            duration={rideDuration || 12}
            onDone={handleNavigateToEarnings}
          />
        )}
      </AnimatePresence>

      {/* Back/Cancel Confirmation Dialog */}
      <AnimatePresence>
        {showBackConfirm && (
          <motion.div
            className="fixed inset-0 z-modal-overlay bg-black/50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-piride-xl p-6 w-full max-w-xs"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Cancel this ride?
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                You are in the middle of a ride. Cancelling will affect your completion rate.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBackConfirm(false)}
                  className="flex-1 h-12 rounded-piride-md border-[1.5px] border-midgray text-text-primary font-medium text-sm"
                >
                  Keep Riding
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 h-12 rounded-piride-md bg-error text-white font-medium text-sm"
                >
                  Cancel Ride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
