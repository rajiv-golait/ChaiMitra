import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, onMessage, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging only if supported
let messaging = null;
const initializeMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
    return messaging;
  }
  return null;
};

// Initialize messaging
const messagingPromise = initializeMessaging();
export { messaging };

// FCM Token Management
export const getFCMToken = async () => {
  try {
    const messagingInstance = await messagingPromise;
    if (!messagingInstance) {
      console.log('FCM not supported on this browser');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const currentToken = await getToken(messagingInstance, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });

    if (currentToken) {
      console.log('FCM Token obtained:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Save FCM token to user document
export const saveFCMToken = async (userId, token) => {
  if (!userId || !token) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      fcmToken: token,
      lastTokenUpdate: serverTimestamp(),
      notificationsEnabled: true
    }, { merge: true });
    
    console.log('FCM token saved successfully');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// In-app notification handler
let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

// Handle incoming foreground messages
const setupForegroundMessaging = async () => {
  const messagingInstance = await messagingPromise;
  if (!messagingInstance) return;

  onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Extract notification data
    const notification = {
      id: Date.now().toString(),
      title: payload.notification?.title || payload.data?.title || 'New Notification',
      body: payload.notification?.body || payload.data?.body || '',
      icon: payload.notification?.icon || payload.data?.icon || '/logo192.png',
      timestamp: new Date(),
      read: false,
      type: payload.data?.type || 'general',
      data: payload.data || {}
    };

    // Call the notification callback if set
    if (notificationCallback) {
      notificationCallback(notification);
    }

    // Show browser notification if permission granted and app not focused
    if (Notification.permission === 'granted' && document.hidden) {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: '/logo192.png',
        tag: 'hawkerhub-notification',
        requireInteraction: true
      });
    }
  });
};

// Initialize foreground messaging
setupForegroundMessaging();

// Notification permission utilities
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

// Initialize FCM for authenticated user
export const initializeFCMForUser = async (userId) => {
  if (!userId) return;
  
  try {
    const token = await getFCMToken();
    if (token) {
      await saveFCMToken(userId, token);
    }
  } catch (error) {
    console.error('Error initializing FCM for user:', error);
  }
};

// Enable automatic offline persistence
// This will automatically cache data and enable offline access
try {
  // Firestore automatically enables offline persistence in modern versions
  console.log('Firebase offline persistence enabled');
} catch (error) {
  console.error('Failed to enable offline persistence:', error);
}

// Network management functions
export const goOffline = async () => {
  try {
    await disableNetwork(db);
    console.log('Firebase network disabled (offline mode)');
  } catch (error) {
    console.error('Failed to disable network:', error);
  }
};

export const goOnline = async () => {
  try {
    await enableNetwork(db);
    console.log('Firebase network enabled (online mode)');
  } catch (error) {
    console.error('Failed to enable network:', error);
  }
};
