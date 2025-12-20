const CACHE_NAME = 'jharkhand-bihar-updates-v2'; // ✅ Changed version to force update

// Install - cache important files
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/logo.png'
      ]).catch((err) => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting(); // Force activate immediately
});

// Fetch - Network first, then cache (better for dynamic content)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          return response || caches.match('/index.html');
        });
      })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control immediately
});
