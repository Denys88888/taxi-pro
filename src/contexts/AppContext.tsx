import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { calculatePromoDiscount } from '@/components/PromoCodeInput';

// ─── Types ─────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  address: string;
  name: string;
  postcode?: string;
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

// Driver earnings tracking
export interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  total: number;
  ridesToday: number;
  ridesWeek: number;
  ridesTotal: number;
  onlineMinutes: number;
}

// Driver stats
export interface DriverStats {
  rating: number;
  totalRides: number;
  completionRate: number;
  acceptanceRate: number;
  cancellationRate: number;
}

// Driver documents
export type DriverDocumentType = 'license' | 'insurance' | 'registration' | 'background_check';
export type DriverDocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface DriverDocument {
  type: DriverDocumentType;
  status: DriverDocumentStatus;
  uploadedAt?: string;
  verifiedAt?: string;
  expiryDate?: string;
  url?: string;
}

const TARIFFS: Tariff[] = [
  { id: 'standard', name: 'Standard', description: 'Affordable everyday rides', baseMultiplier: 1.0, eta: '3 min', icon: 'car' },
  { id: 'comfort', name: 'Comfort', description: 'Newer cars with extra legroom', baseMultiplier: 1.3, eta: '5 min', icon: 'car-front' },
  { id: 'xl', name: 'XL', description: 'Fits up to 6 passengers', baseMultiplier: 1.8, eta: '7 min', icon: 'truck' },
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Алексей Петров', rating: 4.9, trips: 2847, car: 'Toyota Camry', licensePlate: 'А 123 БВ 77', avatar: '', phone: '+7-999-123-45-01' },
  { id: 'd2', name: 'Мария Иванова', rating: 4.8, trips: 1523, car: 'Honda Accord', licensePlate: 'В 456 КМ 99', avatar: '', phone: '+7-999-123-45-02' },
  { id: 'd3', name: 'Дмитрий Смирнов', rating: 4.7, trips: 3981, car: 'Tesla Model 3', licensePlate: 'Е 789 ОР 77', avatar: '', phone: '+7-999-123-45-03' },
];

const DEFAULT_PICKUP: Location = {
  lat: 55.7539,
  lng: 37.6208,
  address: 'Текущее местоположение',
  name: 'Москва, Красная площадь',
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

  // Driver earnings & stats
  driverEarnings: DriverEarnings;
  driverStats: DriverStats;
  driverDocuments: DriverDocument[];

  // Tariffs
  tariffs: Tariff[];

  // Promo code
  promoCode: string | null;
  promoDiscount: number;

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
  setDriverEarnings: (e: DriverEarnings) => void;
  setDriverStats: (s: DriverStats) => void;
  setDriverDocuments: (d: DriverDocument[]) => void;
  addRideEarnings: (amount: number) => void;
  updateOnlineMinutes: (minutes: number) => void;
  findMockDriver: () => Driver;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
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

  // Promo code state
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Driver earnings state
  const [driverEarnings, setDriverEarnings] = useState<DriverEarnings>({
    today: 0, week: 124.50, month: 456.80, total: 2456.30,
    ridesToday: 0, ridesWeek: 28, ridesTotal: 342,
    onlineMinutes: 0,
  });

  // Driver stats state
  const [driverStats, setDriverStats] = useState<DriverStats>({
    rating: 4.85,
    totalRides: 342,
    completionRate: 98.2,
    acceptanceRate: 94.5,
    cancellationRate: 1.8,
  });

  // Driver documents state
  const [driverDocuments, setDriverDocuments] = useState<DriverDocument[]>([
    { type: 'license', status: 'verified', uploadedAt: '2024-01-15', verifiedAt: '2024-01-16', expiryDate: '2027-01-15' },
    { type: 'insurance', status: 'verified', uploadedAt: '2024-02-01', verifiedAt: '2024-02-02', expiryDate: '2025-02-01' },
    { type: 'registration', status: 'pending', uploadedAt: '2024-12-01' },
    { type: 'background_check', status: 'verified', uploadedAt: '2024-01-10', verifiedAt: '2024-01-12' },
  ]);

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

  // Driver earnings helpers
  const addRideEarnings = useCallback((amount: number) => {
    setDriverEarnings(prev => ({
      ...prev,
      today: prev.today + amount,
      week: prev.week + amount,
      month: prev.month + amount,
      total: prev.total + amount,
      ridesToday: prev.ridesToday + 1,
      ridesWeek: prev.ridesWeek + 1,
      ridesTotal: prev.ridesTotal + 1,
    }));
  }, []);

  const updateOnlineMinutes = useCallback((minutes: number) => {
    setDriverEarnings(prev => ({ ...prev, onlineMinutes: prev.onlineMinutes + minutes }));
  }, []);

  const applyPromo = useCallback((code: string): boolean => {
    const discount = calculatePromoDiscount(code, price);
    if (discount <= 0) return false;
    setPromoCode(code.toUpperCase());
    setPromoDiscount(discount);
    return true;
  }, [price]);

  const removePromo = useCallback(() => {
    setPromoCode(null);
    setPromoDiscount(0);
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
        driverEarnings,
        driverStats,
        driverDocuments,
        promoCode,
        promoDiscount,
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
        setDriverEarnings,
        setDriverStats,
        setDriverDocuments,
        addRideEarnings,
        updateOnlineMinutes,
        findMockDriver,
        applyPromo,
        removePromo,
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
