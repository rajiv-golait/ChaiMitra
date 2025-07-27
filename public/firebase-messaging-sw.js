// Import Firebase scripts with error handling
try {
  importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
} catch (error) {
  console.error('Failed to load Firebase scripts:', error);
  // Fallback or alternative handling can be added here
}

// Firebase configuration with validation
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  try {
    firebase.initializeApp({
      apiKey: 'AIzaSyClB2mdAt46Nxevz0vHDK9pUT9-_0f2Y-k',
      authDomain: 'hawkerhub-bb135.firebaseapp.com',
      projectId: 'hawkerhub-bb135',
      storageBucket: 'hawkerhub-bb135.firebasestorage.app',
      messagingSenderId: '810226301678',
      appId: '1:810226301678:web:1c3509710f26772e62d1ff'
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.log('Firebase already initialized or not available');
}

// Initialize messaging with error handling
let messaging;
try {
  if (typeof firebase !== 'undefined' && firebase.messaging) {
    messaging = firebase.messaging();
  } else {
    console.error('Firebase messaging not available');
  }
} catch (error) {
  console.error('Failed to initialize Firebase messaging:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'HawkerHub Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new update!';
  const notificationIcon = payload.notification?.icon || payload.data?.icon || '/logo192.png';
  const notificationTag = payload.data?.tag || 'hawkerhub-notification';
  const notificationUrl = payload.data?.url || '/';
  
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/logo192.png',
    tag: notificationTag,
    data: {
      url: notificationUrl,
      timestamp: Date.now(),
      ...payload.data
    },
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

  return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log('Firebase messaging not initialized, background messages will not be handled');
}

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
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
