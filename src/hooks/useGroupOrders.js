import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  getDoc,
  writeBatch // Use writeBatch for atomic operations
} from 'firebase/firestore';
import { db } from '../services/firebase'; // Ensure this path is correct
import { useAuth } from '../contexts/AuthContext'; // Ensure this path is correct

/**
 * @description A comprehensive React hook for managing group orders in Firebase.
 * Handles creating, joining, leaving, and managing group orders with real-time updates.
 */
export const useGroupOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- REAL-TIME LISTENERS ---

  /**
   * @description Listens to a collection of group orders based on a filter.
   * @param {function} setGroupOrders - The state setter function for the list of orders.
   * @param {string} filterType - 'open', 'myOrders', 'leading', or 'all'.
   * @returns {function} Unsubscribe function to clean up the listener.
   */
  const listenToGroupOrders = useCallback((setGroupOrders, filterType = 'all') => {
    if (!user) {
      setGroupOrders([]);
      return () => {};
    }

    let q;
    const groupOrdersRef = collection(db, 'groupOrders');

    switch (filterType) {
      case 'open':
        q = query(groupOrdersRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(50));
        break;
      case 'myOrders':
        q = query(groupOrdersRef, where('memberIDs', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
        break;
      case 'leading':
        q = query(groupOrdersRef, where('leaderID', '==', user.uid), orderBy('createdAt', 'desc'));
        break;
      default:
        q = query(groupOrdersRef, orderBy('createdAt', 'desc'), limit(50));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroupOrders(orders);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to group orders:", err);
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);
  
  /**
   * @description Subscribes to real-time updates for a single group order document.
   * @param {string} groupOrderId - The ID of the group order.
   * @param {function} callback - Function to call with the updated order data.
   * @returns {function} Unsubscribe function.
   */
  const subscribeToGroupOrder = (groupOrderId, callback) => {
    if (!groupOrderId) return () => {};
    const unsubscribe = onSnapshot(doc(db, 'groupOrders', groupOrderId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    }, (err) => console.error("Error subscribing to group order:", err));
    return unsubscribe;
  };

  // --- CORE GROUP ORDER ACTIONS ---

  /**
   * @description Creates a new group order.
   * @param {object} orderData - The initial data for the order, including title and products.
   * @returns {string} The ID of the newly created group order.
   */
  const createGroupOrder = async (orderData) => {
    if (!user) throw new Error('User not authenticated');
    
    // Ensure initial quantities and contributions are set
    const initialProducts = orderData.products.map(p => ({
        ...p,
        currentQuantity: p.initialQuantity,
        memberContributions: { [user.uid]: p.initialQuantity }
    }));

    const newOrder = {
      ...orderData,
      products: initialProducts,
      leaderID: user.uid,
      leaderName: user.displayName || 'Anonymous',
      memberIDs: [user.uid],
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'groupOrders'), newOrder);
    return docRef.id;
  };

  /**
   * @description Updates the quantities of products in a group order. This is the primary function for joining, leaving, or changing an order.
   * @param {string} groupOrderId - The ID of the group order.
   * @param {Array<object>} productUpdates - An array of objects like `{ productId: string, newQuantity: number }`.
   */
  const updateProductQuantities = async (groupOrderId, productUpdates) => {
      if (!user) throw new Error('User not authenticated');

      const groupOrderRef = doc(db, 'groupOrders', groupOrderId);
      const batch = writeBatch(db);

      const groupOrderDoc = await getDoc(groupOrderRef);
      if (!groupOrderDoc.exists()) throw new Error("Group order not found.");
      
      const groupOrderData = groupOrderDoc.data();
      const updatedProducts = [...groupOrderData.products];
      let isNewMember = !groupOrderData.memberIDs.includes(user.uid);

      productUpdates.forEach(update => {
          const productIndex = updatedProducts.findIndex(p => p.productId === update.productId);
          if (productIndex === -1) return; // Skip if product not found

          const product = updatedProducts[productIndex];
          const oldQuantity = product.memberContributions[user.uid] || 0;
          const quantityChange = update.newQuantity - oldQuantity;

          product.currentQuantity = (product.currentQuantity || 0) + quantityChange;
          product.memberContributions[user.uid] = update.newQuantity;

          // If a user's total contribution becomes zero, they effectively leave that product
          if (product.memberContributions[user.uid] === 0) {
              delete product.memberContributions[user.uid];
          }
      });
      
      // Update the main document with the new products array
      batch.update(groupOrderRef, { products: updatedProducts, updatedAt: serverTimestamp() });
      
      // If the user is new to the order, add them to the memberIDs list
      if (isNewMember) {
          batch.update(groupOrderRef, { memberIDs: [...groupOrderData.memberIDs, user.uid] });
      }

      // Check if user has any quantity left in any product. If not, remove from memberIDs.
      const totalContribution = updatedProducts.reduce((sum, p) => sum + (p.memberContributions[user.uid] || 0), 0);
      if (!isNewMember && totalContribution === 0) {
          const newMemberIDs = groupOrderData.memberIDs.filter(id => id !== user.uid);
          batch.update(groupOrderRef, { memberIDs: newMemberIDs });
      }

      await batch.commit();
  };

  /**
   * @description Closes a group order. Can only be done by the leader.
   * @param {string} groupOrderId - The ID of the group order.
   */
  const closeGroupOrder = async (groupOrderId) => {
      if (!user) throw new Error('User not authenticated');
      
      const groupOrderRef = doc(db, 'groupOrders', groupOrderId);
      const groupOrderDoc = await getDoc(groupOrderRef);
      if (!groupOrderDoc.exists()) throw new Error("Group order not found.");

      const groupOrderData = groupOrderDoc.data();
      if (groupOrderData.leaderID !== user.uid) throw new Error("Only the leader can close the order.");

      await updateDoc(groupOrderRef, {
          status: 'closed',
          closedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
      });
  };

  return {
    loading,
    error,
    listenToGroupOrders,
    subscribeToGroupOrder,
    createGroupOrder,
    updateProductQuantities,
    closeGroupOrder,
    // Add other functions like cancel, invite, etc. if they are complete.
  };
};