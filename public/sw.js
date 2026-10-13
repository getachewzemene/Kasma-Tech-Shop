// ==============================================================================
// Kasma Tech Shop - High-Performance PWA Service Worker (Mobile & Tablet)
// Cache Strategies:
//   1. Static Assets & Fonts -> Cache-First with Background Update (0ms Load)
//   2. API Catalog & Products -> Network-First with Offline Cache Fallback
//   3. Navigation (HTML Pages) -> Network-First with App Shell Fallback
// ==============================================================================

const CACHE_NAME = 'kasma-pwa-v1.2';
const API_CACHE_NAME = 'kasma-api-v1.2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW PRECACHE NOTICE] Some precache items skipped:', err);
      });
    })
  );
});

// 2. Service Worker Activation & Cache Housekeeping
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== API_CACHE_NAME) {
            console.log('[SW CLEANUP] Removing deprecated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Interception with Specialized Mobile Caching Strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST orders, OTP verify, payment webhooks)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and internal schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // A. Product Catalog API: Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/products') || url.pathname.startsWith('/api/merchants')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(JSON.stringify({ error: 'Offline mode: Cached data unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // B. Static Assets (JS, CSS, Web Fonts, Images, Hashed Chunks): Cache-First / Stale-While-Revalidate
  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for up-to-date assets
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. HTML Navigation Requests (SPA Routing): Network-First with App Shell Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedShell = await caches.match('/index.html') || await caches.match('/');
          if (cachedShell) {
            return cachedShell;
          }
          return new Response('<h1>Offline - Kasma Tech Shop</h1><p>Please check your internet connection.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. Background Sync / Push Notification Stub
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
