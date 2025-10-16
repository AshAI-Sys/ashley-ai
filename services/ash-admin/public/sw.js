// Ashley AI - Service Worker for PWA
// Version 1.0.0

const CACHE_VERSION = 'ashley-ai-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/orders',
  '/offline',
  '/manifest.json',
  // Add your critical CSS/JS files here
];

// API endpoints to cache
const API_ROUTES = [
  '/api/health',
  '/api/orders',
  '/api/clients',
  '/api/printing/dashboard',
  '/api/hr/stats',
  '/api/delivery/stats',
  '/api/finance/stats',
];

// Maximum cache size
const MAX_CACHE_SIZE = 50;
const MAX_API_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch((error) => {
      console.error('[Service Worker] Failed to cache static assets:', error);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('ashley-ai-') && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets - Cache first, fallback to network
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Pages - Network first, fallback to cache, then offline page
  event.respondWith(networkFirstWithOfflineFallback(request, DYNAMIC_CACHE));
});

// Strategy: Network First (for API calls)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());

      // Limit cache size
      limitCacheSize(cacheName, MAX_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Check if cache is stale
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) > MAX_API_CACHE_AGE) {
        console.log('[Service Worker] Cache is stale:', request.url);
      }
      return cachedResponse;
    }

    // Return offline response for API calls
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - No cached data available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Strategy: Cache First (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed for:', request.url, error);
    throw error;
  }
}

// Strategy: Network First with Offline Fallback (for pages)
async function networkFirstWithOfflineFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }

    // Fallback offline response
    return new Response(
      '<html><body><h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Utility: Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background Sync - for offline order submissions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }

  if (event.tag === 'sync-production-data') {
    event.waitUntil(syncProductionData());
  }
});

// Sync pending orders when back online
async function syncOrders() {
  try {
    console.log('[Service Worker] Syncing pending orders...');

    // Get pending orders from IndexedDB
    const db = await openDatabase();
    const pendingOrders = await getPendingOrders(db);

    if (pendingOrders.length === 0) {
      console.log('[Service Worker] No pending orders to sync');
      return;
    }

    // Sync each order
    const results = await Promise.allSettled(
      pendingOrders.map(order =>
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data)
        }).then(response => {
          if (response.ok) {
            return deletePendingOrder(db, order.id);
          }
          throw new Error('Failed to sync order');
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[Service Worker] Synced ${successful}/${pendingOrders.length} orders`);

    // Show notification
    if (successful > 0) {
      self.registration.showNotification('Ashley AI', {
        body: `Successfully synced ${successful} order${successful > 1 ? 's' : ''}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync orders:', error);
  }
}

// Sync production data
async function syncProductionData() {
  try {
    console.log('[Service Worker] Syncing production data...');

    // Refresh critical dashboard data
    const endpoints = [
      '/api/printing/dashboard',
      '/api/hr/stats',
      '/api/delivery/stats',
      '/api/finance/stats'
    ];

    await Promise.all(
      endpoints.map(endpoint =>
        fetch(endpoint).then(response => {
          if (response.ok) {
            const cache = caches.open(API_CACHE);
            cache.then(c => c.put(endpoint, response.clone()));
          }
        })
      )
    );

    console.log('[Service Worker] Production data synced');
  } catch (error) {
    console.error('[Service Worker] Failed to sync production data:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'Ashley AI',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// IndexedDB helpers for offline storage
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ashley-ai-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

function getPendingOrders(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingOrders'], 'readonly');
    const store = transaction.objectStore('pendingOrders');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingOrder(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingOrders'], 'readwrite');
    const store = transaction.objectStore('pendingOrders');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

console.log('[Service Worker] Loaded successfully');
