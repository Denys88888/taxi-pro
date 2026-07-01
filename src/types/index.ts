// Domain types shared across the frontend (mirrors the backend schema).

export type Role = 'passenger' | 'driver' | 'admin';
export type VehicleType = 'economy' | 'comfort' | 'business' | 'xl';
export type Theme = 'light' | 'dark' | 'auto';

export type RideStatus =
  | 'searching'
  | 'assigned'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverInfo {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  number: string;
  vehiclePhoto?: string;
  licensePhoto?: string;
  licenseVerified: boolean;
  isOnline: boolean;
  lastLocation?: GeoPoint;
}

export interface User {
  uid: string;
  role: Role;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  rating: number;
  ratingCount: number;
  isBlocked: boolean;
  fcmToken?: string;
  preferredLanguage?: string;
  preferredTheme?: Theme;
  driverInfo?: DriverInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  pickup: GeoPoint;
  destination: GeoPoint;
  vehicleType: VehicleType;
  distanceKm: number;
  estimatedDurationMin: number;
  fare: number;
  platformFeePercent: number;
  platformFee: number;
  driverEarnings: number;
  status: RideStatus;
  paymentId?: string;
  txid?: string;
  passengerRating?: number;
  driverRating?: number;
  cancelledBy?: Role;
  cancellationReason?: string;
  cancellationFee?: number;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: Role;
  text: string;
  isTemplate: boolean;
  timestamp: string;
}

export interface DriverSummary {
  uid: string;
  name: string;
  rating: number;
  vehicleType?: VehicleType;
  location?: GeoPoint;
  distanceKm?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface HealthInfo {
  status: string;
  sandbox: boolean;
  firebase: boolean;
}
