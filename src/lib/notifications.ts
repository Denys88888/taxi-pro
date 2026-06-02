import { getFCMToken, onForegroundMessage } from './firebase-config';

/**
 * Initialize Firebase Cloud Messaging notifications for a user.
 * Call this after successful authentication.
 */
export async function initNotifications(userId: string): Promise<void> {
  // Request browser notification permission
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission not granted');
      return;
    }
  }

  // Get FCM token
  const token = await getFCMToken();
  if (token) {
    console.log('[FCM] Token acquired:', token.substring(0, 20) + '...');
    // Save token to Firestore
    try {
      const { saveFCMToken } = await import('./firestore-service');
      await saveFCMToken(userId, token);
    } catch (err) {
      console.error('[FCM] Failed to save token:', err);
    }
  }

  // Listen for foreground messages
  onForegroundMessage((payload) => {
    console.log('[FCM] Foreground message:', payload);
    const title = payload.notification?.title || 'Taxi Pro';
    const body = payload.notification?.body || '';
    showNotification(title, body);
  });

  console.log('[FCM] Notifications initialized for user:', userId);
}

/** Show a browser notification */
function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'taxi-pro',
    });
  }
}

/** Send a local notification immediately */
export function sendLocalNotification(title: string, body: string): void {
  showNotification(title, body);
}

/** Schedule a local notification after a delay (in ms) */
export function scheduleNotification(title: string, body: string, delayMs: number): void {
  setTimeout(() => showNotification(title, body), delayMs);
}
