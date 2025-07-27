import { setNotificationCallback } from './firebase';
import translations from '../utils/translations';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.currentLanguage = 'en';
    this.maxNotifications = 50;

    // Setup Firebase notification callback
    setNotificationCallback(this.handleFirebaseNotification.bind(this));
  }

  // Set current language for translations
  setLanguage(language) {
    this.currentLanguage = language;
  }

  // Get translated text
  t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      // Replace parameters in the string
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return key; // Return key if translation not found
  }

  // Handle notification from Firebase
  handleFirebaseNotification(notification) {
    this.addNotification(notification);
  }

  // Add a new notification
  addNotification(notification) {
    const newNotification = {
      id: notification.id || Date.now().toString(),
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo192.png',
      timestamp: notification.timestamp || new Date(),
      read: notification.read || false,
      type: notification.type || 'general',
      data: notification.data || {},
      ...notification
    };

    // Add to beginning of array (newest first)
    this.notifications.unshift(newNotification);

    // Limit number of notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Notify listeners
    this.notifyListeners();

    // Show toast notification if supported
    this.showToastNotification(newNotification);
  }

  // Create notification for order updates
  createOrderNotification(type, data = {}) {
    let title, body;

    switch (type) {
      case 'new_order':
        title = this.t('notifications.newOrder');
        body = this.t('notifications.messages.newOrderReceived', { vendor: data.vendorName });
        break;
      case 'order_status_changed':
        title = this.t('notifications.orderUpdate');
        body = this.t('notifications.messages.orderStatusChanged', { 
          orderId: data.orderId, 
          status: data.status 
        });
        break;
      case 'payment_received':
        title = this.t('notifications.paymentConfirmed');
        body = this.t('notifications.messages.paymentReceived', { 
          amount: data.amount, 
          orderId: data.orderId 
        });
        break;
      case 'order_delivered':
        title = this.t('notifications.deliveryUpdate');
        body = this.t('notifications.messages.orderDelivered', { orderId: data.orderId });
        break;
      case 'low_stock':
        title = this.t('notifications.stockAlert');
        body = this.t('notifications.messages.lowStockWarning', { 
          product: data.productName, 
          quantity: data.quantity 
        });
        break;
      case 'group_invite':
        title = this.t('notifications.groupInvite');
        body = this.t('notifications.messages.groupOrderInvite');
        break;
      case 'product_approved':
        title = this.t('notifications.productApproved');
        body = this.t('notifications.messages.productListed', { product: data.productName });
        break;
      default:
        title = this.t('notifications.systemUpdate');
        body = data.message || 'You have a new notification';
    }

    const notification = {
      type,
      title,
      body,
      data,
      timestamp: new Date(),
      read: false
    };

    this.addNotification(notification);
    return notification;
  }

  // Show toast notification (can be integrated with a toast library)
  showToastNotification(notification) {
    // This is a placeholder - you can integrate with react-hot-toast or similar
    if (window.showToast) {
      window.showToast({
        title: notification.title,
        message: notification.body,
        type: this.getToastType(notification.type),
        duration: 5000
      });
    }
  }

  // Get toast type for styling
  getToastType(notificationType) {
    switch (notificationType) {
      case 'new_order':
      case 'payment_received':
      case 'product_approved':
        return 'success';
      case 'low_stock':
      case 'order_cancelled':
        return 'warning';
      case 'payment_failed':
      case 'system_error':
        return 'error';
      default:
        return 'info';
    }
  }

  // Subscribe to notification updates
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  // Get unread count
  getUnreadCount() {
    return this.getUnreadNotifications().length;
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Remove notification
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Get recent notifications (last N)
  getRecentNotifications(count = 5) {
    return this.notifications.slice(0, count);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
