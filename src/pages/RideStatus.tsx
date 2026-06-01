import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Lock,
  MessageSquare,
  Phone,
  CheckCircle,
  Star,
  Car,
} from 'lucide-react';
import { MapContainer } from '@/components/MapContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { LatLngTuple } from 'leaflet';
import { useApp } from '@/contexts/AppContext';

// ─── Types ─────────────────────────────────────────────────────

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

interface PriceBreakdown {
  base: number;
  distancePrice: number;
  subtotal: number;
  commission: number;
  total: number;
  driverGets: number;
}

interface RideData {
  rideId: string;
  paymentId: string;
  amount: number;
}

interface DriverInfo {
  name: string;
  rating: number;
  car: string;
  plate: string;
}

type ScreenStatus = 'searching' | 'driver_found' | 'in_progress' | 'completed';

// ─── Mock Driver ───────────────────────────────────────────────

const MOCK_DRIVER: DriverInfo = {
  name: 'Michael Chen',
  rating: 4.8,
  car: 'Toyota Corolla',
  plate: 'ABC 1234',
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

// ─── Searching Animation ───────────────────────────────────────

const SearchingDots = React.memo(function SearchingDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-navy"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            delay: i * 0.133,
          }}
        />
      ))}
    </div>
  );
});

// ─── Driver Info Card ──────────────────────────────────────────

function DriverInfoCard({ driver }: { driver: DriverInfo }) {
  return (
    <motion.div
      className="flex items-center gap-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Avatar */}
      <motion.div
        className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center shrink-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Car size={24} className="text-navy" />
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <motion.p
          className="text-lg font-semibold text-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {driver.name}
        </motion.p>
        <motion.div
          className="flex items-center gap-2 mt-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-warning">★ {driver.rating}</span>
          <span className="text-sm text-text-secondary">
            {driver.car} · {driver.plate}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Star Rating ───────────────────────────────────────────────

function StarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileTap={{ scale: 1.2 }}
          onClick={() => onRate(star)}
          className="p-1"
        >
          <Star
            size={36}
            className={`transition-colors duration-200 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'fill-transparent text-warning'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

// ─── Status Pill ───────────────────────────────────────────────

function StatusPill({ status }: { status: ScreenStatus }) {
  const config: Record<ScreenStatus, { border: string; bg?: string; text: string; dotColor: string }> = {
    searching: { border: 'border-l-warning', text: 'Finding a nearby driver...', dotColor: '#f39c12' },
    driver_found: { border: 'border-l-navy', text: 'Driver is on the way', dotColor: '#2c3e50' },
    in_progress: { border: 'border-l-emerald', text: 'On the way to destination', dotColor: '#27ae60' },
    completed: { border: 'border-l-emerald', bg: 'bg-emerald', text: 'Ride Complete', dotColor: '#27ae60' },
  };

  const c = config[status];

  return (
    <motion.div
      className={`absolute top-16 left-4 right-4 z-floating flex items-center justify-center`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`flex items-center gap-2.5 bg-white rounded-full shadow-md px-4 py-2.5 border-l-4 ${c.border} ${
          status === 'completed' ? 'bg-emerald border-none' : ''
        }`}
      >
        {status === 'completed' ? (
          <CheckCircle size={16} className="text-white" />
        ) : (
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: c.dotColor }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span
          className={`text-sm font-medium ${
            status === 'completed' ? 'text-white' : 'text-text-primary'
          }`}
        >
          {c.text}
        </span>
      </div>
    </motion.div>
  );
}

import React from 'react';

// ─── Main Page ─────────────────────────────────────────────────

export default function RideStatus() {
  const navigate = useNavigate();
  const { setCurrentRide, updateRideStatus, addRideToHistory } = useApp();

  const [rideData, setRideData] = useState<RideData | null>(null);
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [status, setStatus] = useState<ScreenStatus>('searching');
  const [driverLocation, setDriverLocation] = useState<LatLngTuple | undefined>(undefined);
  const [eta] = useState(3);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { clearCurrentRide } = useApp();

  // ── Load ride data ──
  useEffect(() => {
    const rideJson = sessionStorage.getItem('taxipro_ride_data');
    const pickupJson = sessionStorage.getItem('taxipro_preview_pickup');
    const destJson = sessionStorage.getItem('taxipro_preview_destination');
    const routeJson = sessionStorage.getItem('taxipro_preview_route');
    const priceJson = sessionStorage.getItem('taxipro_preview_price');

    if (!rideJson) {
      navigate('/ride');
      return;
    }

    try {
      setRideData(JSON.parse(rideJson));
      if (pickupJson) setPickup(JSON.parse(pickupJson));
      if (destJson) setDestination(JSON.parse(destJson));
      if (routeJson) setRouteInfo(JSON.parse(routeJson));
      if (priceJson) setPriceBreakdown(JSON.parse(priceJson));
    } catch {
      navigate('/ride');
    }
  }, [navigate]);

  // ── Simulate state transitions ──
  useEffect(() => {
    if (!pickup || !destination) return;

    // Create ride in AppContext
    const rideId = rideData?.rideId || `ride_${Date.now()}`;
    setCurrentRide({
      id: rideId,
      passengerId: 'demo_user',
      passengerName: 'Demo User',
      pickup,
      destination,
      price: priceBreakdown?.total || 0,
      status: 'searching',
      createdAt: new Date().toISOString(),
    });

    // State 1: Searching (5s)
    const t1 = setTimeout(() => {
      setStatus('driver_found');
      updateRideStatus(rideId, 'driver_found');

      // Set mock driver location (near pickup)
      setDriverLocation([
        pickup.lat + 0.005,
        pickup.lng - 0.003,
      ]);

      // State 2: Driver Found → In Progress (6s)
      const t2 = setTimeout(() => {
        setStatus('in_progress');
        updateRideStatus(rideId, 'in_progress');

        // Animate driver toward destination
        setDriverLocation([pickup.lat, pickup.lng]);

        // Animate progress
        let prog = 0;
        const progressInterval = setInterval(() => {
          prog += 5;
          setProgress(prog);
          if (prog >= 100) {
            clearInterval(progressInterval);
          }
        }, 300);

        // State 3: In Progress → Completed (6s)
        const t3 = setTimeout(() => {
          setStatus('completed');
          updateRideStatus(rideId, 'completed');
          setDriverLocation([destination.lat, destination.lng]);

          // Save to history
          addRideToHistory({
            id: rideId,
            passengerId: 'demo_user',
            passengerName: 'Demo User',
            driverId: 'driver_mock',
            driverName: MOCK_DRIVER.name,
            pickup,
            destination,
            price: priceBreakdown?.total || 0,
            status: 'completed',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          });

          timerRef.current = null;
        }, 6000);

        timerRef.current = t3;
      }, 6000);

      timerRef.current = t2;
    }, 5000);

    timerRef.current = t1;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pickup, destination]);

  // ── Handle cancel ──
  // ── Handle cancel ──
  const handleCancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rideData) {
      updateRideStatus(rideData.rideId, 'cancelled');
    }
    clearCurrentRide();
    navigate('/ride');
  }, [rideData, navigate, clearCurrentRide, updateRideStatus]);

  // ── Handle done ──
  const handleDone = useCallback(() => {
    if (rideData && rating > 0) {
      console.log(`Rated ride ${rideData.rideId}: ${rating} stars, comment: ${comment}`);
    }
    navigate('/history');
  }, [rideData, rating, comment, navigate]);

  // ── Derived values ──
  const pickupTuple = pickup
    ? ([pickup.lat, pickup.lng] as LatLngTuple)
    : undefined;
  const destTuple = destination
    ? ([destination.lat, destination.lng] as LatLngTuple)
    : undefined;

  if (!pickup || !destination || !priceBreakdown || !routeInfo) {
    return null;
  }

  return (
    <div className="mobile-container bg-offwhite relative overflow-hidden flex flex-col min-h-[100dvh]">
      {/* ── Map Area ── */}
      <div className="relative h-[55%] min-h-[50%]">
        <div className="absolute inset-0 z-map">
          <MapContainer
            center={
              status === 'completed'
                ? destTuple
                : driverLocation || pickupTuple
            }
            pickupLocation={pickupTuple}
            destinationLocation={destTuple}
            driverLocation={driverLocation}
            showUserLocation={false}
          />
        </div>

        {/* Back / Close Button */}
        <motion.button
          className="absolute top-4 left-4 z-floating w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (status === 'in_progress' || status === 'driver_found') {
              setShowCancelConfirm(true);
            } else if (status === 'completed') {
              handleDone();
            } else {
              setShowCancelConfirm(true);
            }
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <X size={20} className="text-text-primary" />
        </motion.button>

        {/* Status Pill */}
        <StatusPill status={status} />
      </div>

      {/* ── Bottom Sheet ── */}
      <div className="flex-1 relative">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-taxipro-xl shadow-lg"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-midgray rounded-full" />
          </div>

          <div className="px-4 pb-6 max-h-[45vh] overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
              {/* ── State 1: Searching ── */}
              {status === 'searching' && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchingDots />
                  <h3 className="text-lg font-semibold text-text-primary text-center">
                    Searching for drivers nearby
                  </h3>
                  <p className="text-base text-text-secondary text-center mt-1">
                    This may take a moment
                  </p>

                  {/* Ride summary */}
                  <div className="mt-4 pt-4 border-t border-midgray">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{pickup.name || pickup.address}</span>
                      <span className="shrink-0">→</span>
                      <span className="truncate">{destination.name || destination.address}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {routeInfo.distance.toFixed(1)} km · π {priceBreakdown.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Payment status */}
                  <div className="mt-3 flex items-center gap-2">
                    <Lock size={14} className="text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      π {priceBreakdown.total.toFixed(2)} held in escrow
                    </span>
                    <span className="text-sm font-medium text-emerald ml-auto">
                      Secure
                    </span>
                  </div>

                  {/* Cancel button */}
                  <motion.button
                    className="w-full h-[52px] rounded-taxipro-md border-2 border-error text-error font-medium text-base mt-4 active:bg-error/5 transition-colors"
                    onClick={() => setShowCancelConfirm(true)}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel Ride
                  </motion.button>
                </motion.div>
              )}

              {/* ── State 2: Driver Found ── */}
              {status === 'driver_found' && (
                <motion.div
                  key="driver_found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DriverInfoCard driver={MOCK_DRIVER} />

                  {/* ETA */}
                  <div className="flex items-center gap-2 mt-3 pb-3 border-b border-midgray">
                    <Clock size={18} className="text-navy" />
                    <span className="text-base font-medium text-navy">
                      Arriving in ~{eta} minutes
                    </span>
                  </div>

                  {/* Ride Summary */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={14} />
                      <span className="truncate">{pickup.name || pickup.address}</span>
                      <span className="shrink-0">→</span>
                      <span className="truncate">{destination.name || destination.address}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {routeInfo.distance.toFixed(1)} km · π {priceBreakdown.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Payment status */}
                  <div className="mt-3 flex items-center gap-2 pb-3 border-b border-midgray">
                    <Lock size={14} className="text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      π {priceBreakdown.total.toFixed(2)} held in escrow
                    </span>
                    <span className="text-sm font-medium text-emerald ml-auto">Secure</span>
                  </div>

                  {/* Contact buttons */}
                  <div className="flex gap-3 mt-4">
                    <motion.button
                      className="flex-1 h-12 rounded-taxipro-md border-2 border-navy text-navy font-medium text-sm flex items-center justify-center gap-2 active:bg-navy/5"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => alert('Messaging feature coming soon!')}
                    >
                      <MessageSquare size={18} />
                      Message
                    </motion.button>
                    <motion.button
                      className="flex-1 h-12 rounded-taxipro-md border-2 border-navy text-navy font-medium text-sm flex items-center justify-center gap-2 active:bg-navy/5"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => alert('Calling feature coming soon!')}
                    >
                      <Phone size={18} />
                      Call
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── State 3: In Progress ── */}
              {status === 'in_progress' && (
                <motion.div
                  key="in_progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Status Banner */}
                  <div className="flex items-center gap-2 bg-emerald/10 rounded-taxipro-md p-3 mb-4">
                    <CheckCircle size={20} className="text-emerald" />
                    <span className="text-base font-medium text-emerald">
                      Ride in progress
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="h-1.5 bg-lightgray rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: easeOut }}
                      />
                    </div>
                    <p className="text-sm text-text-secondary mt-1.5">
                      {(routeInfo.distance * (progress / 100)).toFixed(1)} of {routeInfo.distance.toFixed(1)} km completed
                    </p>
                  </div>

                  {/* Driver compact row */}
                  <div className="flex items-center gap-3 py-3 border-b border-midgray">
                    <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center">
                      <Car size={18} className="text-navy" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {MOCK_DRIVER.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        ★ {MOCK_DRIVER.rating}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-emerald bg-emerald/10 px-2 py-1 rounded-taxipro-sm">
                      En route
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="py-3 border-b border-midgray">
                    <p className="text-sm text-text-secondary">Heading to:</p>
                    <p className="text-base text-text-primary mt-0.5">
                      {destination.name || destination.address}
                    </p>
                  </div>

                  {/* ETA */}
                  <div className="flex items-center gap-2 pt-3">
                    <Clock size={18} className="text-navy" />
                    <span className="text-lg font-semibold text-navy">
                      ETA: ~{Math.max(1, Math.ceil((routeInfo.duration / 60) * ((100 - progress) / 100)))} minutes
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ── State 4: Completed ── */}
              {status === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Completion Header */}
                  <div className="flex flex-col items-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <CheckCircle size={48} className="text-emerald" />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-bold text-text-primary mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Ride Complete!
                    </motion.h2>
                    <motion.p
                      className="text-base text-text-secondary mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      You arrived at your destination
                    </motion.p>
                  </div>

                  {/* Ride Summary */}
                  <motion.div
                    className="bg-white border border-midgray rounded-taxipro-lg p-4 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <MapPin size={14} />
                      <span className="truncate">{pickup.name || pickup.address}</span>
                      <span>→</span>
                      <span className="truncate">{destination.name || destination.address}</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {routeInfo.distance.toFixed(1)} km · ~{Math.ceil(routeInfo.duration / 60)} min
                    </p>
                  </motion.div>

                  {/* Payment Summary */}
                  <motion.div
                    className="bg-white border border-midgray rounded-taxipro-lg p-4 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-base font-semibold text-text-primary mb-3">
                      Payment Summary
                    </h3>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">Ride fare</span>
                      <span className="text-sm text-text-primary">
                        π {priceBreakdown.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">Platform fee</span>
                      <span className="text-sm text-text-primary">
                        π {priceBreakdown.commission.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-midgray my-2" />
                    <div className="flex justify-between mb-1.5">
                      <span className="text-base font-medium text-text-primary">
                        Total paid
                      </span>
                      <span className="text-base font-bold text-text-primary">
                        π {priceBreakdown.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Status</span>
                      <span className="text-sm font-medium text-emerald">
                        Completed ✓
                      </span>
                    </div>
                  </motion.div>

                  {/* Driver Rating */}
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-base font-semibold text-text-primary text-center">
                      Rate your driver
                    </h3>
                    <StarRating rating={rating} onRate={setRating} />

                    {/* Comment */}
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Leave a comment (optional)"
                      className="w-full h-12 bg-lightgray rounded-taxipro-md px-4 text-base text-text-primary placeholder:text-text-tertiary outline-none mt-2"
                    />
                  </motion.div>

                  {/* Done Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <PrimaryButton onClick={handleDone}>Done</PrimaryButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            className="fixed inset-0 z-modal-overlay bg-black/50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-taxipro-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {status === 'in_progress' || status === 'driver_found'
                  ? 'Cancel Active Ride?'
                  : 'Cancel Ride?'}
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                {status === 'in_progress' || status === 'driver_found'
                  ? 'Cancelling during an active ride may forfeit your payment. Are you sure?'
                  : 'Are you sure you want to cancel this ride? Your escrow payment will be refunded.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 h-12 rounded-taxipro-md border-2 border-midgray text-text-secondary font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 h-12 rounded-taxipro-md bg-error text-white font-medium"
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
