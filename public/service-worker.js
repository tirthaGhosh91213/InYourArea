const CACHE_NAME = 'jharkhand-bihar-updates-v3';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1) Never cache or fallback for OneSignal / SW scripts (must be real JS, never HTML)
  const isOneSignal =
    url.hostname.includes('onesignal.com') ||
    url.pathname.startsWith('/OneSignalSDKWorker') ||
    url.pathname.startsWith('/OneSignalSDK') ||
    url.pathname.startsWith('/OneSignalSDKWorkerUpdater');

  const isServiceWorkerScript =
    url.pathname === '/service-worker.js' ||
    event.request.destination === 'serviceworker';

  if (isOneSignal || isServiceWorkerScript) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2) Only cache same-origin requests (avoid caching random cross-origin stuff)
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 3) Navigation requests: network-first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 4) Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      });
    })
  );
});
