export interface LatLng {
  lat: number;
  lng: number;
}

export interface User {
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  walletAddress?: string;
  role: 'rider' | 'driver';
  rating: number;
  totalRides: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  type: 'economy' | 'comfort' | 'premium' | 'xl' | 'moto';
  name: string;
  description: string;
  basePrice: number;
  perKmPrice: number;
  perMinutePrice: number;
  capacity: number;
  eta: number; // minutes
  image?: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: Location;
  dropoff: Location;
  vehicle: Vehicle;
  status: RideStatus;
  price: number;
  distance: number; // km
  duration: number; // minutes
  paymentMethod: 'pi' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  rating?: number;
  review?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  driverLocation?: LatLng;
}

export type RideStatus =
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Location {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  name?: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  phone: string;
  vehicle: DriverVehicle;
  rating: number;
  totalRides: number;
  isOnline: boolean;
  currentLocation: LatLng;
  documents: DriverDocuments;
}

export interface DriverVehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  type: Vehicle['type'];
}

export interface DriverDocuments {
  licenseNumber: string;
  licenseExpiry: string;
  insuranceNumber: string;
  insuranceExpiry: string;
}

export interface Payment {
  id: string;
  rideId: string;
  amount: number;
  currency: string;
  method: 'pi' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  piPaymentId?: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  currentScreen: ScreenName;
  previousScreen: ScreenName | null;
}

export type ScreenName =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'home'
  | 'booking'
  | 'ride_tracking'
  | 'payment'
  | 'profile'
  | 'ride_history'
  | 'driver_home'
  | 'driver_earnings'
  | 'settings';

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface PiPaymentArgs {
  amount: number;
  memo: string;
  metadata: {
    rideId: string;
    [key: string]: unknown;
  };
}

export interface SearchResult {
  address: string;
  lat: number;
  lng: number;
  name?: string;
}
