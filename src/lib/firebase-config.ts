// Firebase configuration - replace with your real Firebase project credentials
// Get these from Firebase Console → Project Settings → Your Apps

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getMessaging, type Messaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",           // Replace with your key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",              // Replace with your project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Check if Firebase is configured
const isConfigured = (): boolean => {
  return !firebaseConfig.apiKey.includes('YOUR_');
};

// Initialize Firebase (only if configured)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let messaging: Messaging | null = null;

export function initFirebase(): boolean {
  if (!isConfigured()) {
    console.warn('[Firebase] Not configured. Set your Firebase credentials in firebase-config.ts');
    return false;
  }
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    messaging = getMessaging(app);
    console.log('[Firebase] Initialized successfully');
    return true;
  } catch (err) {
    console.error('[Firebase] Init failed:', err);
    return false;
  }
}

export { app, db, messaging, isConfigured };

// FCM Token
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key from Firebase Console
    });
    return token || null;
  } catch {
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): void {
  if (!messaging) return;
  onMessage(messaging, callback);
}
