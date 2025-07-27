// HawkerHub Service Worker
// Handles offline caching, background sync, and PWA functionality

const CACHE_NAME = 'hawkerhub-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const ESSENTIAL_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/orders/,
  /\/api\/users/
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache essential files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isNavigationRequest(request)) {
    // Navigation requests - serve from cache first, fallback to network
    event.respondWith(handleNavigationRequest(request));
  } else if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(handleStaticAssetRequest(request));
  } else if (isAPIRequest(request)) {
    // API requests - network first with cache fallback
    event.respondWith(handleAPIRequest(request));
  } else {
    // Other requests - network first
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/static/') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.jpg') ||
         url.pathname.includes('.ico');
}

// Check if request is an API request
function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         url.hostname.includes('firestore.googleapis.com') ||
         url.hostname.includes('firebase');
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed for navigation, serving from cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page or index
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    return await caches.match('/');
  }
}

// Handle static asset requests
async function handleStaticAssetRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Failed to fetch static asset:', request.url);
    // Return a generic offline response or cached version
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  try {
    // Network first for API requests
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] API request failed, trying cache:', request.url);
    
    // Try to serve from cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for failed API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request requires an internet connection' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[ServiceWorker] Request failed:', request.url);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'hawkerhub-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    console.log('[ServiceWorker] Performing background sync');
    
    // Notify the main app to sync pending operations
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        payload: { action: 'syncPendingOperations' }
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
    return Promise.reject(error);
  }
}

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[ServiceWorker] Unknown message type:', type);
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Push event for notifications (integrates with FCM)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      // Try to parse as JSON first
      const dataText = event.data.text();
      if (dataText.trim().startsWith('{')) {
        notificationData = JSON.parse(dataText);
      } else {
        // Handle plain text messages
        notificationData = {
          title: 'HawkerHub Notification',
          body: dataText,
          icon: '/logo192.png'
        };
      }
    } catch (error) {
      console.error('[ServiceWorker] Error parsing push data:', error);
      // Fallback for any parsing errors
      notificationData = {
        title: 'HawkerHub Notification',
        body: event.data ? event.data.text() : 'You have a new update!',
        icon: '/logo192.png'
      };
    }
  } else {
    // No data provided
    notificationData = {
      title: 'HawkerHub Notification',
      body: 'You have a new update!',
      icon: '/logo192.png'
    };
  }
  
  const notificationOptions = {
    body: notificationData.body || 'You have a new update!',
    icon: notificationData.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: 'hawkerhub-notification',
    data: notificationData.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };
  
  // Check for notification permission before showing notification
  event.waitUntil(
    checkNotificationPermissionAndShow(
      notificationData.title || 'HawkerHub Notification',
      notificationOptions
    )
  );
});

// Helper function to check notification permission
async function checkNotificationPermissionAndShow(title, options) {
  try {
    // Check if we have permission to show notifications
    if (self.Notification && self.Notification.permission === 'granted') {
      return self.registration.showNotification(title, options);
    } else {
      console.log('[ServiceWorker] Notification permission not granted, skipping notification');
      // Optionally, we could send a message to the main app to request permission
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'REQUEST_NOTIFICATION_PERMISSION',
          payload: { title, options }
        });
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Error showing notification:', error);
  }
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[ServiceWorker] Loaded successfully');
