import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  RefreshCw,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { EmptyRides } from '@/components/icons';
import { useApp } from '@/contexts/AppContext';

interface RideDetail {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  baseFare: number;
  distanceFare: number;
  commission: number;
  driverGets: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  driverName: string;
  rating?: number;
  comment?: string;
}

// Generate 8 mock past rides with varied statuses, dates, and prices
const generateMockRides = (): RideDetail[] => [
  {
    id: 'ride_today_1',
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
    pickup: '123 Market St',
    destination: '456 Mission St',
    distance: 5.2,
    duration: 15,
    price: 8.41,
    baseFare: 2.00,
    distanceFare: 6.24,
    commission: 0.17,
    driverGets: 8.24,
    status: 'completed',
    driverName: 'Driver Alex',
    rating: 5,
    comment: 'Great ride!',
  },
  {
    id: 'ride_today_2',
    date: new Date(Date.now() - 6 * 3600000).toISOString(),
    pickup: '789 Castro St',
    destination: '321 Embarcadero',
    distance: 3.8,
    duration: 12,
    price: 6.12,
    baseFare: 2.00,
    distanceFare: 4.00,
    commission: 0.12,
    driverGets: 5.88,
    status: 'in_progress',
    driverName: 'Driver Sam',
  },
  {
    id: 'ride_yesterday_1',
    date: new Date(Date.now() - 26 * 3600000).toISOString(),
    pickup: '654 Haight St',
    destination: '987 Folsom St',
    distance: 4.5,
    duration: 18,
    price: 7.30,
    baseFare: 2.00,
    distanceFare: 5.15,
    commission: 0.15,
    driverGets: 7.15,
    status: 'completed',
    driverName: 'Driver Jordan',
    rating: 4,
  },
  {
    id: 'ride_yesterday_2',
    date: new Date(Date.now() - 30 * 3600000).toISOString(),
    pickup: '555 Hayes St',
    destination: '111 Divisadero St',
    distance: 2.1,
    duration: 8,
    price: 3.44,
    baseFare: 2.00,
    distanceFare: 1.37,
    commission: 0.07,
    driverGets: 3.37,
    status: 'cancelled',
    driverName: 'Driver Taylor',
  },
  {
    id: 'ride_earlier_1',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    pickup: '222 Valencia St',
    destination: '333 Potrero Ave',
    distance: 6.1,
    duration: 22,
    price: 9.85,
    baseFare: 2.00,
    distanceFare: 7.66,
    commission: 0.20,
    driverGets: 9.66,
    status: 'completed',
    driverName: 'Driver Morgan',
    rating: 5,
  },
  {
    id: 'ride_earlier_2',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    pickup: '444 Noe St',
    destination: '777 Gough St',
    distance: 3.3,
    duration: 11,
    price: 5.35,
    baseFare: 2.00,
    distanceFare: 3.25,
    commission: 0.11,
    driverGets: 5.24,
    status: 'completed',
    driverName: 'Driver Casey',
    rating: 4,
  },
  {
    id: 'ride_earlier_3',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    pickup: '888 Irving St',
    destination: '999 9th Ave',
    distance: 1.8,
    duration: 7,
    price: 2.91,
    baseFare: 2.00,
    distanceFare: 0.85,
    commission: 0.06,
    driverGets: 2.85,
    status: 'cancelled',
    driverName: 'Driver Riley',
  },
  {
    id: 'ride_earlier_4',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    pickup: '101 Sunset Blvd',
    destination: '202 Lombard St',
    distance: 7.4,
    duration: 25,
    price: 11.94,
    baseFare: 2.00,
    distanceFare: 9.70,
    commission: 0.24,
    driverGets: 11.70,
    status: 'completed',
    driverName: 'Driver Quinn',
    rating: 5,
    comment: 'Very professional!',
  },
];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const rideDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (rideDate.getTime() === today.getTime()) return 'Today';
  if (rideDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

type DateGroup = 'Today' | 'Yesterday' | 'Earlier';

function getDateGroup(dateStr: string): DateGroup {
  const label = formatDate(dateStr);
  if (label === 'Today') return 'Today';
  if (label === 'Yesterday') return 'Yesterday';
  return 'Earlier';
}

function StatusBadge({ status }: { status: RideDetail['status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald/10 text-emerald">
        <CheckCircle size={12} />
        Completed
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
        <XCircle size={12} />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
      <Timer size={12} />
      In Progress
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-warning fill-warning' : 'text-midgray'}
        />
      ))}
    </div>
  );
}

function RideCard({ ride, index }: { ride: RideDetail; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const dateLabel = formatDate(ride.date);
  const timeStr = formatTime(ride.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.06, 0.3),
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      className="bg-white"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center gap-3 cursor-pointer"
      >
        {/* Route Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald shrink-0" />
            <span className="text-sm text-text-primary truncate">{ride.pickup}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-error shrink-0" />
            <span className="text-sm text-text-primary truncate">{ride.destination}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 ml-4">
            <Clock size={12} className="text-text-tertiary" />
            <span className="text-xs text-text-secondary">
              {ride.distance} km &middot; {ride.duration} min
            </span>
          </div>
        </div>

        {/* Price + Status */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-base font-semibold text-text-primary">
            <span className="text-emerald mr-0.5">&#960;</span>
            {ride.price.toFixed(2)}
          </span>
          <StatusBadge status={ride.status} />
          <div className="flex items-center gap-1 text-text-tertiary">
            <span className="text-xs">{timeStr}</span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Divider */}
              <div className="border-t border-midgray" />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-tertiary">Date &amp; Time</p>
                  <p className="text-sm text-text-primary">{dateLabel}, {timeStr}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Driver</p>
                  <p className="text-sm text-text-primary">{ride.driverName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Distance</p>
                  <p className="text-sm text-text-primary">{ride.distance} km</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Duration</p>
                  <p className="text-sm text-text-primary">{ride.duration} min</p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="border-t border-midgray pt-3">
                <p className="text-xs text-text-tertiary mb-2">Payment Breakdown</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Base fare</span>
                    <span className="text-text-primary">&#960; {ride.baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Distance</span>
                    <span className="text-text-primary">&#960; {ride.distanceFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary">&#960; {(ride.baseFare + ride.distanceFare).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Platform fee (2%)</span>
                    <span className="text-text-primary">&#960; {ride.commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-midgray pt-1">
                    <span className="text-text-primary">Total</span>
                    <span className="text-text-primary">&#960; {ride.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {ride.rating !== undefined && ride.status === 'completed' && (
                <div className="border-t border-midgray pt-3">
                  <p className="text-xs text-text-tertiary mb-1">Your Rating</p>
                  <StarRating rating={ride.rating} />
                  {ride.comment && (
                    <p className="text-sm text-text-secondary mt-1 italic">&ldquo;{ride.comment}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RideHistory() {
  const navigate = useNavigate();
  const { generateMockRideHistory } = useApp();
  const [rides, setRides] = useState<RideDetail[]>(generateMockRides);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const groupedRides = useMemo(() => {
    const groups: Record<DateGroup, RideDetail[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    rides.forEach((ride) => {
      const group = getDateGroup(ride.date);
      groups[group].push(ride);
    });
    return groups;
  }, [rides]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      const shuffled = [...rides].sort(() => Math.random() - 0.5);
      setRides(shuffled);
      setIsRefreshing(false);
    }, 1200);
  };

  const groupLabels: DateGroup[] = ['Today', 'Yesterday', 'Earlier'];

  return (
    <Layout>
      {/* Header */}
      <div className="shrink-0 bg-white shadow-sm z-floating">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="w-10" />
          <h1 className="text-xl font-semibold text-text-primary">Ride History</h1>
          <button
            onClick={() => { }}
            className="p-2 cursor-pointer"
          >
            <SlidersHorizontal size={20} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="shrink-0 px-4 py-2 flex items-center justify-between bg-offwhite">
        <span className="text-xs text-text-tertiary">{rides.length} rides</span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-xs text-info cursor-pointer disabled:opacity-50"
        >
          <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1 }}>
            <RefreshCw size={14} />
          </motion.div>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Empty State */}
      {rides.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6"
        >
          <EmptyRides className="w-[120px] h-[120px] mb-6" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No rides yet</h2>
          <p className="text-base text-text-secondary text-center mb-6">
            Your completed rides will appear here
          </p>
          <button
            onClick={() => navigate('/ride')}
            className="w-[200px] h-[52px] rounded-taxipro-md bg-navy text-white font-medium text-base cursor-pointer"
          >
            Book your first ride
          </button>
        </motion.div>
      )}

      {/* Ride List */}
      {rides.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {groupLabels.map((group) => {
            const groupRides = groupedRides[group];
            if (groupRides.length === 0) return null;

            return (
              <div key={group}>
                {/* Date Section Header */}
                <div className="bg-lightgray px-4 py-2">
                  <span className="text-sm font-medium text-text-secondary">{group}</span>
                </div>

                {/* Ride Cards */}
                {groupRides.map((ride, idx) => (
                  <RideCard key={ride.id} ride={ride} index={idx} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
