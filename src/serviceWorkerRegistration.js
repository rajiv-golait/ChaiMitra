const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  // Service worker enabled for offline functionality
  console.log('Service worker registration enabled');
  
  // Clear any problematic localStorage data on first load
  if (window.performance && window.performance.navigation.type === 1) {
    try {
      localStorage.removeItem('hawkerhub_pending_operations');
      localStorage.removeItem('hawkerhub_cached_data');
      console.log('Cleared localStorage data on page reload');
    } catch (error) {
      console.log('Error clearing localStorage:', error);
    }
  }
  
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This web app is being served cache-first by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
      
      // Set up background sync registration
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        registration.sync.register('hawkerhub-sync');
        console.log('Background sync registered');
      }
      
      // Set up message listener for service worker messages
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      }
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

// Handle messages from service worker
function handleServiceWorkerMessage(event) {
  // Check if event.data exists before destructuring
  if (!event.data) {
    console.log('Service worker message received with no data');
    return;
  }
  
  const { type, payload } = event.data;
  
  console.log('Service worker message received:', type, payload);
  
  switch (type) {
    case 'BACKGROUND_SYNC':
      // Trigger offline service sync
      if (payload && payload.action === 'syncPendingOperations') {
        // Import and trigger sync
        import('./services/offlineService').then((module) => {
          const { offlineService } = module;
          if (offlineService && typeof offlineService.forceSync === 'function') {
            offlineService.forceSync();
          }
        }).catch(error => {
          console.error('Error loading offline service:', error);
        });
      }
      break;
      
    case 'CACHE_UPDATED':
      console.log('Cache updated:', payload);
      break;
      
    default:
      console.log('Unknown service worker message:', type);
  }
}

// Export functions for manual service worker control
export function skipWaiting() {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function clearCache() {
  return new Promise((resolve, reject) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error('Failed to clear cache'));
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    } else {
      reject(new Error('Service worker not available'));
    }
  });
}

export function getServiceWorkerVersion() {
  return new Promise((resolve, reject) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    } else {
      reject(new Error('Service worker not available'));
    }
  });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
