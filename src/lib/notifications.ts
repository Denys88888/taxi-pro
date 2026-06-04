/**
 * Push Notification System for Taxi Pro
 * ======================================
 * Supports BOTH local notifications (instant) AND Firebase Cloud Messaging
 * (server-sent push notifications via FCM).
 *
 * Local notifications:  Used for in-app events (driver found, ride complete, etc.)
 * FCM notifications:    Used for server-sent events (new message, driver update, promos)
 *
 * FCM Setup:
 * 1. Replace FIREBASE_CONFIG below with your actual Firebase web app config
 * 2. Ensure firebase-messaging-sw.js is in public/
 * 3. Call initFCM(userId) after user login
 * 4. Call deleteFCMToken() on logout
 */

// ============================================================================
// TODO: Replace with your actual Firebase web app config
// Get this from: Firebase Console > Project Settings > General > Your Apps
// ============================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummy-REPLACE-WITH-REAL",
  authDomain: "taxi-pro-pi.firebaseapp.com",
  projectId: "taxi-pro-pi",
  storageBucket: "taxi-pro-pi.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  // Optional: VAPID key for web push (from Firebase Console > Cloud Messaging > Web Push)
  vapidKey: undefined as string | undefined,
};
// ============================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Local Notifications ───────────────────────────────────────────────────

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Send an immediate local notification (no server required)
 */
export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options,
    });
  } catch (e) {
    console.error('[Notification] Failed:', e);
  }
}

// ─── Predefined Notification Helpers ───────────────────────────────────────

export function notifyDriverFound(driverName: string, eta: number): void {
  sendNotification('Водитель найден!', {
    body: `${driverName} прибудет через ${eta} мин`,
    tag: 'driver-found',
  });
}

export function notifyDriverArriving(driverName: string): void {
  sendNotification('Водитель прибыл!', {
    body: `${driverName} ждет вас`,
    tag: 'driver-arriving',
  });
}

export function notifyRideComplete(): void {
  sendNotification('Поездка завершена', {
    body: 'Спасибо за поездку! Оцените водителя.',
    tag: 'ride-complete',
  });
}

export function notifyPaymentRequired(amount: number): void {
  sendNotification('Требуется оплата', {
    body: `Стоимость поездки: ${amount.toFixed(2)} π`,
    tag: 'payment',
  });
}

export function notifyNewMessage(senderName: string, text: string): void {
  sendNotification(`Сообщение от ${senderName}`, {
    body: text.length > 60 ? text.substring(0, 60) + '…' : text,
    tag: 'chat-message',
  });
}

// ─── FCM (Firebase Cloud Messaging) Integration ────────────────────────────

/**
 * Initialize Firebase Messaging and get an FCM token.
 *
 * Call this AFTER the user successfully logs in — pass the user's UID
 * so the server can associate the push token with the user.
 *
 * @param userId  The authenticated user's unique ID
 * @returns       The FCM token string, or null if unavailable
 */
export async function initFCM(userId: string): Promise<string | null> {
  // Guard: Service Workers must be supported
  if (!('serviceWorker' in navigator)) {
    console.log('[FCM] Service Workers not supported in this browser');
    return null;
  }

  // Guard: Notification permission must be granted
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('[FCM] Notification permission denied');
    return null;
  }

  try {
    // Dynamically import Firebase SDK — tree-shakeable, loaded on demand
    // This keeps the main bundle small; Firebase only loads when needed
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

    const app = initializeApp(FIREBASE_CONFIG);
    const messaging = getMessaging(app);

    // Wait for the Firebase Messaging SW to be ready
    const swRegistration = await navigator.serviceWorker.ready;

    // Request FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: FIREBASE_CONFIG.vapidKey || undefined,
      serviceWorkerRegistration: swRegistration,
    });

    if (currentToken) {
      console.log('[FCM] Token obtained:', currentToken.substring(0, 20) + '...');

      // Register token with backend so server can push to this device
      await registerPushToken(userId, currentToken);

      // Listen for FOREGROUND messages (background handled by SW)
      onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        const title = payload.notification?.title || 'Taxi Pro';
        const body = payload.notification?.body || '';
        const tag = payload.data?.tag || payload.data?.type || 'fcm-msg';

        // Show as local notification while app is in foreground
        sendNotification(title, {
          body,
          tag,
          data: payload.data,
        });
      });

      // Persist token locally for reference
      localStorage.setItem('taxipro_fcm_token', currentToken);

      return currentToken;
    } else {
      console.log('[FCM] No token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('[FCM] Initialization failed:', err);
    return null;
  }
}

/**
 * Register the FCM token with the backend server.
 * This allows the server to send push notifications to this device.
 */
async function registerPushToken(userId: string, token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });
    console.log('[FCM] Token registered with server for user:', userId);
  } catch (err) {
    console.error('[FCM] Token registration with server failed:', err);
    // Token is still valid locally — server can be retried later
  }
}

/**
 * Delete the FCM token. Call this on user logout to stop receiving
 * push notifications for this account.
 */
export async function deleteFCMToken(): Promise<void> {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, deleteToken } = await import('firebase/messaging');

    const app = initializeApp(FIREBASE_CONFIG);
    const messaging = getMessaging(app);

    const deleted = await deleteToken(messaging);
    if (deleted) {
      console.log('[FCM] Token deleted successfully');
    }

    localStorage.removeItem('taxipro_fcm_token');
  } catch (err) {
    console.error('[FCM] Token deletion failed:', err);
    // Still remove from localStorage even if server delete fails
    localStorage.removeItem('taxipro_fcm_token');
  }
}

/**
 * Check if an FCM token is stored locally (user was previously registered)
 */
export function hasFCMToken(): boolean {
  return !!localStorage.getItem('taxipro_fcm_token');
}

/**
 * Get the stored FCM token (if any)
 */
export function getFCMToken(): string | null {
  return localStorage.getItem('taxipro_fcm_token');
}
