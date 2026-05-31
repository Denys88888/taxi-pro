import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Car,
  Clock,
  Route,
  CircleDot,
  Info,
  ChevronDown,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PriceDisplay } from '@/components/PriceDisplay';

// ─── Types ─────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month';

type PayoutStatus = 'pending' | 'confirmed' | 'released';

interface CompletedRide {
  id: string;
  completedAt: string;
  pickup: { address: string };
  destination: { address: string };
  distance: number;
  duration: number;
  fare: number;
  driverGets: number;
  status: 'completed';
}

interface PayoutRecord {
  id: string;
  amount: number;
  rides: number;
  status: PayoutStatus;
  createdAt: string;
}

interface EarningsData {
  total: number;
  fees: number;
  rides: number;
  kmDriven: number;
  onlineMinutes: number;
  ridesList: CompletedRide[];
  payouts: PayoutRecord[];
}

// ─── Mock Data ─────────────────────────────────────────────────

const MOCK_RIDES_TODAY: CompletedRide[] = [
  {
    id: 'ride_1',
    completedAt: '2024-01-15T14:30:00Z',
    pickup: { address: '123 Main St' },
    destination: { address: '456 Oak Ave' },
    distance: 5.2,
    duration: 15,
    fare: 8.41,
    driverGets: 8.24,
    status: 'completed',
  },
  {
    id: 'ride_2',
    completedAt: '2024-01-15T12:15:00Z',
    pickup: { address: '789 Pine Rd' },
    destination: { address: '321 Elm St' },
    distance: 3.8,
    duration: 11,
    fare: 5.12,
    driverGets: 5.02,
    status: 'completed',
  },
  {
    id: 'ride_3',
    completedAt: '2024-01-15T10:00:00Z',
    pickup: { address: '555 Cedar Ln' },
    destination: { address: '888 Birch Blvd' },
    distance: 7.1,
    duration: 20,
    fare: 12.50,
    driverGets: 12.25,
    status: 'completed',
  },
  {
    id: 'ride_4',
    completedAt: '2024-01-15T08:45:00Z',
    pickup: { address: '222 Maple Dr' },
    destination: { address: '777 Willow Way' },
    distance: 4.3,
    duration: 13,
    fare: 6.80,
    driverGets: 6.66,
    status: 'completed',
  },
  {
    id: 'ride_5',
    completedAt: '2024-01-15T07:20:00Z',
    pickup: { address: '444 Spruce Ct' },
    destination: { address: '666 Redwood Rd' },
    distance: 2.9,
    duration: 9,
    fare: 4.20,
    driverGets: 4.12,
    status: 'completed',
  },
  {
    id: 'ride_6',
    completedAt: '2024-01-15T06:00:00Z',
    pickup: { address: '333 Aspen Ave' },
    destination: { address: '999 Juniper Jct' },
    distance: 6.5,
    duration: 18,
    fare: 8.64,
    driverGets: 8.47,
    status: 'completed',
  },
];

const MOCK_DATA: Record<Period, EarningsData> = {
  today: {
    total: 45.67,
    fees: 0.91,
    rides: 6,
    kmDriven: 29.8,
    onlineMinutes: 245,
    ridesList: MOCK_RIDES_TODAY,
    payouts: [
      {
        id: 'payout_1',
        amount: 45.67,
        rides: 6,
        status: 'pending',
        createdAt: '2024-01-15T18:00:00Z',
      },
    ],
  },
  week: {
    total: 245.80,
    fees: 4.92,
    rides: 32,
    kmDriven: 186.4,
    onlineMinutes: 1680,
    ridesList: [
      ...MOCK_RIDES_TODAY,
      {
        id: 'ride_w1',
        completedAt: '2024-01-14T16:00:00Z',
        pickup: { address: '111 Beach St' },
        destination: { address: '222 Hill Rd' },
        distance: 8.2,
        duration: 22,
        fare: 14.20,
        driverGets: 13.92,
        status: 'completed',
      },
      {
        id: 'ride_w2',
        completedAt: '2024-01-14T13:30:00Z',
        pickup: { address: '333 Valley Ln' },
        destination: { address: '444 Ridge Ave' },
        distance: 5.5,
        duration: 14,
        fare: 8.90,
        driverGets: 8.72,
        status: 'completed',
      },
    ],
    payouts: [
      {
        id: 'payout_w1',
        amount: 198.40,
        rides: 26,
        status: 'confirmed',
        createdAt: '2024-01-14T18:00:00Z',
      },
      {
        id: 'payout_w2',
        amount: 47.40,
        rides: 6,
        status: 'pending',
        createdAt: '2024-01-15T18:00:00Z',
      },
    ],
  },
  month: {
    total: 892.50,
    fees: 17.85,
    rides: 118,
    kmDriven: 642.3,
    onlineMinutes: 6240,
    ridesList: [],
    payouts: [
      {
        id: 'payout_m1',
        amount: 420.80,
        rides: 56,
        status: 'released',
        createdAt: '2024-01-10T18:00:00Z',
      },
      {
        id: 'payout_m2',
        amount: 424.30,
        rides: 56,
        status: 'confirmed',
        createdAt: '2024-01-15T18:00:00Z',
      },
      {
        id: 'payout_m3',
        amount: 47.40,
        rides: 6,
        status: 'pending',
        createdAt: '2024-01-15T18:00:00Z',
      },
    ],
  },
};

// ─── Helper Functions ──────────────────────────────────────────

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getPayoutStatusColor(status: PayoutStatus) {
  switch (status) {
    case 'pending':
      return { bg: '#fff3e0', text: '#f39c12' };
    case 'confirmed':
      return { bg: '#e3f2fd', text: '#3498db' };
    case 'released':
      return { bg: '#e8f5e9', text: '#27ae60' };
  }
}

// ─── Animated counter hook ─────────────────────────────────────

function useAnimatedCounter(target: number, duration = 800, delay = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const startDelay = setTimeout(() => {
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
    }, delay);
    return () => {
      clearTimeout(startDelay);
      cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return value;
}

// ─── Sub-components ────────────────────────────────────────────

function PeriodSelector({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { value: Period; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lightgray text-sm font-medium text-text-primary"
      >
        <Calendar size={14} />
        {options.find((o) => o.value === period)?.label}
        <ChevronDown size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-10 bg-white rounded-piride-lg shadow-lg border border-midgray/50 overflow-hidden z-20"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    period === option.value
                      ? 'bg-navy text-white font-medium'
                      : 'text-text-primary hover:bg-offwhite'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsGrid({
  rides,
  km,
  onlineMin,
}: {
  rides: number;
  km: number;
  onlineMin: number;
}) {
  const animatedRides = Math.round(useAnimatedCounter(rides, 600, 600));
  const animatedKm = useAnimatedCounter(km, 600, 700);
  const animatedMin = Math.round(useAnimatedCounter(onlineMin, 600, 800));

  return (
    <div className="flex items-center justify-around mt-4">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Car size={18} className="text-white/70 mb-1" />
        <span className="text-xl font-semibold text-white">{animatedRides}</span>
        <span className="text-xs text-white/70">Rides</span>
      </motion.div>

      <div className="w-px h-10 bg-white/20" />

      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Route size={18} className="text-white/70 mb-1" />
        <span className="text-xl font-semibold text-white">
          {animatedKm.toFixed(1)}
        </span>
        <span className="text-xs text-white/70">Km</span>
      </motion.div>

      <div className="w-px h-10 bg-white/20" />

      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Clock size={18} className="text-white/70 mb-1" />
        <span className="text-xl font-semibold text-white">
          {formatDuration(animatedMin)}
        </span>
        <span className="text-xs text-white/70">Online</span>
      </motion.div>
    </div>
  );
}

function CompletedRideCard({
  ride,
  index,
}: {
  ride: CompletedRide;
  index: number;
}) {
  return (
    <motion.div
      className="mx-4 mb-3 bg-white rounded-piride-lg shadow-sm p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.06, duration: 0.25 }}
    >
      <div className="flex items-center">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 flex flex-col">
          <span className="text-sm font-medium text-text-primary">
            {formatTime(ride.completedAt)}
          </span>
          <span className="text-xs text-text-tertiary">{ride.duration} min</span>
        </div>

        {/* Route Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />
            <span className="text-xs text-text-primary truncate">
              {ride.pickup.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
            <span className="text-xs text-text-primary truncate">
              {ride.destination.address}
            </span>
          </div>
        </div>

        {/* Earnings Column */}
        <div className="w-20 flex-shrink-0 flex flex-col items-end">
          <span className="text-base font-semibold text-emerald">
            π {ride.driverGets.toFixed(2)}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#e8f5e9', color: '#27ae60' }}
          >
            Completed
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PayoutStatusSection({
  payouts,
}: {
  payouts: PayoutRecord[];
}) {
  return (
    <motion.div
      className="mx-4 mb-4 p-4 rounded-piride-lg"
      style={{ backgroundColor: '#f8f9ff', border: '1px solid rgba(44, 62, 80, 0.1)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
    >
      <h3 className="text-base font-semibold text-text-primary mb-3">
        Payout Status
      </h3>

      <div className="space-y-3">
        {payouts.map((payout) => {
          const colors = getPayoutStatusColor(payout.status);
          return (
            <div key={payout.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {payout.rides} rides batch
                </span>
                <span className="text-sm font-semibold text-navy">
                  π {payout.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {new Date(payout.createdAt).toLocaleDateString()}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {payout.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────

export default function Earnings() {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<EarningsData>(MOCK_DATA.today);

  // Update data when period changes
  useEffect(() => {
    setData(MOCK_DATA[period]);
  }, [period]);

  // Load additional earnings from completed ride
  useEffect(() => {
    const stored = localStorage.getItem('piride_last_ride_earnings');
    if (stored) {
      try {
        const { amount } = JSON.parse(stored);
        setData((prev) => ({
          ...prev,
          total: Number((prev.total + amount).toFixed(2)),
          rides: prev.rides + 1,
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  const animatedTotal = useAnimatedCounter(data.total, 800, 500);
  const labelText =
    period === 'today'
      ? "Today's Earnings"
      : period === 'week'
      ? 'This Week'
      : 'This Month';

  return (
    <Layout showNav={true}>
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-4 py-3 bg-white shadow-sm z-floating sticky top-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-xl font-semibold text-text-primary">Earnings</h1>
        <PeriodSelector period={period} onChange={setPeriod} />
      </motion.header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Total Earnings Card */}
        <motion.div
          className="mx-4 mt-4 p-6 rounded-piride-xl shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-xs text-white/70 mb-1">{labelText}</p>

          <div className="flex items-center gap-2">
            <DollarSign size={36} className="text-white/90" />
            <span className="text-4xl font-bold text-white tracking-tight">
              {animatedTotal.toFixed(2)}
            </span>
          </div>

          {/* Stats Grid */}
          <StatsGrid
            rides={data.rides}
            km={data.kmDriven}
            onlineMin={data.onlineMinutes}
          />

          {/* Divider */}
          <div className="h-px bg-white/20 my-4" />

          {/* Commission Note */}
          <div className="flex items-center gap-2">
            <Info size={14} className="text-white/50" />
            <span className="text-xs text-white/50">
              2% platform fee deducted
            </span>
            <span className="text-xs text-white/50">
              (π {data.fees.toFixed(2)} total fees)
            </span>
          </div>
        </motion.div>

        {/* Rides Section Header */}
        <motion.div
          className="px-4 mt-6 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-lg font-semibold text-text-primary">
            Completed Rides
          </h2>
          <p className="text-xs text-text-secondary">
            {data.ridesList.length} rides completed
          </p>
        </motion.div>

        {/* Completed Rides List */}
        <AnimatePresence mode="wait">
          {data.ridesList.length > 0 ? (
            <motion.div
              key={period + '-rides'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {data.ridesList.map((ride, index) => (
                <CompletedRideCard key={ride.id} ride={ride} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={period + '-empty'}
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TrendingUp size={48} className="text-text-tertiary mb-4 opacity-40" />
              <p className="text-base font-semibold text-text-secondary mb-1">
                No rides this period
              </p>
              <p className="text-sm text-text-tertiary">
                Complete rides to see them here
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payout Status Section */}
        {data.payouts.length > 0 && (
          <PayoutStatusSection payouts={data.payouts} />
        )}

        {/* Payout Info Card */}
        <motion.div
          className="mx-4 mt-4 p-4 rounded-piride-lg bg-emerald/5 border border-emerald/20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-start gap-3">
            <Info size={18} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">
                Payout Information
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                98% of the fare goes to you. Payouts are processed manually via Pi Browser.
                Your earnings are held securely until the payout is initiated.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
