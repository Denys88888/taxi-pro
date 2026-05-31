import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power,
  Check,
  MapPin,
  Clock,
  Navigation,
  CircleDot,
  Zap,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { MapContainer } from '@/components/MapContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import type { Ride } from '@/contexts/AppContext';
import type { LatLngTuple } from 'leaflet';

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_CENTER: LatLngTuple = [37.7749, -122.4194];

const DEMO_RIDES: Ride[] = [
  {
    id: 'ride_req_1',
    passengerId: 'pass_1',
    passengerName: 'Alice Johnson',
    pickup: { lat: 37.7789, lng: -122.4154, address: '123 Main St', name: 'Main St' },
    destination: { lat: 37.7709, lng: -122.4234, address: '456 Oak Ave', name: 'Oak Ave' },
    price: 3.44,
    status: 'searching',
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'ride_req_2',
    passengerId: 'pass_2',
    passengerName: 'Bob Smith',
    pickup: { lat: 37.7729, lng: -122.4114, address: '789 Pine Rd', name: 'Pine Rd' },
    destination: { lat: 37.7689, lng: -122.4274, address: '321 Elm St', name: 'Elm St' },
    price: 4.28,
    status: 'searching',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ride_req_3',
    passengerId: 'pass_3',
    passengerName: 'Carol White',
    pickup: { lat: 37.7809, lng: -122.4254, address: '555 Cedar Ln', name: 'Cedar Ln' },
    destination: { lat: 37.7669, lng: -122.4134, address: '888 Birch Blvd', name: 'Birch Blvd' },
    price: 5.64,
    status: 'searching',
    createdAt: new Date(Date.now() - 480000).toISOString(),
  },
];

const DISTANCES = [0.8, 1.5, 2.2];
const ESTIMATED_TIMES = [4, 7, 10];

// ─── Types ─────────────────────────────────────────────────────

interface RideRequest extends Ride {
  distanceKm: number;
  estimatedMin: number;
  driverGets: number;
}

// ─── Helper: Format time ago ───────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Animated counter hook ─────────────────────────────────────

function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
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
  }, [target, duration]);

  return value;
}

// ─── Sub-components ────────────────────────────────────────────

function OnlineToggle({
  isOnline,
  onToggle,
}: {
  isOnline: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          !isOnline ? 'text-text-secondary' : 'text-text-tertiary'
        }`}
      >
        Offline
      </span>

      <button
        onClick={onToggle}
        className="relative w-12 h-7 rounded-full transition-colors duration-200 select-none"
        style={{
          backgroundColor: isOnline ? '#27ae60' : '#e1e4e8',
          boxShadow: isOnline ? '0 0 16px rgba(39, 174, 96, 0.3)' : 'none',
        }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
          animate={{ x: isOnline ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          isOnline ? 'text-emerald' : 'text-text-tertiary'
        }`}
      >
        Online
      </span>
    </div>
  );
}

function EarningsPill({ amount }: { amount: number }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-4 py-2 rounded-full"
      style={{ backgroundColor: '#f0f7f0' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <span className="text-sm font-semibold text-emerald">
        π {amount.toFixed(2)}
      </span>
      <span className="text-xs text-text-secondary">today</span>
    </motion.div>
  );
}

function DriverPulseDot() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute w-8 h-8 rounded-full bg-emerald/30"
        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />
      <div
        className="w-4 h-4 rounded-full bg-emerald border-[3px] border-white"
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
      />
    </div>
  );
}

function RideRequestCard({
  ride,
  index,
  onAccept,
}: {
  ride: RideRequest;
  index: number;
  onAccept: (ride: RideRequest) => void;
}) {
  return (
    <motion.div
      className="mx-4 mb-3 bg-white rounded-piride-lg shadow-sm overflow-hidden"
      style={{ borderLeft: '4px solid #27ae60' }}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-120%', opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.08 + 0.5,
      }}
      layout="position"
    >
      <div className="flex items-start p-4">
        {/* Price Column */}
        <div className="w-20 flex-shrink-0 flex flex-col">
          <span className="text-lg font-bold text-emerald">
            π {ride.price.toFixed(2)}
          </span>
          <span className="text-xs text-text-secondary">
            You get: π {ride.driverGets.toFixed(2)}
          </span>
        </div>

        {/* Route Info */}
        <div className="flex-1 min-w-0">
          {/* Pickup */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald flex-shrink-0" />
            <span className="text-sm text-text-primary truncate">
              {ride.pickup.address}
            </span>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
            <span className="text-sm text-text-primary truncate">
              {ride.destination.address}
            </span>
          </div>

          {/* Distance Badge + Time */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-piride-sm text-xs font-medium"
              style={{ backgroundColor: 'rgba(44, 62, 80, 0.1)', color: '#2c3e50' }}
            >
              <Navigation size={10} className="mr-1" />
              {ride.distanceKm} km
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Clock size={10} />
              ~{ride.estimatedMin} min
            </span>
            <span className="text-xs text-text-tertiary">
              {timeAgo(ride.createdAt)}
            </span>
          </div>
        </div>

        {/* Accept Button */}
        <motion.button
          className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center flex-shrink-0 ml-2 shadow-md"
          onClick={() => onAccept(ride)}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Check size={24} className="text-white" strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyState({ isOnline }: { isOnline: boolean }) {
  if (!isOnline) {
    return (
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-midgray/30 flex items-center justify-center mb-4">
          <Power size={40} className="text-text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-text-secondary mb-2">
          You are offline
        </h3>
        <p className="text-base text-text-tertiary text-center">
          Toggle online to start receiving ride requests
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <motion.div
        className="w-24 h-24 flex items-center justify-center mb-4 opacity-40"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Zap size={48} className="text-warning" />
      </motion.div>
      <h3 className="text-lg font-semibold text-text-secondary mb-2">
        No ride requests nearby
      </h3>
      <p className="text-base text-text-tertiary text-center">
        Stay online — requests will appear here
      </p>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    driverStatus,
    setDriverStatus,
    setCurrentRide,
    currentRide,
  } = useApp();

  const [isOnline, setIsOnline] = useState(driverStatus !== 'offline');
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(12.34);
  const mapKey = useRef(0);

  const animatedEarnings = useAnimatedCounter(todayEarnings, 800);

  // Build initial ride requests when going online
  const generateRideRequests = useCallback((): RideRequest[] => {
    return DEMO_RIDES.map((ride, i) => ({
      ...ride,
      distanceKm: DISTANCES[i % DISTANCES.length],
      estimatedMin: ESTIMATED_TIMES[i % ESTIMATED_TIMES.length],
      driverGets: Number((ride.price * 0.98).toFixed(2)),
    }));
  }, []);

  // Handle online toggle
  const handleToggleOnline = useCallback(() => {
    const next = !isOnline;
    setIsOnline(next);
    setDriverStatus(next ? 'online' : 'offline');

    if (next) {
      // Going online: generate ride requests after a brief delay
      setTimeout(() => {
        setRideRequests(generateRideRequests());
      }, 500);
    } else {
      // Going offline: clear all requests
      setRideRequests([]);
    }
  }, [isOnline, setDriverStatus, generateRideRequests]);

  // Handle accept ride
  const handleAccept = useCallback(
    (ride: RideRequest) => {
      // Remove the card with animation, then navigate
      setRideRequests((prev) => prev.filter((r) => r.id !== ride.id));

      // Set as current ride in context
      const rideForContext: Ride = {
        ...ride,
        passengerId: ride.passengerId,
        passengerName: ride.passengerName,
        driverId: user?.uid || 'driver_1',
        driverName: user?.username || 'Demo Driver',
        status: 'driver_found',
        createdAt: ride.createdAt,
      };
      setCurrentRide(rideForContext);
      setDriverStatus('on_ride');

      // Navigate after brief delay for exit animation
      setTimeout(() => {
        navigate('/driver-nav');
      }, 400);
    },
    [navigate, setCurrentRide, setDriverStatus, user]
  );

  // Auto-refresh ride requests every 30s when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      setRideRequests((prev) => {
        if (prev.length === 0) return generateRideRequests();
        // Randomly shuffle or refresh
        return generateRideRequests().slice(0, 3);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, generateRideRequests]);

  // If navigating back with completed ride, add to earnings
  useEffect(() => {
    const stored = localStorage.getItem('piride_last_ride_earnings');
    if (stored) {
      try {
        const { amount } = JSON.parse(stored);
        setTodayEarnings((prev) => Number((prev + amount).toFixed(2)));
        localStorage.removeItem('piride_last_ride_earnings');
      } catch {
        // ignore
      }
    }
  }, []);

  // Derive mock demand dots for heatmap effect
  const heatmapDots = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      lat: DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.03,
      lng: DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.04,
      radius: 200 + Math.random() * 300,
      key: `heat_${i}`,
    }))
  );

  return (
    <Layout showNav={true}>
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-floating sticky top-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} />
        <EarningsPill amount={animatedEarnings} />
      </motion.header>

      {/* Mini Map - 30% viewport */}
      <motion.div
        className="relative w-full shrink-0"
        style={{ height: '30vh', minHeight: 200 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          showUserLocation={true}
        />

        {/* Driver pulse overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-map-overlay pointer-events-none">
          <DriverPulseDot />
        </div>

        {/* Heatmap dots (mock demand) */}
        {isOnline &&
          heatmapDots.current.map((dot) => (
            <div
              key={dot.key}
              className="absolute rounded-full pointer-events-none z-map-overlay"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                width: 30 + Math.random() * 20,
                height: 30 + Math.random() * 20,
                backgroundColor: 'rgba(243, 156, 18, 0.15)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
      </motion.div>

      {/* Section Header */}
      {isOnline && rideRequests.length > 0 && (
        <motion.div
          className="sticky top-[56px] z-floating bg-white px-4 py-3 border-b border-midgray"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Nearby Requests
            </h3>
            <AnimatePresence mode="wait">
              <motion.span
                key={rideRequests.length}
                className="text-sm text-text-secondary"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
              >
                {rideRequests.length} nearby
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Ride Requests List or Empty State */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-4">
        {isOnline && rideRequests.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {rideRequests.map((ride, index) => (
              <RideRequestCard
                key={ride.id}
                ride={ride}
                index={index}
                onAccept={handleAccept}
              />
            ))}
          </AnimatePresence>
        ) : (
          <EmptyState isOnline={isOnline} />
        )}
      </div>
    </Layout>
  );
}
