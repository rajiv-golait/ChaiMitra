import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import notificationService from './notificationService';
import { holdFundsInEscrow, releaseFundsFromEscrow, refundEscrowFunds } from './wallet';

export const orderService = {
  // Create order with atomic stock update
  async createOrder(orderData) {
    try {
      return await runTransaction(db, async (transaction) => {
const { vendorId, items } = orderData;
        
        // Verify stock availability for all items
        const stockChecks = [];
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Product ${item.productName} not found`);
          }
          
          const availableQuantity = productDoc.data().availableQuantity;
          if (availableQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.productName}. Available: ${availableQuantity}`);
          }
          
          stockChecks.push({
            productRef,
            currentStock: availableQuantity,
            orderedQuantity: item.quantity
          });
        }
        
        // Group items by supplier
        const supplierGroups = items.reduce((groups, item) => {
          const supplierId = item.supplierId;
          if (!groups[supplierId]) {
            groups[supplierId] = [];
          }
          groups[supplierId].push(item);
          return groups;
        }, {});
        
        // Create orders for each supplier
        const orderIds = [];
        for (const [supplierId, supplierItems] of Object.entries(supplierGroups)) {
          const orderRef = doc(collection(db, 'orders'));
          const order = {
            vendorId,
            supplierId,
            items: supplierItems,
            totalAmount: supplierItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          transaction.set(orderRef, order);
          orderIds.push(orderRef.id);
        }
        
        // Update stock for all products
        for (const check of stockChecks) {
          transaction.update(check.productRef, {
            availableQuantity: check.currentStock - check.orderedQuantity,
            updatedAt: serverTimestamp()
          });
        }
        
        return orderIds;
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get orders for vendor
  async getVendorOrders(vendorId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  },

  // Get orders for supplier
  async getSupplierOrders(supplierId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Efficiently fetch vendor details
      const vendorIds = [...new Set(orders.map(order => order.vendorId))];
      if (vendorIds.length > 0) {
        const vendorsQuery = query(collection(db, 'users'), where('__name__', 'in', vendorIds));
        const vendorsSnapshot = await getDocs(vendorsQuery);
        const vendorsMap = new Map(vendorsSnapshot.docs.map(doc => [doc.id, doc.data()]));
        
        orders.forEach(order => {
          const vendor = vendorsMap.get(order.vendorId);
          order.vendorName = vendor ? vendor.name : 'Unknown Vendor';
          order.vendorPhone = vendor ? vendor.phoneNumber : '';
        });
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      const orderData = orderDoc.data();

      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });

      // Notify vendor of status change
      notificationService.createOrderNotification('order_status_changed', {
        orderId,
        status,
        recipientId: orderData.vendorId
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order (vendor only, pending orders only)
  async cancelOrder(orderId, vendorId) {
    try {
      return await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await transaction.get(orderRef);
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found');
        }
        
        const orderData = orderDoc.data();
        
        // Verify vendor ownership
        if (orderData.vendorId !== vendorId) {
          throw new Error('Unauthorized: You can only cancel your own orders');
        }
        
        // Check if order can be cancelled
        if (orderData.status !== 'pending') {
          throw new Error(`Order cannot be cancelled. Current status: ${orderData.status}`);
        }
        
        // Update order status to cancelled
        transaction.update(orderRef, {
          status: 'cancelled',
          paymentStatus: 'cancelled',
          cancelledAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Restore stock for all items in the order
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (productDoc.exists()) {
            const currentQuantity = productDoc.data().availableQuantity;
            transaction.update(productRef, {
              availableQuantity: currentQuantity + item.quantity,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Process payment for order (hold funds in escrow)
  async processOrderPayment(orderId, vendorId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderDoc.data();
      
      // Verify vendor ownership
      if (orderData.vendorId !== vendorId) {
        throw new Error('Unauthorized: You can only pay for your own orders');
      }
      
      // Check if order can be paid
      if (orderData.status !== 'pending') {
        throw new Error(`Order cannot be paid. Current status: ${orderData.status}`);
      }
      
      if (orderData.paymentStatus !== 'pending') {
        throw new Error(`Order payment already processed. Payment status: ${orderData.paymentStatus}`);
      }
      
      // Hold funds in escrow
      const escrowResult = await holdFundsInEscrow(
        vendorId,
        orderId,
        orderData.totalAmount,
        `Payment for order ${orderId}`
      );
      
      // Update order payment status
      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        escrowId: escrowResult.escrow.id,
        paidAt: serverTimestamp(),
        status: 'processing', // Move to processing once paid
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        escrowId: escrowResult.escrow.id,
        message: 'Payment processed successfully. Funds held in escrow.'
      };
    } catch (error) {
      console.error('Error processing order payment:', error);
      throw error;
    }
  },

  // Confirm delivery and release escrow funds
  async confirmDelivery(orderId, supplierId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderDoc.data();
      
      // Verify supplier ownership
      if (orderData.supplierId !== supplierId) {
        throw new Error('Unauthorized: You can only confirm delivery for your own orders');
      }
      
      // Check if order can be delivered
      if (orderData.status !== 'processing') {
        throw new Error(`Order cannot be delivered. Current status: ${orderData.status}`);
      }
      
      if (orderData.paymentStatus !== 'paid') {
        throw new Error('Order payment not processed');
      }
      
      if (!orderData.escrowId) {
        throw new Error('Escrow record not found for this order');
      }
      
      // Release funds from escrow to supplier
      const releaseResult = await releaseFundsFromEscrow(
        orderData.escrowId,
        supplierId
      );
      
      // Update order status
      await updateDoc(orderRef, {
        status: 'delivered',
        paymentStatus: 'completed',
        deliveredAt: serverTimestamp(),
        escrowReleaseStatus: 'released',
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Delivery confirmed. Funds released to supplier.',
        releaseResult
      };
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  },

  // Refund order (cancel with payment refund)
  async refundOrder(orderId, reason = 'Order cancelled') {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderDoc.data();
      
      // Check if order can be refunded
      if (orderData.status === 'delivered') {
        throw new Error('Delivered orders cannot be refunded');
      }
      
      if (orderData.paymentStatus !== 'paid') {
        throw new Error('Only paid orders can be refunded');
      }
      
      if (!orderData.escrowId) {
        throw new Error('Escrow record not found for this order');
      }
      
      // Refund escrow funds
      const refundResult = await refundEscrowFunds(
        orderData.escrowId,
        reason
      );
      
      // Update order status
      await updateDoc(orderRef, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        cancelledAt: serverTimestamp(),
        refundReason: reason,
        escrowReleaseStatus: 'refunded',
        updatedAt: serverTimestamp()
      });
      
      // Restore stock for all items in the order
      return await runTransaction(db, async (transaction) => {
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (productDoc.exists()) {
            const currentQuantity = productDoc.data().availableQuantity;
            transaction.update(productRef, {
              availableQuantity: currentQuantity + item.quantity,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        return {
          success: true,
          message: 'Order refunded successfully. Stock restored.',
          refundResult
        };
      });
    } catch (error) {
      console.error('Error refunding order:', error);
      throw error;
    }
  }
};