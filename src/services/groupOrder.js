import { doc, setDoc, collection, serverTimestamp, runTransaction, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Group Order Service
 * Handles all group order-related operations.
 */

// Create a new group order
export const createGroupOrder = async (leaderId, products, discountTiers) => {
  try {
    const groupOrdersRef = collection(db, 'groupOrders');
    const newGroupOrderRef = doc(groupOrdersRef);

    const groupOrderData = {
      id: newGroupOrderRef.id,
      leaderId,
      memberIds: [],
      products, // This should be an array of objects with productId, name, price, etc.
      status: 'open',
      discountTiers, // e.g., [{ quantity: 5, discount: 0.10 }, { quantity: 10, discount: 0.20 }]
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentCollected: 0,
      totalCost: 0,
    };

    await setDoc(newGroupOrderRef, groupOrderData);
    console.log('Group order created with ID:', newGroupOrderRef.id);
    return groupOrderData;
  } catch (error) {
    console.error('Error creating group order:', error);
    throw error;
  }
};

// Get all open group orders
export const getOpenGroupOrders = async () => {
  try {
    const groupOrdersRef = collection(db, 'groupOrders');
    const q = query(groupOrdersRef, where('status', '==', 'open'));
    const querySnapshot = await getDocs(q);
    const openGroupOrders = [];
    querySnapshot.forEach((doc) => {
      openGroupOrders.push({ id: doc.id, ...doc.data() });
    });
    return openGroupOrders;
  } catch (error) {
    console.error('Error fetching open group orders:', error);
    throw error;
  }
};

// Join a group order
export const joinGroupOrder = async (groupId, userId, items) => {
  try {
    await runTransaction(db, async (transaction) => {
      const groupOrderRef = doc(db, 'groupOrders', groupId);
      const groupOrderDoc = await transaction.get(groupOrderRef);

      if (!groupOrderDoc.exists()) {
        throw new Error('Group order not found!');
      }

      const groupOrderData = groupOrderDoc.data();

      // Calculate the cost of the new items
      const newContribution = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

      // Update the member contributions
      const newMembers = [...groupOrderData.memberIds, { userId, items }];
      const totalCost = groupOrderData.totalCost + newContribution;

      // Simple discount logic (can be expanded)
      let discount = 0;
      if (groupOrderData.discountTiers) {
        const totalQuantity = newMembers.reduce((acc, member) => acc + member.items.reduce((iAcc, i) => iAcc + i.quantity, 0), 0);
        for (const tier of groupOrderData.discountTiers) {
          if (totalQuantity >= tier.quantity) {
            discount = tier.discount;
          }
        }
      }

      const discountedCost = totalCost * (1 - discount);

      transaction.update(groupOrderRef, {
        memberIds: arrayUnion({ userId, items, contribution: newContribution }),
        totalCost: totalCost,
        paymentCollected: discountedCost,
        updatedAt: serverTimestamp(),
      });

      // You would also handle the wallet transaction here, moving funds to escrow.
      // This part is simplified for this example.
    });
    console.log(`User ${userId} successfully joined group order ${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Error joining group order:', error);
    throw error;
  }
};

