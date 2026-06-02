import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllRides,
  getPendingPayouts,
  getRidesByStatus,
  updateRideStatus,
  type RideDoc,
} from '@/lib/firestore-service';
import {
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  LogOut,
  MapPin,
  RefreshCw,
  User,
  XCircle,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'driver_found' | 'in_progress' | 'completed' | 'cancelled';

export default function AdminPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<RideDoc[]>([]);
  const [payouts, setPayouts] = useState<RideDoc[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    // Simple admin check - in production, check user role from Firestore
    const adminUids = ['demo_admin'];
    if (!user?.uid?.startsWith('demo_') && !adminUids.includes(user?.uid ?? '')) {
      // Allow demo users to access admin for testing
    }
  }, [isAuthenticated, user, navigate]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRidesData, pendingPayoutsData] = await Promise.all([
        filter === 'all' ? getAllRides() : getRidesByStatus(filter),
        getPendingPayouts(),
      ]);
      setRides(filter === 'all' ? allRidesData : allRidesData);
      setPayouts(pendingPayoutsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Confirm a payout
  const handleConfirmPayout = async (rideId: string) => {
    try {
      await updateRideStatus(rideId, 'completed', { paymentStatus: 'released' });
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('Payout confirmation failed:', err);
    }
  };

  // Stats
  const totalRevenue = rides
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.price, 0);
  const pendingCount = rides.filter(r => r.status === 'pending').length;
  const completedCount = rides.filter(r => r.status === 'completed').length;
  const cancelledCount = rides.filter(r => r.status === 'cancelled').length;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-600',
    driver_found: 'bg-blue-500/20 text-blue-600',
    in_progress: 'bg-green-500/20 text-green-600',
    completed: 'bg-emerald-500/20 text-emerald-600',
    cancelled: 'bg-red-500/20 text-red-600',
  };

  const filters: { label: string; value: StatusFilter; icon: typeof Car }[] = [
    { label: 'All', value: 'all', icon: Filter },
    { label: 'Pending', value: 'pending', icon: Clock },
    { label: 'Driver Found', value: 'driver_found', icon: Car },
    { label: 'In Progress', value: 'in_progress', icon: MapPin },
    { label: 'Completed', value: 'completed', icon: CheckCircle },
    { label: 'Cancelled', value: 'cancelled', icon: XCircle },
  ];

  return (
    <div className="absolute inset-0 bg-bg-body overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Panel</h1>
              <p className="text-xs text-txt-muted">{user?.username || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-body border border-border text-sm hover:bg-bg-hover transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-bg-card rounded-xl p-3 border border-border">
          <p className="text-xs text-txt-muted">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-600">{totalRevenue.toFixed(2)} Pi</p>
        </div>
        <div className="bg-bg-card rounded-xl p-3 border border-border">
          <p className="text-xs text-txt-muted">Completed Rides</p>
          <p className="text-xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-bg-card rounded-xl p-3 border border-border">
          <p className="text-xs text-txt-muted">Pending Rides</p>
          <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-bg-card rounded-xl p-3 border border-border">
          <p className="text-xs text-txt-muted">Cancelled</p>
          <p className="text-xl font-bold text-red-500">{cancelledCount}</p>
        </div>
      </div>

      {/* Pending Payouts */}
      {payouts.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-yellow-500" />
            Pending Payouts ({payouts.length})
          </h2>
          <div className="space-y-2">
            {payouts.map((ride) => (
              <div key={ride.rideId} className="bg-bg-card rounded-xl p-3 border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Ride {ride.rideId.slice(0, 8)}</span>
                  <span className="text-sm font-bold text-emerald-600">{ride.price.toFixed(2)} Pi</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-txt-muted mb-2">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{ride.passengerUid.slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-txt-muted mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{ride.pickup.name} → {ride.destination.name}</span>
                </div>
                <button
                  onClick={() => handleConfirmPayout(ride.rideId)}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Payout
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-bg-card border border-border text-txt-secondary hover:bg-bg-hover'
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Refresh */}
      <div className="px-4 mb-2 flex justify-end">
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-txt-muted hover:text-txt-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Rides List */}
      <div className="px-4 pb-8 space-y-2">
        {rides.length === 0 && !loading ? (
          <div className="text-center py-8 text-txt-muted text-sm">No rides found</div>
        ) : (
          rides.map((ride) => (
            <div key={ride.rideId} className="bg-bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ride.status] || 'bg-gray-500/20'}`}>
                    {ride.status}
                  </span>
                  <span className="text-xs text-txt-muted">{ride.rideId.slice(0, 8)}</span>
                </div>
                <span className="text-sm font-bold">{ride.price.toFixed(2)} Pi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-txt-secondary">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{ride.pickup.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-txt-secondary mt-1">
                <div className="w-3 flex justify-center">
                  <div className="w-0.5 h-3 bg-border" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-txt-secondary">
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <span className="truncate">{ride.destination.name}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-xs text-txt-muted">
                  Payment: <span className={ride.paymentStatus === 'released' ? 'text-emerald-500' : 'text-yellow-500'}>{ride.paymentStatus}</span>
                </span>
                {ride.driverUid && (
                  <span className="text-xs text-txt-muted flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {ride.driverUid.slice(0, 8)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code for Manual Pi Transfer */}
      <div className="mx-4 mb-6 p-4 bg-bg-card rounded-xl border border-border">
        <h3 className="text-sm font-semibold mb-2 text-center">Manual Pi Transfer QR</h3>
        <p className="text-xs text-txt-muted text-center mb-3">
          Scan with Pi Browser for emergency manual payouts
        </p>
        <div className="flex justify-center">
          <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-border p-2">
            {/* QR Code placeholder */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-txt-primary">
              <rect x="10" y="10" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="65" y="10" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="10" y="65" width="25" height="25" fill="currentColor" rx="2" />
              <rect x="40" y="10" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="55" y="10" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="40" y="25" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="10" y="40" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="25" y="40" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="40" y="40" width="20" height="20" fill="currentColor" rx="2" />
              <rect x="65" y="40" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="80" y="40" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="65" y="55" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="82" y="55" width="6" height="8" fill="currentColor" rx="1" />
              <rect x="40" y="65" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="55" y="65" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="40" y="82" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="55" y="80" width="8" height="10" fill="currentColor" rx="1" />
              <rect x="70" y="65" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="82" y="70" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="70" y="82" width="8" height="8" fill="currentColor" rx="1" />
              <rect x="82" y="82" width="8" height="8" fill="currentColor" rx="1" />
            </svg>
          </div>
        </div>
        <p className="text-[10px] text-txt-muted text-center mt-2 font-mono">
          taxipro-admin.pi
        </p>
      </div>
    </div>
  );
}
