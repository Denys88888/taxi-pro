import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  ArrowLeft,
  Power,
  Car,
  Star,
  Clock,
  MapPin,
  Navigation,
  X,
  Check,
  TrendingUp,
  Users,
  FileText,
  Shield,
  UserCheck,
  Activity,
  BarChart3,
  ClipboardList,
  CircleDollarSign,
  ChevronRight,
  Phone,
  User,
  Radio,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { wsClient } from '@/lib/api';
import { StarRating } from '@/components/StarRating';
import { LocateMeButton } from '@/components/LocateMeButton';

// ─── Types ─────────────────────────────────────────────────────

interface DriverEarnings {
  today: number; week: number; month: number; total: number;
  ridesToday: number; ridesWeek: number; ridesTotal: number;
  onlineMinutes: number;
}

interface DriverStats {
  rating: number; totalRides: number;
  completionRate: number; acceptanceRate: number; cancellationRate: number;
}

interface DriverDocument {
  type: 'license' | 'insurance' | 'registration' | 'background_check';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploadedAt?: string; verifiedAt?: string; expiryDate?: string;
}

interface RideRequest {
  rideId: string;
  pickup: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  price: number;
  distance: number;
  passenger: { name: string; rating: number };
}

interface ActiveRide {
  rideId: string;
  pickup: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  price: number;
  distance: number;
  passenger: { name: string; rating: number; phone: string };
  startTime: string;
}

type TabName = 'overview' | 'requests' | 'earnings' | 'documents';

// ─── Mock Data Helpers ─────────────────────────────────────────

const DEFAULT_EARNINGS: DriverEarnings = {
  today: 24.50, week: 156.30, month: 642.80, total: 3245.60,
  ridesToday: 8, ridesWeek: 42, ridesTotal: 284,
  onlineMinutes: 245,
};

const DEFAULT_STATS: DriverStats = {
  rating: 4.85, totalRides: 284,
  completionRate: 96, acceptanceRate: 88, cancellationRate: 4,
};

const DEFAULT_DOCUMENTS: DriverDocument[] = [
  { type: 'license', status: 'verified', uploadedAt: '2024-01-15T10:00:00Z', verifiedAt: '2024-01-16T14:00:00Z', expiryDate: '2027-01-15' },
  { type: 'insurance', status: 'verified', uploadedAt: '2024-02-01T09:00:00Z', verifiedAt: '2024-02-02T11:00:00Z', expiryDate: '2025-02-01' },
  { type: 'registration', status: 'pending', uploadedAt: '2024-03-10T16:00:00Z' },
  { type: 'background_check', status: 'verified', uploadedAt: '2024-01-20T08:00:00Z', verifiedAt: '2024-01-22T10:00:00Z' },
];

const LAST_7_DAYS = [18.50, 24.30, 32.10, 15.80, 28.50, 35.20, 24.50];

// ─── Utility Components ────────────────────────────────────────

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>{`${prefix}${value.toFixed(decimals)}${suffix}`}</span>;
}

function ProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
}

// ─── Document Icon Helper ──────────────────────────────────────

function DocumentIcon({ type }: { type: DriverDocument['type'] }) {
  switch (type) {
    case 'license': return <FileText size={18} />;
    case 'insurance': return <Shield size={18} />;
    case 'registration': return <Car size={18} />;
    case 'background_check': return <UserCheck size={18} />;
    default: return <FileText size={18} />;
  }
}

function documentLabel(type: DriverDocument['type'], t: (key: string) => string): string {
  switch (type) {
    case 'license': return t('driverLicense');
    case 'insurance': return t('insurance');
    case 'registration': return t('vehicleRegistration');
    case 'background_check': return t('backgroundCheck');
    default: return t('document');
  }
}

function statusColor(status: DriverDocument['status']): string {
  switch (status) {
    case 'verified': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    case 'rejected': return 'bg-red-500/15 text-red-400 border-red-500/20';
    case 'expired': return 'bg-gray-500/15 text-gray-400 border-gray-500/20';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/20';
  }
}

function statusLabel(status: DriverDocument['status'], t: (key: string) => string): string {
  switch (status) {
    case 'verified': return t('verified');
    case 'pending': return t('pending');
    case 'rejected': return t('rejected');
    case 'expired': return t('expired');
    default: return t('unknown');
  }
}

// ─── Main Component ────────────────────────────────────────────

export default function DriverModePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { driverOnline, setDriverOnline } = useApp();

  // Local state for driver data (would come from context in full implementation)
  const [earnings, setEarnings] = useState<DriverEarnings>(DEFAULT_EARNINGS);
  const [stats] = useState<DriverStats>(DEFAULT_STATS);
  const [documents] = useState<DriverDocument[]>(DEFAULT_DOCUMENTS);
  const [activeTab, setActiveTab] = useState<TabName>('overview');

  // Ride request state
  const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  // Track request timestamps for animation delays

  // Driver location state
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; address: string; name: string } | null>(null);

  // WebSocket is disabled for demo — rides are simulated locally
  useEffect(() => {
    const handleRideAvailable = (data: any) => {
      const newRequest: RideRequest = {
        rideId: data.rideId || `ride_${Date.now()}`,
        pickup: data.pickup || { name: 'Unknown Pickup', lat: 0, lng: 0 },
        destination: data.destination || { name: 'Unknown Destination', lat: 0, lng: 0 },
        price: data.price || 0,
        distance: data.distance || 0,
        passenger: data.passenger || { name: 'Неизвестный', rating: 5 },
      };
      setIncomingRequests((prev) => {
        if (prev.some((r) => r.rideId === newRequest.rideId)) return prev;
        return [newRequest, ...prev];
      });
      // Animation delay for new request
    };

    const handleRideAssigned = (data: any) => {
      // Confirmation that ride was assigned
      console.log('[Driver] Ride assigned:', data);
    };

    wsClient.on('ride_available', handleRideAvailable);
    wsClient.on('ride_assigned', handleRideAssigned);

    return () => {
      wsClient.off('ride_available', handleRideAvailable);
      wsClient.off('ride_assigned', handleRideAssigned);
    };
  }, []);

  // Online minutes timer
  useEffect(() => {
    if (!driverOnline) return;
    const interval = setInterval(() => {
      setEarnings((prev) => ({ ...prev, onlineMinutes: prev.onlineMinutes + 1 }));
    }, 60000);
    return () => clearInterval(interval);
  }, [driverOnline]);

  const toggleOnline = useCallback(() => {
    setDriverOnline(!driverOnline);
  }, [driverOnline, setDriverOnline]);

  const acceptRequest = useCallback((req: RideRequest) => {
    const ride: ActiveRide = {
      ...req,
      passenger: { ...req.passenger, phone: '+1-555-0199' },
      startTime: new Date().toISOString(),
    };
    setActiveRide(ride);
    setIncomingRequests((prev) => prev.filter((r) => r.rideId !== req.rideId));
    wsClient.send('ride_accepted', { rideId: req.rideId });
  }, []);

  const declineRequest = useCallback((rideId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.rideId !== rideId));
    wsClient.send('ride_declined', { rideId });
  }, []);

  const completeRide = useCallback(() => {
    if (!activeRide) return;
    const earningAmount = activeRide.price;
    setEarnings((prev) => ({
      ...prev,
      today: prev.today + earningAmount,
      week: prev.week + earningAmount,
      month: prev.month + earningAmount,
      total: prev.total + earningAmount,
      ridesToday: prev.ridesToday + 1,
      ridesWeek: prev.ridesWeek + 1,
      ridesTotal: prev.ridesTotal + 1,
    }));
    setActiveRide(null);
  }, [activeRide]);

  const formatOnlineTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // ─── Section Renderers ───────────────────────────────────────

  const renderHeader = () => (
    <div className="relative z-10 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={18} color="#FFFFFF"/></div>
          </motion.button>

          {/* Locate me button for driver */}
          <div className="w-10 h-10">
            <LocateMeButton
              onLocate={(loc) => setDriverLocation(loc)}
              className="w-10 h-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs font-medium">
            {driverOnline ? t('online') : t('offline')}
          </span>
          <motion.button
            onClick={toggleOnline}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              driverOnline ? 'bg-emerald-500' : 'bg-white/15'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`absolute top-1 w-6 h-6 rounded-full shadow-md ${
                driverOnline ? 'bg-white' : 'bg-text-secondary'
              }`}
              animate={{ left: driverOnline ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Driver location display */}
      <AnimatePresence>
        {driverLocation && (
          <motion.div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <MapPin size={14} color="#00C853" />
            <span className="text-primary text-xs font-medium truncate flex-1">
              {driverLocation.address.length > 40 ? driverLocation.address.slice(0, 40) + '...' : driverLocation.address}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Stats */}
      <AnimatePresence>
        {driverOnline && (
          <motion.div
            className="mt-4 flex items-center justify-center gap-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-1.5">
              <StarRating rating={stats.rating} size={12} showValue />
            </div>
            <div className="flex items-center gap-1.5">
              <CircleDollarSign size={12} color="#00C853" />
              <span className="text-emerald-400 text-xs font-semibold font-mono">
                <AnimatedCounter value={earnings.today} prefix="$" decimals={2} />
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car size={12} color="#448AFF" />
              <span className="text-text-primary text-xs font-semibold">{earnings.ridesToday}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderOnlineButton = () => (
    <motion.button
      onClick={toggleOnline}
      className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 shadow-lg transition-all duration-300 ${
        driverOnline
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25'
          : 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-primary/25'
      }`}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Radio size={20} className={driverOnline ? 'animate-pulse' : ''} />
      {driverOnline ? t('online') : t('goOnline')}
    </motion.button>
  );

  const renderEarningsCard = () => (
    <motion.div
      className="bg-gradient-to-br from-bg-elevated to-bg-elevated/80 backdrop-blur-xl rounded-2xl p-5 border border-white/5 shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <TrendingUp size={16} color="#00C853" />
          </div>
          <span className="text-text-secondary text-sm font-medium">{t('earnings')}</span>
        </div>
        <div className="flex items-center gap-1 text-text-tertiary text-[10px]">
          <Clock size={10} />
          {formatOnlineTime(earnings.onlineMinutes)}
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-emerald-400 text-3xl font-bold font-mono tracking-tight">
          $<AnimatedCounter value={earnings.today} decimals={2} />
        </p>
        <p className="text-text-tertiary text-xs mt-1">{t('earnings')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('earnings'), value: earnings.week, prefix: '$' },
          { label: t('rides'), value: earnings.ridesToday, suffix: '' },
          { label: t('online'), value: earnings.onlineMinutes, suffix: 'm' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="text-center bg-white/3 rounded-xl py-2.5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <p className="text-text-primary text-sm font-bold font-mono">
              {item.prefix}{item.value.toFixed(item.prefix === '$' ? 2 : 0)}{item.suffix}
            </p>
            <p className="text-text-tertiary text-[10px]">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderBarChart = () => {
    const maxVal = Math.max(...LAST_7_DAYS, earnings.today);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const data = [...LAST_7_DAYS.slice(0, 6), earnings.today];

    return (
      <motion.div
        className="bg-bg-elevated/80 backdrop-blur-xl rounded-2xl p-5 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 size={16} color="#00C853" />
          </div>
          <span className="text-text-secondary text-sm font-medium">{t('earnings')}</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-28">
          {data.map((val, i) => {
            const heightPct = (val / maxVal) * 100;
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex justify-center items-end h-20">
                  <motion.div
                    className={`w-full max-w-[28px] rounded-t-md ${
                      isToday ? 'bg-gradient-to-t from-primary to-emerald-400' : 'bg-white/10'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                  />
                </div>
                <span className={`text-[9px] ${isToday ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
                  {days[i]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const renderStatsGrid = () => {
    const statItems = [
      { icon: <Star size={18} />, label: 'rating', value: stats.rating, max: 5, suffix: '', color: 'bg-amber-500', colorClass: 'bg-amber-400' },
      { icon: <Check size={18} />, label: 'completionRate', value: stats.completionRate, max: 100, suffix: '%', color: 'bg-emerald-500', colorClass: 'bg-emerald-400' },
      { icon: <Activity size={18} />, label: 'acceptanceRate', value: stats.acceptanceRate, max: 100, suffix: '%', color: 'bg-blue-500', colorClass: 'bg-blue-400' },
      { icon: <Car size={18} />, label: 'totalRides', value: stats.totalRides, max: 500, suffix: '', color: 'bg-purple-500', colorClass: 'bg-purple-400' },
    ];

    return (
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            className="bg-bg-elevated/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${item.color}/15 flex items-center justify-center text-${item.color.split('-')[1]}-400`}>
                {item.icon}
              </div>
              <span className="text-text-tertiary text-[10px] font-medium capitalize">{item.label}</span>
            </div>
            {item.label === 'rating' ? (
              <div className="mb-2">
                <StarRating rating={item.value} size={20} showValue />
              </div>
            ) : (
              <p className="text-text-primary text-lg font-bold font-mono mb-2">
                {item.value}{item.suffix}
              </p>
            )}
            <ProgressBar
              value={(item.value / item.max) * 100}
              colorClass={item.colorClass}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-3">
      {documents.map((doc, i) => (
        <motion.div
          key={doc.type}
          className="bg-bg-elevated/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary">
            <DocumentIcon type={doc.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium capitalize">
              {documentLabel(doc.type, t)}
            </p>
            {doc.expiryDate && (
              <p className="text-text-tertiary text-[10px]">
                {t('expiry')}: {doc.expiryDate}
              </p>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border capitalize ${statusColor(doc.status)}`}>
            {statusLabel(doc.status, t)}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const renderRideRequests = () => {
    if (activeRide) {
      return (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-gradient-to-br from-primary/10 to-emerald-500/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={20} color="#00C853" />
              </div>
              <div>
                <p className="text-text-primary font-semibold">{activeRide.passenger.name}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} fill="#F5A623" color="#F5A623" />
                  <span className="text-text-tertiary text-xs">{activeRide.passenger.rating}</span>
                </div>
              </div>
              <motion.a
                href={`tel:${activeRide.passenger.phone}`}
                className="ml-auto w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <Phone size={16} color="#00C853" />
              </motion.a>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <Navigation size={14} color="#00C853" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-tertiary text-[10px]">{t('pickup')}</p>
                  <p className="text-text-primary text-sm font-medium truncate">{activeRide.pickup.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} color="#FF5252" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-tertiary text-[10px]">{t('destination')}</p>
                  <p className="text-text-primary text-sm font-medium truncate">{activeRide.destination.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-text-secondary text-sm">{t('price')}</span>
              <span className="text-primary text-lg font-bold font-mono">${activeRide.price.toFixed(2)}</span>
            </div>
          </div>

          <motion.button
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl font-semibold text-white text-base shadow-lg shadow-emerald-500/25"
            whileTap={{ scale: 0.97 }}
            onClick={completeRide}
          >
            {t('completeRide')}
          </motion.button>
        </motion.div>
      );
    }

    if (incomingRequests.length === 0) {
      return (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Radio size={28} color="#444444" />
          </div>
          <p className="text-text-secondary text-sm">{t('noRequestsNearby')}</p>
          <p className="text-text-tertiary text-xs mt-1">{t('stayOnline')}</p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-3">
        <AnimatePresence>
          {incomingRequests.map((req) => (
            <motion.div
              key={req.rideId}
              className="bg-bg-elevated/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              layout
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Users size={16} color="#00C853" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{req.passenger.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="#F5A623" color="#F5A623" />
                      <span className="text-text-tertiary text-[10px]">{req.passenger.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold font-mono text-base">${req.price.toFixed(2)}</p>
                  <p className="text-text-tertiary text-[10px] flex items-center gap-0.5 justify-end">
                    <Navigation size={8} /> {req.distance} {t('km')}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 bg-white/2 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-text-secondary text-xs truncate">{req.pickup.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-text-secondary text-xs truncate">{req.destination.name}</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <motion.button
                  className="flex-1 h-11 bg-white/5 rounded-xl flex items-center justify-center gap-1.5 border border-white/10"
                  onClick={() => declineRequest(req.rideId)}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} color="#FF5252" />
                  <span className="text-red-400 text-sm font-medium">{t('decline')}</span>
                </motion.button>
                <motion.button
                  className="flex-1 h-11 bg-gradient-to-r from-primary to-emerald-500 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
                  onClick={() => acceptRequest(req)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check size={14} color="#FFFFFF" />
                  <span className="text-white text-sm font-semibold">{t('accept')}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const renderEarningsSection = () => (
    <div className="space-y-4">
      {/* Total Earnings Big Card */}
      <motion.div
        className="bg-gradient-to-br from-emerald-500/10 via-bg-elevated to-bg-elevated rounded-2xl p-6 border border-emerald-500/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-text-tertiary text-xs mb-1">{t('earnings')}</p>
        <p className="text-emerald-400 text-4xl font-bold font-mono tracking-tight">
          $<AnimatedCounter value={earnings.today} decimals={2} />
        </p>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={12} color="#00C853" />
          <span className="text-emerald-400 text-xs">+12.5%</span>
          <span className="text-text-tertiary text-xs"> vs {t('yesterday')}</span>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('week'), value: earnings.week },
          { label: t('month'), value: earnings.month },
          { label: t('total'), value: earnings.total },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="bg-bg-elevated/80 rounded-2xl p-4 border border-white/5 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <p className="text-text-primary text-base font-bold font-mono">${item.value.toFixed(2)}</p>
            <p className="text-text-tertiary text-[10px] mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {renderBarChart()}

      {/* Rides Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('ridesToday'), value: earnings.ridesToday },
          { label: t('ridesWeek'), value: earnings.ridesWeek },
          { label: t('ridesTotal'), value: earnings.ridesTotal },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="bg-bg-elevated/80 rounded-2xl p-4 border border-white/5 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            <p className="text-text-primary text-lg font-bold font-mono">{item.value}</p>
            <p className="text-text-tertiary text-[10px] mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Tab Content ─────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            {!driverOnline ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Power size={28} color="#444444" />
                </div>
                <p className="text-text-secondary text-sm">{t('goOnline')}</p>
                <p className="text-text-tertiary text-xs mt-1">{t('stayOnline')}</p>
                <div className="mt-6 px-8">
                  {renderOnlineButton()}
                </div>
              </motion.div>
            ) : (
              <>
                {renderEarningsCard()}
                {renderBarChart()}
                {renderStatsGrid()}
                {/* Quick Actions */}
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="bg-bg-elevated/80 rounded-2xl p-4 border border-white/5 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <ClipboardList size={18} color="#00C853" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium">{t('nearbyRequests')}</p>
                      <p className="text-text-tertiary text-[10px]">{incomingRequests.length} {t('pending')}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary ml-auto shrink-0" />
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="bg-bg-elevated/80 rounded-2xl p-4 border border-white/5 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                      <FileText size={18} color="#F5A623" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium">{t('documents')}</p>
                      <p className="text-text-tertiary text-[10px]">
                        {documents.filter((d) => d.status === 'verified').length}/{documents.length} {t('verified')}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary ml-auto shrink-0" />
                  </button>
                </motion.div>
              </>
            )}
          </div>
        );

      case 'requests':
        return (
          <div>
            {activeRide && (
              <motion.div
                className="mb-4 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">{t('driverAssigned')}</span>
              </motion.div>
            )}
            {renderRideRequests()}
          </div>
        );

      case 'earnings':
        return renderEarningsSection();

      case 'documents':
        return (
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-text-primary text-base font-semibold">{t('documents')}</h3>
              <span className="text-text-tertiary text-xs">
                {documents.filter((d) => d.status === 'verified').length}/{documents.length} {t('verified')}
              </span>
            </motion.div>
            {renderDocuments()}
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Tab Bar ───────────────────────────────────────────────────

  const tabs: { key: TabName; icon: React.ReactNode; label: string }[] = [
    { key: 'overview', icon: <BarChart3 size={18} />, label: t('overview') },
    { key: 'requests', icon: <ClipboardList size={18} />, label: t('requests') },
    { key: 'earnings', icon: <CircleDollarSign size={18} />, label: t('earnings') },
    { key: 'documents', icon: <FileText size={18} />, label: t('documents') },
  ];

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      {renderHeader()}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Tab Bar */}
      <div className="shrink-0 bg-bg-elevated/95 backdrop-blur-xl border-t border-white/5 z-10">
        <div className="flex items-center justify-around py-2 max-w-[430px] mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const hasBadge = tab.key === 'requests' && incomingRequests.length > 0 && !activeRide;
            return (
              <motion.button
                key={tab.key}
                className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.9 }}
              >
                <div className={`relative ${isActive ? 'text-primary' : 'text-text-tertiary'}`}>
                  {tab.icon}
                  {hasBadge && (
                    <motion.span
                      className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      {incomingRequests.length}
                    </motion.span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-text-tertiary'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 w-5 h-0.5 bg-primary rounded-full"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
