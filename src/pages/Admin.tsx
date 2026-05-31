import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Shield,
  ChevronDown,
  Copy,
  CheckCircle,
  Clock,
  CircleDollarSign,
  Car,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';

type PayoutStatus = 'pending' | 'confirmed' | 'released';

interface DriverRide {
  rideId: string;
  date: string;
  pickup: string;
  destination: string;
  distance: number;
  passengerPrice: number;
  driverEarnings: number;
  status: PayoutStatus;
}

interface DriverPayout {
  driverId: string;
  driverUsername: string;
  driverWallet: string;
  rides: DriverRide[];
  totalEarnings: number;
  platformFee: number;
  payoutStatus: PayoutStatus;
}

// Mock drivers with rides
const generateMockPayouts = (): DriverPayout[] => [
  {
    driverId: 'driver_1',
    driverUsername: 'alex_driver',
    driverWallet: 'GABC1234567890XYZABCDEF1234567890',
    rides: [
      {
        rideId: 'ride_1',
        date: '2024-01-15T14:30:00Z',
        pickup: '123 Main St',
        destination: '456 Oak Ave',
        distance: 5.2,
        passengerPrice: 8.41,
        driverEarnings: 8.24,
        status: 'pending',
      },
      {
        rideId: 'ride_2',
        date: '2024-01-14T09:15:00Z',
        pickup: '789 Pine Rd',
        destination: '321 Elm St',
        distance: 3.1,
        passengerPrice: 5.02,
        driverEarnings: 4.92,
        status: 'pending',
      },
      {
        rideId: 'ride_3',
        date: '2024-01-13T18:45:00Z',
        pickup: '555 Cedar Ln',
        destination: '888 Birch Dr',
        distance: 7.8,
        passengerPrice: 12.59,
        driverEarnings: 12.34,
        status: 'confirmed',
      },
    ],
    totalEarnings: 25.50,
    platformFee: 0.52,
    payoutStatus: 'pending',
  },
  {
    driverId: 'driver_2',
    driverUsername: 'sam_rides',
    driverWallet: 'GDEF9876543210UVWXYZABCDEF0987654321',
    rides: [
      {
        rideId: 'ride_4',
        date: '2024-01-15T11:00:00Z',
        pickup: '444 Maple Ave',
        destination: '666 Spruce St',
        distance: 4.3,
        passengerPrice: 6.94,
        driverEarnings: 6.80,
        status: 'released',
      },
      {
        rideId: 'ride_5',
        date: '2024-01-12T16:20:00Z',
        pickup: '111 Willow Way',
        destination: '222 Aspen Ct',
        distance: 6.5,
        passengerPrice: 10.49,
        driverEarnings: 10.28,
        status: 'released',
      },
    ],
    totalEarnings: 17.08,
    platformFee: 0.35,
    payoutStatus: 'released',
  },
  {
    driverId: 'driver_3',
    driverUsername: 'jordan_drives',
    driverWallet: 'GHIJ1122334455KLMNOPQRSTUV5566778899',
    rides: [
      {
        rideId: 'ride_6',
        date: '2024-01-15T08:30:00Z',
        pickup: '333 Redwood Rd',
        destination: '999 Sequoia Blvd',
        distance: 8.2,
        passengerPrice: 13.23,
        driverEarnings: 12.97,
        status: 'confirmed',
      },
      {
        rideId: 'ride_7',
        date: '2024-01-14T20:00:00Z',
        pickup: '777 Palm Dr',
        destination: '444 Cypress Ln',
        distance: 2.9,
        passengerPrice: 4.68,
        driverEarnings: 4.59,
        status: 'pending',
      },
    ],
    totalEarnings: 17.56,
    platformFee: 0.36,
    payoutStatus: 'confirmed',
  },
  {
    driverId: 'driver_4',
    driverUsername: 'taylor_wheel',
    driverWallet: 'GKLM6677889900NOPQRSTUVWX1122334455',
    rides: [
      {
        rideId: 'ride_8',
        date: '2024-01-13T12:00:00Z',
        pickup: '222 Hickory St',
        destination: '555 Magnolia Ave',
        distance: 5.7,
        passengerPrice: 9.20,
        driverEarnings: 9.02,
        status: 'released',
      },
      {
        rideId: 'ride_9',
        date: '2024-01-11T15:30:00Z',
        pickup: '888 Juniper Rd',
        destination: '111 Poplar Ct',
        distance: 3.4,
        passengerPrice: 5.49,
        driverEarnings: 5.38,
        status: 'pending',
      },
      {
        rideId: 'ride_10',
        date: '2024-01-10T10:45:00Z',
        pickup: '666 Dogwood Dr',
        destination: '333 Sycamore Ln',
        distance: 9.1,
        passengerPrice: 14.68,
        driverEarnings: 14.39,
        status: 'confirmed',
      },
    ],
    totalEarnings: 28.79,
    platformFee: 0.59,
    payoutStatus: 'pending',
  },
];

function truncateWallet(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

type FilterTab = 'all' | 'pending' | 'confirmed' | 'released';

function StatusDot({ status }: { status: PayoutStatus }) {
  const color = status === 'pending' ? 'bg-warning' : status === 'confirmed' ? 'bg-info' : 'bg-emerald';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
        <Clock size={10} />
        Pending
      </span>
    );
  }
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
        <CheckCircle size={10} />
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald/10 text-emerald">
      <CheckCircle size={10} />
      Released
    </span>
  );
}

function QRCodeSVG({ value, size = 200 }: { value: string; size?: number }) {
  // Generate a deterministic pattern from the wallet address
  const cellSize = Math.floor(size / 25);
  const cells: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }

  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      // Corner patterns (position detection)
      const isCorner =
        (row < 7 && col < 7) ||
        (row < 7 && col >= 18) ||
        (row >= 18 && col < 7);
      if (isCorner) {
        const cr = row % 7;
        const cc = col % 7;
        cells.push(
          cr === 0 || cr === 6 || cc === 0 || cc === 6 ||
          (cr >= 2 && cr <= 4 && cc >= 2 && cc <= 4)
        );
      } else {
        hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
        cells.push(((hash >>> 0) & 1) === 1);
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${25 * cellSize} ${25 * cellSize}`}>
      {cells.map((filled, i) => {
        const row = Math.floor(i / 25);
        const col = i % 25;
        if (!filled) return null;
        return (
          <rect
            key={i}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#2c3e50"
          />
        );
      })}
    </svg>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<DriverPayout[]>(generateMockPayouts);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [modalDriver, setModalDriver] = useState<DriverPayout | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const filteredPayouts = useMemo(() => {
    if (activeTab === 'all') return payouts;
    return payouts.filter((p) => p.payoutStatus === activeTab);
  }, [payouts, activeTab]);

  const stats = useMemo(() => {
    const totalRides = payouts.reduce((sum, p) => sum + p.rides.length, 0);
    const pendingTotal = payouts
      .filter((p) => p.payoutStatus === 'pending')
      .reduce((sum, p) => sum + p.totalEarnings, 0);
    const confirmedTotal = payouts
      .filter((p) => p.payoutStatus === 'confirmed')
      .reduce((sum, p) => sum + p.totalEarnings, 0);
    const releasedTotal = payouts
      .filter((p) => p.payoutStatus === 'released')
      .reduce((sum, p) => sum + p.totalEarnings, 0);
    return { totalRides, pendingTotal, confirmedTotal, releasedTotal };
  }, [payouts]);

  const tabCounts = useMemo(() => {
    return {
      all: payouts.reduce((s, p) => s + p.rides.length, 0),
      pending: payouts.filter((p) => p.payoutStatus === 'pending').reduce((s, p) => s + p.rides.length, 0),
      confirmed: payouts.filter((p) => p.payoutStatus === 'confirmed').reduce((s, p) => s + p.rides.length, 0),
      released: payouts.filter((p) => p.payoutStatus === 'released').reduce((s, p) => s + p.rides.length, 0),
    };
  }, [payouts]);

  const handleConfirmPayout = useCallback((driverId: string) => {
    setPayouts((prev) =>
      prev.map((p) => {
        if (p.driverId === driverId) {
          return {
            ...p,
            payoutStatus: 'confirmed' as PayoutStatus,
            rides: p.rides.map((r) =>
              r.status === 'pending' ? { ...r, status: 'confirmed' as PayoutStatus } : r
            ),
          };
        }
        return p;
      })
    );
  }, []);

  const handleMarkReleased = useCallback((driverId: string) => {
    setPayouts((prev) =>
      prev.map((p) => {
        if (p.driverId === driverId) {
          return {
            ...p,
            payoutStatus: 'released' as PayoutStatus,
            rides: p.rides.map((r) => ({ ...r, status: 'released' as PayoutStatus })),
          };
        }
        return p;
      })
    );
    setModalDriver(null);
  }, []);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  }, []);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'released', label: 'Released' },
  ];

  return (
    <div className="mobile-container bg-offwhite">
      <div className="relative w-full min-h-[100dvh] flex flex-col">
        {/* Navy Header */}
        <div className="shrink-0 bg-navy text-white z-floating">
          <div className="flex items-center justify-between h-14 px-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')} className="p-1 cursor-pointer">
              <ChevronLeft size={24} className="text-white" />
            </motion.button>
            <h1 className="text-xl font-semibold">Payout Management</h1>
            <Shield size={20} className="text-white/70" />
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
            {[
              { label: 'Total Rides', value: stats.totalRides, accent: 'text-white' },
              { label: 'Pending', value: `\u03c0 ${stats.pendingTotal.toFixed(2)}`, accent: 'text-warning' },
              { label: 'Confirmed', value: `\u03c0 ${stats.confirmedTotal.toFixed(2)}`, accent: 'text-emerald-light' },
              { label: 'Released', value: `\u03c0 ${stats.releasedTotal.toFixed(2)}`, accent: 'text-white' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.2 }}
                className="bg-white/10 rounded-piride-md p-3 min-w-[110px] shrink-0"
              >
                <p className={`text-xl font-bold ${stat.accent}`}>{stat.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.25 }}
          className="shrink-0 bg-white border-b border-midgray z-floating"
        >
          <div className="flex px-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                  activeTab === tab.key ? 'text-navy' : 'text-text-secondary'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-navy/10' : 'bg-lightgray'
                }`}>
                  {tabCounts[tab.key]}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-navy rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info Banner */}
        <div className="shrink-0 mx-4 mt-3 bg-info/10 rounded-piride-md px-4 py-3">
          <p className="text-xs text-info leading-relaxed">
            Payouts are sent manually via Pi Browser. 98% to driver, 2% platform fee.
          </p>
        </div>

        {/* Payout List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 mt-3 space-y-3">
          <AnimatePresence mode="wait">
            {filteredPayouts.map((payout, idx) => (
              <motion.div
                key={payout.driverId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: Math.min(idx * 0.06, 0.3), duration: 0.25 }}
                className="bg-white rounded-piride-lg shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpandedDriver(expandedDriver === payout.driverId ? null : payout.driverId)}
                  className="w-full text-left p-4 flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-lightgray rounded-full flex items-center justify-center shrink-0">
                    <Car size={20} className="text-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-text-primary truncate">
                      {payout.driverUsername}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Wallet: {truncateWallet(payout.driverWallet)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-text-primary">
                      <span className="text-emerald">&#960;</span> {payout.totalEarnings.toFixed(2)}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedDriver === payout.driverId ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} className="text-text-secondary" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedDriver === payout.driverId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-midgray px-4 py-2">
                        {payout.rides.map((ride) => (
                          <div key={ride.rideId} className="flex items-center gap-3 py-3 border-b border-midgray/50 last:border-0">
                            <StatusDot status={ride.status} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text-primary truncate">
                                {ride.pickup} &rarr; {ride.destination}
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {formatDate(ride.date)} &middot; {ride.distance} km
                              </p>
                            </div>
                            <span className="text-sm font-medium text-text-primary shrink-0">
                              &#960; {ride.driverEarnings.toFixed(2)}
                            </span>
                            <StatusBadge status={ride.status} />
                          </div>
                        ))}
                      </div>

                      {/* Payout Action Row */}
                      <div className="border-t border-midgray px-4 py-3 flex items-center justify-between">
                        <span className="text-base font-medium text-text-primary">
                          <span className="text-emerald">&#960;</span> {payout.totalEarnings.toFixed(2)} to driver
                        </span>
                        {payout.payoutStatus === 'pending' && (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setModalDriver(payout)}
                            className="px-4 py-2 rounded-piride-md bg-navy text-white text-sm font-medium cursor-pointer"
                          >
                            Confirm Payout
                          </motion.button>
                        )}
                        {payout.payoutStatus === 'confirmed' && (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleMarkReleased(payout.driverId)}
                            className="px-4 py-2 rounded-piride-md bg-emerald text-white text-sm font-medium cursor-pointer"
                          >
                            Mark Released
                          </motion.button>
                        )}
                        {payout.payoutStatus === 'released' && (
                          <span className="text-sm font-medium text-emerald flex items-center gap-1">
                            <CheckCircle size={16} />
                            Released
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {modalDriver && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-modal-overlay"
              onClick={() => setModalDriver(null)}
              style={{ maxWidth: 430, margin: '0 auto' }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-piride-xl z-modal-content p-6 max-h-[70dvh] overflow-y-auto"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-midgray rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Payout to {modalDriver.driverUsername}
                </h2>
                <button onClick={() => setModalDriver(null)} className="p-1 cursor-pointer">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>

              {/* Wallet Address Card */}
              <div className="bg-lightgray rounded-piride-md p-4 mb-4">
                <p className="text-xs text-text-secondary mb-1">Driver Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-primary break-all flex-1 font-mono">
                    {truncateWallet(modalDriver.driverWallet)}
                  </p>
                  <button
                    onClick={() => handleCopyAddress(modalDriver.driverWallet)}
                    className="p-2 cursor-pointer shrink-0"
                  >
                    {copiedAddress ? (
                      <CheckCircle size={18} className="text-emerald" />
                    ) : (
                      <Copy size={18} className="text-text-secondary" />
                    )}
                  </button>
                </div>
                {copiedAddress && (
                  <p className="text-xs text-emerald mt-1">Copied!</p>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-4">
                <div className="bg-white p-4 rounded-piride-lg border border-midgray">
                  <QRCodeSVG value={modalDriver.driverWallet} size={200} />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Scan with Pi Wallet to transfer
                </p>
              </div>

              {/* Amount Display */}
              <div className="bg-navy/5 rounded-piride-md p-4 mb-4 text-center">
                <p className="text-xs text-text-secondary mb-1">Amount to Transfer</p>
                <p className="text-3xl font-bold text-navy">
                  <span className="text-emerald">&#960;</span> {modalDriver.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  (Total earnings minus 2% platform fee)
                </p>
              </div>

              {/* Ride Breakdown */}
              <div className="border-t border-midgray pt-4 mb-4">
                <p className="text-xs text-text-secondary mb-2">Ride Breakdown</p>
                {modalDriver.rides.map((ride) => (
                  <div key={ride.rideId} className="flex justify-between text-sm py-1">
                    <span className="text-text-secondary">
                      {ride.pickup} &rarr; {ride.destination}
                    </span>
                    <span className="text-text-primary font-medium">
                      &#960; {ride.driverEarnings.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-midgray mt-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-primary font-medium">Total</span>
                    <span className="text-text-primary font-semibold">
                      &#960; {modalDriver.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-text-tertiary">Platform Fee (2%)</span>
                    <span className="text-text-tertiary">
                      &#960; {modalDriver.platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalDriver(null)}
                  className="flex-1 h-12 rounded-piride-md border-2 border-navy text-navy font-medium text-base cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handleConfirmPayout(modalDriver.driverId);
                    handleMarkReleased(modalDriver.driverId);
                  }}
                  className="flex-1 h-12 rounded-piride-md bg-emerald text-white font-medium text-base cursor-pointer"
                >
                  Mark as Released
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
