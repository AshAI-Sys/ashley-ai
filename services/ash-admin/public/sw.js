// Service Worker for Ashley AI PWA
// Version 1.0.1

const CACHE_NAME = 'ashley-ai-v1.0.1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests - network first with cache fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache GET requests (Cache API doesn't support POST/PUT/DELETE)
          if (event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Only return cached version for GET requests
          if (event.request.method === 'GET') {
            return caches.match(event.request).then((cached) => {
              if (cached) {
                return cached;
              }
              // Return offline response for API calls
              return new Response(
                JSON.stringify({
                  success: false,
                  error: 'Offline - no cached data available',
                  offline: true
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                }
              );
            });
          }
          // For non-GET requests, return error response
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Network error - cannot complete request offline',
              offline: true
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // Static assets - cache first with network fallback (only GET requests)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cached version and update cache in background (only for GET)
        if (event.request.method === 'GET') {
          fetch(event.request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }).catch(() => {});
        }
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful GET responses only
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline and not in cache - show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Ashley AI';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    // Find POST/PUT/DELETE requests that failed while offline
    const offlineRequests = requests.filter((request) => {
      return request.method !== 'GET' && request.method !== 'HEAD';
    });

    // Retry each request
    const syncPromises = offlineRequests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from cache after successful sync
          await cache.delete(request);
        }
        return response;
      } catch (error) {
        console.error('[SW] Sync failed for request:', request.url, error);
      }
    });

    await Promise.all(syncPromises);
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync error:', error);
    throw error;
  }
}

console.log('[SW] Service Worker loaded');
