import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import notificationService from '../../services/notificationService';
import NotificationCenter from '../NotificationCenter';

const NotificationManager = () => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for user's notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = [];
        snapshot.forEach((doc) => {
          notificationsList.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().createdAt?.toDate() || new Date()
          });
        });

        setNotifications(notificationsList);
        
        // Update notification service with new notifications
        notificationsList.forEach(notification => {
          notificationService.addNotification(notification);
        });

        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Helper function to create notification in Firestore
  const createNotification = async (notificationData) => {
    if (!user?.uid) return null;

    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        recipientId: user.uid,
        read: false,
        createdAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // Helper function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Helper function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = [];
      notifications.filter(n => !n.read).forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.push(updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        }));
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Expose functions for creating specific types of notifications
  const createOrderNotification = async (type, orderData) => {
    const notificationData = {
      type,
      title: getNotificationTitle(type, orderData),
      body: getNotificationBody(type, orderData),
      data: orderData,
      icon: getNotificationIcon(type)
    };

    return await createNotification(notificationData);
  };

  const getNotificationTitle = (type, data) => {
    switch (type) {
      case 'new_order':
        return 'New Order Received';
      case 'order_status_changed':
        return 'Order Status Updated';
      case 'payment_received':
        return 'Payment Received';
      case 'order_delivered':
        return 'Order Delivered';
      case 'low_stock':
        return 'Low Stock Alert';
      case 'group_invite':
        return 'Group Order Invitation';
      case 'product_approved':
        return 'Product Approved';
      default:
        return 'New Notification';
    }
  };

  const getNotificationBody = (type, data) => {
    switch (type) {
      case 'new_order':
        return `You received a new order from ${data.vendorName}`;
      case 'order_status_changed':
        return `Order #${data.orderId} status changed to ${data.status}`;
      case 'payment_received':
        return `Payment of ₹${data.amount} received for order #${data.orderId}`;
      case 'order_delivered':
        return `Order #${data.orderId} has been delivered successfully`;
      case 'low_stock':
        return `Low stock alert for ${data.productName} - only ${data.quantity} left`;
      case 'group_invite':
        return 'You have been invited to join a group order';
      case 'product_approved':
        return `Your product "${data.productName}" has been approved and listed`;
      default:
        return data.message || 'You have a new notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return '📦';
      case 'payment_received':
        return '💰';
      case 'order_delivered':
        return '✅';
      case 'low_stock':
        return '⚠️';
      case 'group_invite':
        return '👥';
      case 'product_approved':
        return '✨';
      default:
        return '🔔';
    }
  };

  // Render the notification center component
  return (
    <NotificationCenter 
      notifications={notifications}
      language={language}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      loading={loading}
    />
  );
};

// Export the helper functions for use in other components
export { NotificationManager as default };

// Export notification creation functions
export const useNotifications = () => {
  const { user } = useAuth();

  const createOrderNotification = async (type, orderData) => {
    if (!user?.uid) return null;

    try {
      const notificationData = {
        type,
        title: getNotificationTitle(type, orderData),
        body: getNotificationBody(type, orderData),
        data: orderData,
        icon: getNotificationIcon(type),
        recipientId: user.uid,
        read: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  const createSystemNotification = async (title, body, data = {}) => {
    if (!user?.uid) return null;

    try {
      const notificationData = {
        type: 'system',
        title,
        body,
        data,
        icon: '🔔',
        recipientId: user.uid,
        read: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating system notification:', error);
      return null;
    }
  };

  return {
    createOrderNotification,
    createSystemNotification
  };
};

// Helper functions (moved outside for reuse)
const getNotificationTitle = (type, data) => {
  switch (type) {
    case 'new_order':
      return 'New Order Received';
    case 'order_status_changed':
      return 'Order Status Updated';
    case 'payment_received':
      return 'Payment Received';
    case 'order_delivered':
      return 'Order Delivered';
    case 'low_stock':
      return 'Low Stock Alert';
    case 'group_invite':
      return 'Group Order Invitation';
    case 'product_approved':
      return 'Product Approved';
    default:
      return 'New Notification';
  }
};

const getNotificationBody = (type, data) => {
  switch (type) {
    case 'new_order':
      return `You received a new order from ${data.vendorName}`;
    case 'order_status_changed':
      return `Order #${data.orderId} status changed to ${data.status}`;
    case 'payment_received':
      return `Payment of ₹${data.amount} received for order #${data.orderId}`;
    case 'order_delivered':
      return `Order #${data.orderId} has been delivered successfully`;
    case 'low_stock':
      return `Low stock alert for ${data.productName} - only ${data.quantity} left`;
    case 'group_invite':
      return 'You have been invited to join a group order';
    case 'product_approved':
      return `Your product "${data.productName}" has been approved and listed`;
    default:
      return data.message || 'You have a new notification';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'new_order':
      return '📦';
    case 'payment_received':
      return '💰';
    case 'order_delivered':
      return '✅';
    case 'low_stock':
      return '⚠️';
    case 'group_invite':
      return '👥';
    case 'product_approved':
      return '✨';
    default:
      return '🔔';
  }
};
