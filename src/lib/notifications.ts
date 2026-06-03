// Browser push notification helpers for Taxi Pro

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

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

// Predefined notification helpers
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
