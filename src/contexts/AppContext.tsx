import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

export type TariffType = 'standard' | 'comfort' | 'xl';

export interface Tariff {
  id: TariffType;
  name: string;
  description: string;
  baseMultiplier: number;
  eta: string;
  icon: string;
}

export type RideStatus =
  | 'searching'
  | 'driver_found'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  car: string;
  licensePlate: string;
  avatar: string;
  phone: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  driverName?: string;
  driver?: Driver;
  pickup: Location;
  destination: Location;
  price: number;
  status: RideStatus;
  createdAt: string;
  completedAt?: string;
  tariff: TariffType;
}

export interface EarningRecord {
  id: string;
  rideId: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
}

const TARIFFS: Tariff[] = [
  { id: 'standard', name: 'Standard', description: 'Affordable everyday rides', baseMultiplier: 1.0, eta: '3 min', icon: 'car' },
  { id: 'comfort', name: 'Comfort', description: 'Newer cars with extra legroom', baseMultiplier: 1.3, eta: '5 min', icon: 'car-front' },
  { id: 'xl', name: 'XL', description: 'Fits up to 6 passengers', baseMultiplier: 1.8, eta: '7 min', icon: 'truck' },
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Michael Chen', rating: 4.9, trips: 2847, car: 'Toyota Camry', licensePlate: 'SF 7X42', avatar: '', phone: '+1-555-0101' },
  { id: 'd2', name: 'Sarah Johnson', rating: 4.8, trips: 1523, car: 'Honda Accord', licensePlate: 'SF 3K91', avatar: '', phone: '+1-555-0102' },
  { id: 'd3', name: 'James Wilson', rating: 4.7, trips: 3981, car: 'Tesla Model 3', licensePlate: 'SF 2B77', avatar: '', phone: '+1-555-0103' },
];

const DEFAULT_PICKUP: Location = {
  lat: 37.7749,
  lng: -122.4194,
  address: 'Current Location',
  name: 'Union Square, San Francisco',
};

// ─── Context Type ──────────────────────────────────────────────

interface AppContextType {
  // Location state
  pickup: Location;
  destination: Location | null;
  selectedTariff: TariffType;
  price: number;
  routeDistance: number;
  routeDuration: number;

  // Ride state
  currentRide: Ride | null;
  rideHistory: Ride[];
  driverMode: boolean;
  driverOnline: boolean;

  // Tariffs
  tariffs: Tariff[];

  // Actions
  setPickup: (loc: Location) => void;
  setDestination: (loc: Location | null) => void;
  setSelectedTariff: (t: TariffType) => void;
  setPrice: (p: number) => void;
  setRouteInfo: (distance: number, duration: number) => void;
  setCurrentRide: (ride: Ride | null) => void;
  addRideToHistory: (ride: Ride) => void;
  setDriverMode: (v: boolean) => void;
  setDriverOnline: (v: boolean) => void;
  findMockDriver: () => Driver;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pickup, setPickupState] = useState<Location>(DEFAULT_PICKUP);
  const [destination, setDestinationState] = useState<Location | null>(null);
  const [selectedTariff, setSelectedTariff] = useState<TariffType>('standard');
  const [price, setPriceState] = useState(2.5);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [currentRide, setCurrentRideState] = useState<Ride | null>(null);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [driverMode, setDriverMode] = useState(false);
  const [driverOnline, setDriverOnline] = useState(false);

  const setPickup = useCallback((loc: Location) => setPickupState(loc), []);
  const setDestination = useCallback((loc: Location | null) => setDestinationState(loc), []);
  const setPrice = useCallback((p: number) => setPriceState(p), []);
  const setRouteInfo = useCallback((distance: number, duration: number) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
  }, []);
  const setCurrentRide = useCallback((ride: Ride | null) => setCurrentRideState(ride), []);
  const addRideToHistory = useCallback((ride: Ride) => {
    setRideHistory((prev) => [ride, ...prev]);
  }, []);
  const setDriverModeState = useCallback((v: boolean) => setDriverMode(v), []);
  const setDriverOnlineState = useCallback((v: boolean) => setDriverOnline(v), []);

  const findMockDriver = useCallback(() => {
    const idx = Math.floor(Math.random() * MOCK_DRIVERS.length);
    return MOCK_DRIVERS[idx];
  }, []);

  return (
    <AppContext.Provider
      value={{
        pickup,
        destination,
        selectedTariff,
        price,
        routeDistance,
        routeDuration,
        currentRide,
        rideHistory,
        driverMode,
        driverOnline,
        tariffs: TARIFFS,
        setPickup,
        setDestination,
        setSelectedTariff,
        setPrice,
        setRouteInfo,
        setCurrentRide,
        addRideToHistory,
        setDriverMode: setDriverModeState,
        setDriverOnline: setDriverOnlineState,
        findMockDriver,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
