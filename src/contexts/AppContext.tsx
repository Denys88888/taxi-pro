import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────

export type RideStatus =
  | 'searching'
  | 'driver_found'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type DriverStatus = 'offline' | 'online' | 'on_ride';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  driverName?: string;
  pickup: Location;
  destination: Location;
  price: number;
  status: RideStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface EarningRecord {
  id: string;
  rideId: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
}

interface AppState {
  currentRide: Ride | null;
  rideHistory: Ride[];
  driverStatus: DriverStatus;
  notifications: Notification[];
  availableRides: Ride[];
  earnings: EarningRecord[];
  unreadNotificationsCount: number;
}

interface AppContextType extends AppState {
  // Ride actions
  setCurrentRide: (ride: Ride | null) => void;
  updateRideStatus: (rideId: string, status: RideStatus) => void;
  addRideToHistory: (ride: Ride) => void;
  clearCurrentRide: () => void;

  // Driver actions
  setDriverStatus: (status: DriverStatus) => void;
  acceptRide: (rideId: string) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Mock data
  generateMockRideHistory: () => Ride[];
  generateMockEarnings: () => EarningRecord[];
  generateMockAvailableRides: () => Ride[];
}

// ─── Mock Data Generators ──────────────────────────────────────

const MOCK_PICKUP: Location = {
  lat: 37.7749,
  lng: -122.4194,
  address: '123 Market St, San Francisco',
  name: 'Market Street',
};

const MOCK_DESTINATIONS: Location[] = [
  { lat: 37.7849, lng: -122.4094, address: '456 Mission St, San Francisco', name: 'Mission District' },
  { lat: 37.7649, lng: -122.4294, address: '789 Castro St, San Francisco', name: 'Castro' },
  { lat: 37.7949, lng: -122.3994, address: '321 Embarcadero, San Francisco', name: 'Embarcadero' },
  { lat: 37.7549, lng: -122.4394, address: '654 Haight St, San Francisco', name: 'Haight-Ashbury' },
];

function generateMockRide(id: string, status: RideStatus, index: number): Ride {
  const dest = MOCK_DESTINATIONS[index % MOCK_DESTINATIONS.length];
  return {
    id,
    passengerId: `passenger_${index}`,
    passengerName: `Passenger ${index + 1}`,
    driverId: `driver_${index}`,
    driverName: `Driver ${index + 1}`,
    pickup: MOCK_PICKUP,
    destination: dest,
    price: 2.5 + Math.random() * 8,
    status,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    completedAt: status === 'completed' ? new Date(Date.now() - index * 86400000 + 1800000).toISOString() : undefined,
  };
}

// ─── Context ───────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRide, setCurrentRideState] = useState<Ride | null>(null);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('offline');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Ride actions
  const setCurrentRide = useCallback((ride: Ride | null) => {
    setCurrentRideState(ride);
  }, []);

  const updateRideStatus = useCallback((rideId: string, status: RideStatus) => {
    setCurrentRideState((prev) => {
      if (prev?.id === rideId) {
        return { ...prev, status };
      }
      return prev;
    });
    setRideHistory((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, status } : r))
    );
  }, []);

  const addRideToHistory = useCallback((ride: Ride) => {
    setRideHistory((prev) => [ride, ...prev]);
  }, []);

  const clearCurrentRide = useCallback(() => {
    setCurrentRideState(null);
  }, []);

  // Driver actions
  const acceptRide = useCallback((rideId: string) => {
    setAvailableRides((prev) => prev.filter((r) => r.id !== rideId));
    setCurrentRideState((prev) => {
      if (prev?.id === rideId) {
        return { ...prev, status: 'driver_found' as RideStatus };
      }
      return prev;
    });
  }, []);

  // Notification actions
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Mock data generators
  const generateMockRideHistory = useCallback((): Ride[] => {
    const mock: Ride[] = [
      generateMockRide('ride_1', 'completed', 0),
      generateMockRide('ride_2', 'completed', 1),
      generateMockRide('ride_3', 'completed', 2),
      generateMockRide('ride_4', 'cancelled', 3),
      generateMockRide('ride_5', 'completed', 0),
    ];
    setRideHistory(mock);
    return mock;
  }, []);

  const generateMockEarnings = useCallback((): EarningRecord[] => {
    const mock: EarningRecord[] = Array.from({ length: 10 }, (_, i) => {
      const amount = 3 + Math.random() * 7;
      const commission = amount * 0.02;
      return {
        id: `earning_${i}`,
        rideId: `ride_${i}`,
        amount: Number(amount.toFixed(2)),
        commission: Number(commission.toFixed(2)),
        netAmount: Number((amount - commission).toFixed(2)),
        date: new Date(Date.now() - i * 86400000).toISOString(),
      };
    });
    setEarnings(mock);
    return mock;
  }, []);

  const generateMockAvailableRides = useCallback((): Ride[] => {
    const mock: Ride[] = [
      generateMockRide('avail_1', 'searching', 0),
      generateMockRide('avail_2', 'searching', 1),
      generateMockRide('avail_3', 'searching', 2),
    ];
    setAvailableRides(mock);
    return mock;
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentRide,
        rideHistory,
        driverStatus,
        notifications,
        availableRides,
        earnings,
        unreadNotificationsCount,
        setCurrentRide,
        updateRideStatus,
        addRideToHistory,
        clearCurrentRide,
        setDriverStatus,
        acceptRide,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        generateMockRideHistory,
        generateMockEarnings,
        generateMockAvailableRides,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
