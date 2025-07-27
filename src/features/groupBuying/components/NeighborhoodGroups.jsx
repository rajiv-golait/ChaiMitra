// src/features/groupBuying/components/NeighborhoodGroups.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const NeighborhoodGroups = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!currentUser?.neighborhood) return;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "groups"),
          where("neighborhood", "==", currentUser.neighborhood),
          where("status", "==", "open")
        );
        const querySnapshot = await getDocs(q);
        const neighborhoodGroups = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setGroups(neighborhoodGroups);
        
        // Initialize quantities object
        const initialQuantities = {};
        neighborhoodGroups.forEach(group => {
          initialQuantities[group.id] = group.product?.minOrderQuantity || 1;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to load group buys");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  const handleQuantityChange = (groupId, value) => {
    setQuantities(prev => ({
      ...prev,
      [groupId]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const handleJoinGroup = async (groupId) => {
    if (!currentUser) {
      toast.error("Please log in to join a group buy");
      return;
    }

    const quantity = quantities[groupId];
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setJoining(true);
      const groupRef = doc(db, "groups", groupId);
      
      // In a production app, this would be a Firebase Cloud Function
      await updateDoc(groupRef, {
        [`participants.${currentUser.uid}`]: quantity,
        currentQuantity: (groups.find(g => g.id === groupId)?.currentQuantity || 0) + quantity
      });

      // Update pricing tier if needed
      await updatePricingTier(groupId);
      
      toast.success(`Successfully joined group buy for ${quantity} units!`);
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group buy");
    } finally {
      setJoining(false);
    }
  };

  const updatePricingTier = async (groupId) => {
    // This would be better as a Cloud Function
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const { pricingTiers, currentQuantity } = group;
    if (!pricingTiers?.length) return;

    // Find the best pricing tier based on current quantity
    let bestPrice = group.basePrice;
    for (const tier of pricingTiers.sort((a, b) => b.minQuantity - a.minQuantity)) {
      if (currentQuantity >= tier.minQuantity) {
        bestPrice = tier.price;
        break;
      }
    }

    if (bestPrice !== group.finalPricePerUnit) {
      await updateDoc(doc(db, "groups", groupId), {
        finalPricePerUnit: bestPrice
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Group Buys in {currentUser?.neighborhood || 'Your Area'}</h2>
      
      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No active group buys in your area.</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {/* TODO: Implement create group buy modal */}}
          >
            Start a Group Buy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">{group.productName}</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Progress:</span> {group.currentQuantity} / {group.targetQuantity} {group.unit}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (group.currentQuantity / group.targetQuantity) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ₹{group.finalPricePerUnit} <span className="text-sm text-gray-500">per {group.unit}</span>
                  </p>
                  {group.pricingTiers?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-medium">Bulk Pricing:</p>
                      <ul className="space-y-1 mt-1">
                        {group.pricingTiers
                          .sort((a, b) => a.minQuantity - b.minQuantity)
                          .map((tier, index) => (
                            <li key={index}>
                              {tier.minQuantity}+ units: ₹{tier.price} per unit
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Deadline:</span> {new Date(group.deadline?.toDate()).toLocaleString()}
                  </p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <input
                    type="number"
                    min={group.product?.minOrderQuantity || 1}
                    value={quantities[group.id] || ''}
                    onChange={(e) => handleQuantityChange(group.id, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={joining}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {joining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NeighborhoodGroups;