import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { orderService } from '../services/orders';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing order data with real-time updates
 * Automatically filters orders based on user role (vendor or supplier)
 * 
 * @param {Object} options - Hook configuration options
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {string} options.status - Filter by order status (optional)
 */
const useOrders = (options = {}) => {
  const {
    realtime = true,
    status = null
  } = options;

  const { currentUser, userProfile } = useAuth();

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  /**
   * Build Firestore query based on user role and options
   */
  const buildQuery = useCallback(() => {
    if (!currentUser || !userProfile?.role) {
      return null;
    }

    const ordersRef = collection(db, 'orders');
    const constraints = [];

    // Filter by user role
    if (userProfile.role === 'vendor') {
      constraints.push(where('vendorId', '==', currentUser.uid));
    } else if (userProfile.role === 'supplier') {
      constraints.push(where('supplierId', '==', currentUser.uid));
    }

    // Filter by status if specified
    if (status) {
      constraints.push(where('status', '==', status));
    }

    // Order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    return query(ordersRef, ...constraints);
  }, [currentUser, userProfile, status]);

  /**
   * Fetch orders once (non-realtime)
   */
  const fetchOrders = useCallback(async () => {
    if (!currentUser || !userProfile?.role) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let fetchedOrders;
      
      if (userProfile.role === 'vendor') {
        fetchedOrders = await orderService.getVendorOrders(currentUser.uid);
      } else if (userProfile.role === 'supplier') {
        fetchedOrders = await orderService.getSupplierOrders(currentUser.uid);
      } else {
        fetchedOrders = [];
      }

      // Apply status filter if specified
      if (status) {
        fetchedOrders = fetchedOrders.filter(order => order.status === status);
      }

      setOrders(fetchedOrders);
      setLastFetch(new Date());

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile, status]);

  /**
   * Create a new order (vendor only)
   */
  const createOrder = useCallback(async (orderData) => {
    if (userProfile?.role !== 'vendor') {
      throw new Error('Only vendors can create orders');
    }

    try {
      setError(null);
      const orderIds = await orderService.createOrder({
        ...orderData,
        vendorId: currentUser.uid
      });
      
      // For realtime subscriptions, the orders will be added automatically
      // For non-realtime, refresh the data
      if (!realtime) {
        await fetchOrders();
      }
      
      return orderIds;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to place order');
      throw err;
    }
  }, [currentUser, userProfile, realtime, fetchOrders]);

  /**
   * Update order status (supplier only)
   */
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    if (userProfile?.role !== 'supplier') {
      throw new Error('Only suppliers can update order status');
    }

    try {
      setError(null);
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // For non-realtime, update the state manually
      if (!realtime) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus, updatedAt: new Date() }
              : order
          )
        );
      }
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
      throw err;
    }
  }, [userProfile, realtime]);

  /**
   * Cancel an order (vendor only, if status allows)
   */
  const cancelOrder = useCallback(async (orderId) => {
    if (userProfile?.role !== 'vendor') {
      throw new Error('Only vendors can cancel orders');
    }

    try {
      setError(null);
      await orderService.cancelOrder(orderId, currentUser.uid);
      
      // For non-realtime, refresh the data
      if (!realtime) {
        await fetchOrders();
      }
      
      return true;
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Failed to cancel order');
      throw err;
    }
  }, [currentUser, userProfile, realtime, fetchOrders]);

  /**
   * Get orders by status
   */
  const getOrdersByStatus = useCallback((filterStatus) => {
    return orders.filter(order => order.status === filterStatus);
  }, [orders]);

  /**
   * Get order statistics
   */
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0
    };

    orders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      stats.totalValue += order.totalAmount || 0;
    });

    return stats;
  }, [orders]);

  /**
   * Refresh orders data
   */
  const refreshOrders = useCallback(() => {
    if (realtime) {
      // For realtime, data is already fresh
      return;
    }
    fetchOrders();
  }, [realtime, fetchOrders]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set up real-time subscription or fetch data
  useEffect(() => {
    let unsubscribe;

    if (!currentUser || !userProfile?.role) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (realtime) {
      // Set up real-time listener
      setLoading(true);
      setError(null);

      const q = buildQuery();
      
      if (!q) {
        setLoading(false);
        return;
      }
      
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const ordersData = [];
            
            snapshot.forEach((doc) => {
              const orderData = {
                id: doc.id,
                ...doc.data()
              };
              
              // Convert Firestore timestamps to JavaScript dates
              if (orderData.createdAt?.toDate) {
                orderData.createdAt = orderData.createdAt.toDate();
              }
              if (orderData.updatedAt?.toDate) {
                orderData.updatedAt = orderData.updatedAt.toDate();
              }
              
              ordersData.push(orderData);
            });

            setOrders(ordersData);
            setLastFetch(new Date());
            setLoading(false);
          } catch (err) {
            console.error('Error in orders snapshot:', err);
            setError('Failed to sync orders data');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Orders subscription error:', err);
          setError(err.message || 'Failed to listen for order updates');
          setLoading(false);
        }
      );
    } else {
      // Fetch data once
      fetchOrders();
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realtime, buildQuery, fetchOrders, currentUser, userProfile]);

  return {
    // Data
    orders,
    loading,
    error,
    lastFetch,
    
    // Actions
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refreshOrders,
    clearError,
    
    // Utilities
    getOrdersByStatus,
    getOrderStats,
    isEmpty: orders.length === 0,
    count: orders.length,
    
    // User context
    userRole: userProfile?.role
  };
};

export default useOrders;
