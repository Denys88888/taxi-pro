import { db, isConfigured } from './firebase-config';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, orderBy, getDocs, Timestamp, addDoc, onSnapshot } from 'firebase/firestore';

export interface UserDoc {
  uid: string;
  username: string;
  role: 'passenger' | 'driver';
  walletAddress?: string;
  fcmToken?: string;
  rating: number;
  createdAt: Timestamp;
}

export interface RideDoc {
  rideId: string;
  passengerUid: string;
  driverUid?: string;
  pickup: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  price: number;
  status: 'pending' | 'driver_found' | 'in_progress' | 'completed' | 'cancelled';
  paymentId?: string;
  paymentStatus: 'pending' | 'confirmed' | 'released';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface DriverDoc {
  uid: string;
  name: string;
  car: string;
  licensePlate: string;
  rating: number;
  isOnline: boolean;
  currentLocation?: { lat: number; lng: number };
  earnings: number;
  totalTrips: number;
}

// ─── Users ─────────────────────────────────────────────────────

/** Save or update a user in Firestore */
export async function saveUser(user: Omit<UserDoc, 'createdAt'>): Promise<void> {
  if (!db || !isConfigured()) {
    console.warn('[Firestore] Firebase not configured, skipping user save');
    return;
  }
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { ...user, createdAt: Timestamp.now() }, { merge: true });
    console.log('[Firestore] User saved:', user.uid);
  } catch (err) {
    console.error('[Firestore] saveUser error:', err);
  }
}

/** Get a user document by UID */
export async function getUser(uid: string): Promise<UserDoc | null> {
  if (!db || !isConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserDoc) : null;
  } catch (err) {
    console.error('[Firestore] getUser error:', err);
    return null;
  }
}

/** Update user's FCM token */
export async function saveFCMToken(uid: string, token: string): Promise<void> {
  if (!db || !isConfigured()) return;
  try {
    await setDoc(doc(db, 'users', uid), { fcmToken: token }, { merge: true });
    console.log('[Firestore] FCM token saved for user:', uid);
  } catch (err) {
    console.error('[Firestore] saveFCMToken error:', err);
  }
}

// ─── Rides ─────────────────────────────────────────────────────

/** Create a new ride document */
export async function createRide(ride: Omit<RideDoc, 'rideId' | 'createdAt'>): Promise<string> {
  if (!db || !isConfigured()) {
    console.warn('[Firestore] Firebase not configured, returning local ride ID');
    return 'local_' + Date.now();
  }
  try {
    const ridesRef = collection(db, 'rides');
    const docRef = await addDoc(ridesRef, {
      ...ride,
      createdAt: Timestamp.now()
    });
    await updateDoc(docRef, { rideId: docRef.id });
    console.log('[Firestore] Ride created:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('[Firestore] createRide error:', err);
    return 'local_' + Date.now();
  }
}

/** Update ride status and optional fields */
export async function updateRideStatus(
  rideId: string,
  status: RideDoc['status'],
  updates?: Partial<RideDoc>
): Promise<void> {
  if (!db || !isConfigured()) return;
  try {
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') updateData.completedAt = Timestamp.now();
    if (updates) Object.assign(updateData, updates);
    await updateDoc(doc(db, 'rides', rideId), updateData);
    console.log('[Firestore] Ride status updated:', rideId, '→', status);
  } catch (err) {
    console.error('[Firestore] updateRideStatus error:', err);
  }
}

/** Get a single ride by ID */
export async function getRide(rideId: string): Promise<RideDoc | null> {
  if (!db || !isConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'rides', rideId));
    return docSnap.exists() ? (docSnap.data() as RideDoc) : null;
  } catch (err) {
    console.error('[Firestore] getRide error:', err);
    return null;
  }
}

/** Get ride history for a user (as passenger) */
export async function getRideHistory(uid: string): Promise<RideDoc[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(
      collection(db, 'rides'),
      where('passengerUid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RideDoc);
  } catch (err) {
    console.error('[Firestore] getRideHistory error:', err);
    return [];
  }
}

/** Get pending rides (for admin/drivers) */
export async function getPendingRides(): Promise<RideDoc[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(
      collection(db, 'rides'),
      where('status', 'in', ['pending', 'driver_found']),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RideDoc);
  } catch (err) {
    console.error('[Firestore] getPendingRides error:', err);
    return [];
  }
}

/** Get all rides (for admin panel) */
export async function getAllRides(): Promise<RideDoc[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RideDoc);
  } catch (err) {
    console.error('[Firestore] getAllRides error:', err);
    return [];
  }
}

/** Subscribe to ride changes in real-time */
export function subscribeToRide(rideId: string, callback: (ride: RideDoc | null) => void): (() => void) {
  if (!db || !isConfigured()) {
    return () => {};
  }
  const unsub = onSnapshot(
    doc(db, 'rides', rideId),
    (docSnap) => {
      callback(docSnap.exists() ? (docSnap.data() as RideDoc) : null);
    },
    (err) => {
      console.error('[Firestore] subscribeToRide error:', err);
      callback(null);
    }
  );
  return unsub;
}

// ─── Drivers ───────────────────────────────────────────────────

/** Save or update driver profile */
export async function saveDriver(driver: DriverDoc): Promise<void> {
  if (!db || !isConfigured()) return;
  try {
    await setDoc(doc(db, 'drivers', driver.uid), driver, { merge: true });
    console.log('[Firestore] Driver saved:', driver.uid);
  } catch (err) {
    console.error('[Firestore] saveDriver error:', err);
  }
}

/** Get online drivers */
export async function getOnlineDrivers(): Promise<(DriverDoc & { id: string })[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(collection(db, 'drivers'), where('isOnline', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as DriverDoc) }));
  } catch (err) {
    console.error('[Firestore] getOnlineDrivers error:', err);
    return [];
  }
}

/** Get all drivers (for admin) */
export async function getAllDrivers(): Promise<(DriverDoc & { id: string })[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(collection(db, 'drivers'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as DriverDoc) }));
  } catch (err) {
    console.error('[Firestore] getAllDrivers error:', err);
    return [];
  }
}

/** Update driver online status */
export async function setDriverOnline(uid: string, isOnline: boolean, location?: { lat: number; lng: number }): Promise<void> {
  if (!db || !isConfigured()) return;
  try {
    const updates: Record<string, unknown> = { isOnline };
    if (location) updates.currentLocation = location;
    await updateDoc(doc(db, 'drivers', uid), updates);
  } catch (err) {
    console.error('[Firestore] setDriverOnline error:', err);
  }
}

// ─── Admin / Analytics ─────────────────────────────────────────

/** Get rides with status filter (for admin panel) */
export async function getRidesByStatus(status: RideDoc['status']): Promise<RideDoc[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(
      collection(db, 'rides'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RideDoc);
  } catch (err) {
    console.error('[Firestore] getRidesByStatus error:', err);
    return [];
  }
}

/** Get rides awaiting payout (completed but payment not released) */
export async function getPendingPayouts(): Promise<RideDoc[]> {
  if (!db || !isConfigured()) return [];
  try {
    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'completed'),
      where('paymentStatus', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RideDoc);
  } catch (err) {
    console.error('[Firestore] getPendingPayouts error:', err);
    return [];
  }
}
