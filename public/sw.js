/* Taxi Pro service worker.
 * Precaches the app shell and runtime-caches hashed build assets so the PWA
 * installs and works offline. Cross-origin requests (API, map tiles) are never
 * cached here — they must always hit the network. */

const CACHE = 'taxi-pro-v1';
const BASE = '/taxi-pro/';
const SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin GETs; let API + tiles go straight to the network.
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first, fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(BASE + 'index.html')));
    return;
  }

  // Static assets: cache-first, then network (and populate the cache).
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            if (res.ok && (url.pathname.startsWith(BASE + 'assets/') || SHELL.includes(url.pathname))) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached)
    )
  );
});
