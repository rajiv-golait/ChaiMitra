// src/features/groupBuying/context/GroupBuyContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const GroupBuyContext = createContext();

export const useGroupBuy = () => {
  const context = useContext(GroupBuyContext);
  if (!context) {
    throw new Error('useGroupBuy must be used within a GroupBuyProvider');
  }
  return context;
};

export const GroupBuyProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeGroups, setActiveGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active groups in user's neighborhood
  useEffect(() => {
    if (!currentUser?.neighborhood) return;

    const q = query(
      collection(db, "groups"),
      where("neighborhood", "==", currentUser.neighborhood),
      where("status", "==", "open")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveGroups(groups);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load group buys");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch groups the user has joined
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "groups"),
      where(`participants.${currentUser.uid}`, ">", 0)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserGroups(userGroups);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const createGroupBuy = async (product, targetQuantity, deadline) => {
    if (!currentUser) {
      throw new Error("User must be logged in to create a group buy");
    }

    try {
      const groupData = {
        productId: product.id,
        productName: product.name,
        product: product,
        neighborhood: currentUser.neighborhood,
        status: "open",
        targetQuantity: Number(targetQuantity),
        currentQuantity: 0,
        deadline: new Date(deadline),
        participants: {},
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        unit: product.unit,
        basePrice: product.price,
        finalPricePerUnit: product.price,
        pricingTiers: product.pricingTiers || []
      };

      const docRef = await addDoc(collection(db, "groups"), groupData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating group buy:", error);
      throw error;
    }
  };

  const joinGroupBuy = async (groupId, quantity) => {
    if (!currentUser?.uid) {
      throw new Error("User must be logged in to join a group buy");
    }

    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error("Group buy not found");
    }

    const groupData = groupDoc.data();
    
    // Check if group is still open
    if (groupData.status !== "open") {
      throw new Error("This group buy is no longer accepting participants");
    }

    // Check if deadline has passed
    if (new Date() > groupData.deadline.toDate()) {
      throw new Error("The deadline for this group buy has passed");
    }

    // Update the group
    await updateDoc(groupRef, {
      [`participants.${currentUser.uid}`]: Number(quantity),
      currentQuantity: (groupData.currentQuantity || 0) + Number(quantity),
      updatedAt: serverTimestamp()
    });

    // Update pricing tier if needed
    await updatePricingTier(groupRef, groupData);
  };

  const updatePricingTier = async (groupRef, groupData) => {
    if (!groupData.pricingTiers?.length) return;

    const sortedTiers = [...groupData.pricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    let bestPrice = groupData.basePrice;

    for (const tier of sortedTiers) {
      if (groupData.currentQuantity >= tier.minQuantity) {
        bestPrice = tier.price;
        break;
      }
    }

    if (bestPrice !== groupData.finalPricePerUnit) {
      await updateDoc(groupRef, {
        finalPricePerUnit: bestPrice
      });
    }
  };

  const value = {
    activeGroups,
    userGroups,
    loading,
    createGroupBuy,
    joinGroupBuy
  };

  return (
    <GroupBuyContext.Provider value={value}>
      {children}
    </GroupBuyContext.Provider>
  );
};