import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupOrders } from '../hooks/useGroupOrders';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisputeForm from '../components/common/DisputeForm';
import { createDispute } from '../services/disputes';
import { format } from 'date-fns';
import {
  ChevronLeft,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Share2,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Info,
  Mail,
  MessageCircle,
  Copy,
  X
} from 'lucide-react';

const GroupOrderDetail = () => {
  const { groupOrderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    subscribeToGroupOrder, 
    subscribeToActivities,
    updateProductQuantities,
    joinGroupOrder,
    leaveGroupOrder,
    closeGroupOrder,
    cancelGroupOrder 
  } = useGroupOrders();

  const [groupOrder, setGroupOrder] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [shareDialog, setShareDialog] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinQuantities, setJoinQuantities] = useState({});
  const [isDisputeFormOpen, setDisputeFormOpen] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!groupOrderId) return;

    setLoading(true);
    
    // Subscribe to group order updates
    const unsubscribeOrder = subscribeToGroupOrder(groupOrderId, (orderData) => {
      setGroupOrder(orderData);
      
      // Initialize product quantities for current user
      if (orderData && user) {
        const userQuantities = {};
        orderData.products.forEach(product => {
          userQuantities[product.productId] = 
            product.memberContributions[user.uid] || 0;
        });
        setProductQuantities(userQuantities);
      }
      
      setLoading(false);
    });

    // Subscribe to activities
    const unsubscribeActivities = subscribeToActivities(groupOrderId, (activityData) => {
      setActivities(activityData);
    });

    return () => {
      unsubscribeOrder && unsubscribeOrder();
      unsubscribeActivities && unsubscribeActivities();
    };
  }, [groupOrderId, user, subscribeToGroupOrder, subscribeToActivities]);

  // Auto-hide snackbar after duration
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, open: false });
      }, 6000);
      return () => clearTimeout(timer);
    }
}, [snackbar]);

  const handleQuantityChange = (productId, change) => {
    const currentQty = productQuantities[productId] || 0;
    const newQty = Math.max(0, currentQty + change);
    setProductQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }));
  };

  const handleUpdateQuantities = async () => {
    setUpdateLoading(true);
    try {
      const updates = Object.entries(productQuantities).map(([productId, quantity]) => ({
        productId,
        quantity
      }));
      
      await updateProductQuantities(groupOrderId, updates);
      setError(null);
      setSnackbar({ open: true, message: 'Quantities updated successfully!', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleOpenJoinModal = () => {
    const initialQuantities = {};
    groupOrder.products.forEach(p => {
      initialQuantities[p.productId] = 0;
    });
    setJoinQuantities(initialQuantities);
    setIsJoinModalOpen(true);
  };

  const handleJoinQuantityChange = (productId, change) => {
    setJoinQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }));
  };

  const handleJoin = async () => {
    try {
      const items = Object.entries(joinQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = groupOrder.products.find(p => p.productId === productId);
          return { productId, quantity, price: product.basePrice };
        });

      if (items.length === 0) {
        setSnackbar({ open: true, message: 'Please select at least one item to join.', severity: 'error' });
        return;
      }

      await joinGroupOrder(groupOrderId, items);
      setError(null);
      setSnackbar({ open: true, message: 'Successfully joined the group order!', severity: 'success' });
      setIsJoinModalOpen(false);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroupOrder(groupOrderId);
      navigate('/vendor/group-orders');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async () => {
    try {
      await closeGroupOrder(groupOrderId);
      setConfirmDialog({ open: false, action: null });
      setSnackbar({ open: true, message: 'Group order closed successfully! Individual orders have been created.', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelGroupOrder(groupOrderId);
      setConfirmDialog({ open: false, action: null });
       setSnackbar({ open: true, message: 'Group order cancelled', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDisputeSubmit = async (details) => {
    try {
      await createDispute(groupOrderId, details, user.uid);
      setSnackbar({ open: true, message: 'Dispute submitted successfully!', severity: 'success' });
      setDisputeFormOpen(false);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const getTimeRemaining = () => {
    if (!groupOrder?.deadline) return 'No deadline set';
    const deadline = groupOrder.deadline.toDate ? groupOrder.deadline.toDate() : new Date(groupOrder.deadline);
    const now = new Date();
    
    if (deadline < now) return 'Expired';
    
    const hours = Math.floor((deadline - now) / (1000 * 60 * 60));
    const minutes = Math.floor((deadline - now) / (1000 * 60) % 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const calculateProductProgress = (product) => {
    if (!product.targetQuantity || product.targetQuantity === 0) return 0;
    return Math.min(100, (product.currentQuantity / product.targetQuantity) * 100);
  };

  const calculateTotalSavings = () => {
    if (!groupOrder?.products) return 0;
    
    return groupOrder.products.reduce((total, product) => {
      const savings = product.currentQuantity * product.basePrice * (product.currentDiscount / 100);
      return total + savings;
    }, 0);
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/vendor/group-orders/${groupOrderId}`;
    navigator.clipboard.writeText(link);
    setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
  };

  const toggleProductExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getMemberProgress = () => {
    if (!groupOrder) return { active: 0, total: 0 };
    const activeMembers = groupOrder.products.reduce((acc, product) => {
      const contributors = Object.keys(product.memberContributions).filter(id => 
        product.memberContributions[id] > 0
      );
      return new Set([...acc, ...contributors]);
    }, new Set());
    return { active: activeMembers.size, total: groupOrder.memberIDs.length };
  };

  if (loading) return <LoadingSpinner />;

  if (!groupOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Group order not found
        </div>
        <button 
          onClick={() => navigate('/vendor/group-orders')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          ← Back to Group Orders
        </button>
      </div>
    );
  }

  const isMember = groupOrder.memberIDs.includes(user?.uid);
  const isLeader = groupOrder.leaderID === user?.uid;
  const isOpen = groupOrder.status === 'open';
  const canEdit = isMember && isOpen;


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button 
          onClick={() => navigate('/vendor/dashboard')}
          className="hover:text-blue-600 transition-colors"
        >
          Dashboard
        </button>
        <span>/</span>
        <button 
          onClick={() => navigate(-1)}
          className="hover:text-blue-600 transition-colors"
        >
          Group Orders
        </button>
        <span>/</span>
        <span className="text-gray-900">{groupOrder.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{groupOrder.title}</h1>
            {groupOrder.description && (
              <p className="text-gray-600 mt-1">
                {groupOrder.description}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            groupOrder.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {groupOrder.status === 'open' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {groupOrder.status.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShareDialog(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Share group order"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          {!isMember && isOpen && (
            <button 
              onClick={handleOpenJoinModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Join Group & Split Cost
            </button>
          )}
          {isMember && !isLeader && isOpen && (
            <button 
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <UserMinus className="w-4 h-4" />
              Leave Group
            </button>
          )}
          {isMember && !isOpen && (
            <button 
              onClick={() => setDisputeFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
            >
              <Info className="w-4 h-4" />
              Dispute
            </button>
          )}
            <>
              <button 
                onClick={() => setConfirmDialog({ open: true, action: 'close' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Finalize Order
              </button>
              <button 
                onClick={() => setConfirmDialog({ open: true, action: 'cancel' })}
                className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 5.652a.5.5 0 00-.706 0L10 9.293 6.354 5.646a.5.5 0 10-.708.708L9.293 10 .646 13.646a.5.5 0 00.708.708L10 10.707l3.646 3.647a.5.5 0 00.708-.708L10.707 10l3.647-3.646a.5.5 0 000-.702z"/></svg>
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-500 w-12 h-12 flex items-center justify-center rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {groupOrder.memberIDs.length}
              </h2>
              <p className="text-gray-600">
                Total Members
              </p>
              <p className="text-green-500">
                {getMemberProgress().active} active
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${getTimeRemaining() === 'Expired' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-500'}`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getTimeRemaining()}
              </h2>
              <p className="text-gray-600">
                Deadline
              </p>
              <p className="text-gray-400">
                {format(groupOrder.deadline.toDate ? groupOrder.deadline.toDate() : new Date(groupOrder.deadline), 'MMM dd, h:mm a')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 text-teal-500 w-12 h-12 flex items-center justify-center rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ${groupOrder.totalValue.toFixed(2)}
              </h2>
              <p className="text-gray-600">
                Total Value
              </p>
              <p className="text-gray-400">
                {groupOrder.products.length} products
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-500 w-12 h-12 flex items-center justify-center rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ${calculateTotalSavings().toFixed(2)}
              </h2>
              <p className="text-gray-600">
                Total Savings
              </p>
              <p className="text-green-500 flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0a10 10 0 110 20A10 10 0 0110 0zm5.293 6.707a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l6-6a1 1 0 000-1.414z"/>
                </svg>
                Great deals!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 relative`}
            >
              Activity
              {activities.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 bg-blue-600 rounded-full">
                  {activities.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1`}
            >
              Members
            </button>
          </nav>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 gap-6">
          {groupOrder.products.map((product) => (
            <div key={product.productId} className={`rounded-lg shadow-md border-l-4 ${
                product.currentQuantity >= product.targetQuantity ? 'border-green-500' : 'border-yellow-500'
              }`}>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <h3 className="text-xl font-bold">{product.productName}</h3>
                    <p className="text-gray-600">${product.basePrice.toFixed(2)} per unit</p>
                    {product.currentDiscount > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                        {product.currentDiscount}% OFF
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-600">Progress to target</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${calculateProductProgress(product)}%` }}
                          className="h-full bg-blue-600"
                        />
                      </div>
                      <span className="text-sm text-gray-700">
                        {product.currentQuantity}/{product.targetQuantity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600">Discount Tiers</p>
                    {product.discountTiers.map((tier, idx) => (
                      <p key={idx} className="text-xs text-gray-800">
                        {tier.minQuantity}+ units: {tier.discountPercentage}% off
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(product.productId, -1)}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-300"
                          disabled={productQuantities[product.productId] === 0}
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <input
                          type="number"
                          value={productQuantities[product.productId] || 0}
                          onChange={(e) =>
                            setProductQuantities((prev) => ({
                              ...prev,
                              [product.productId]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-16 p-1 border rounded text-center"
                          min="0"
                        />
                        <button
                          onClick={() => handleQuantityChange(product.productId, 1)}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-300"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-800">
                        Your qty: {product.memberContributions[user?.uid] || 0}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member contributions - expandable for all members */}
                <div className="mt-4 border-t pt-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleProductExpand(product.productId)}
                  >
                    <p className="text-sm text-gray-600">
                      Member Contributions ({Object.values(product.memberContributions).filter((q) => q > 0).length} members)
                    </p>
                    <button className="p-2">
                      {expandedProducts[product.productId] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expandedProducts[product.productId] && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(product.memberContributions)
                        .filter(([_, qty]) => qty > 0)
                        .map(([memberId, qty]) => {
                          const memberData = groupOrder.members?.find((m) => m.id === memberId);
                          const displayName = memberId === user.uid ? 'You' : memberData?.name || `Member ${memberId.substring(0, 6)}`;
                          return (
                            <span
                              key={memberId}
                              className={`flex items-center gap-2 px-3 py-1 border rounded-full text-xs ${
                                memberId === user.uid ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <span className="bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center">
                                {displayName[0]}
                              </span>
                              {`${displayName}: ${qty} ${product.unit}`}
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {canEdit && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleUpdateQuantities}
                disabled={updateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {updateLoading ? 'Updating...' : 'Update Quantities'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const getActivityIcon = () => {
                switch (activity.type) {
                  case 'created': return (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  );
                  case 'joined': return (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                  );
                  case 'left': return (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <UserMinus className="w-5 h-5 text-red-600" />
                    </div>
                  );
                  case 'updated_quantity': return (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    </div>
                  );
                  case 'closed': return (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  );
                  case 'cancelled': return (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  );
                  default: return (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                  );
                }
              };
              
              return (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0">
                  {getActivityIcon()}
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold">{activity.userName}</span>{' '}
                      {activity.details.message || activity.type}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.timestamp?.toDate ? 
                        format(activity.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : 
                        'Just now'}
                    </p>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No activity yet. Activities will appear here as members join and participate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {groupOrder.memberIDs.map((memberId) => {
              const memberData = groupOrder.members?.find(m => m.id === memberId);
              const totalContribution = groupOrder.products.reduce((total, product) => {
                const qty = product.memberContributions[memberId] || 0;
                const price = product.basePrice * (1 - product.currentDiscount / 100) * qty;
                return total + price;
              }, 0);
              const totalItems = groupOrder.products.reduce((total, product) => {
                return total + (product.memberContributions[memberId] || 0);
              }, 0);
              
              return (
                <div key={memberId} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      memberId === groupOrder.leaderID ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {memberId === user?.uid 
                            ? 'You' 
                            : memberData?.name || `Member ${memberId.substring(0, 6)}`}
                        </p>
                        {memberId === groupOrder.leaderID && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {memberData?.phoneNumber || `ID: ${memberId.substring(0, 8)}...`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {memberData?.joinedAt ? format(memberData.joinedAt.toDate(), 'MMM dd, HH:mm') : 'recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${totalContribution.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {totalItems} items
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Join Group Order Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold">Join Group & Select Items</h3>
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {groupOrder.products.map(product => (
                <div key={product.productId} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-bold">{product.productName}</p>
                    <p className="text-sm text-gray-500">${product.basePrice.toFixed(2)} per {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleJoinQuantityChange(product.productId, -1)}
                      className="p-2 bg-gray-100 rounded hover:bg-gray-300"
                      disabled={(joinQuantities[product.productId] || 0) === 0}
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <input
                      type="number"
                      value={joinQuantities[product.productId] || 0}
                      onChange={(e) =>
                        setJoinQuantities(prev => ({
                          ...prev,
                          [product.productId]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 p-1 border rounded text-center"
                      min="0"
                    />
                    <button
                      onClick={() => handleJoinQuantityChange(product.productId, 1)}
                      className="p-2 bg-gray-100 rounded hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoin}
                className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Confirm & Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold">
              {confirmDialog.action === 'close' ? 'Close Group Order?' : 'Cancel Group Order?'}
            </h3>
            <p className="mt-4 text-gray-600">
              {confirmDialog.action === 'close' 
                ? 'This will finalize the order and create individual orders for each member. This action cannot be undone.'
                : 'This will cancel the group order for all members. This action cannot be undone.'}
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                onClick={() => setConfirmDialog({ open: false, action: null })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.action === 'close' ? handleClose : handleCancel}
                className={`px-4 py-2 rounded text-white ${confirmDialog.action === 'close' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {confirmDialog.action === 'close' ? 'Close Order' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {shareDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold">Share Group Order</h3>
            <p className="mt-2 text-gray-600">
              Share this group order with others to get better bulk discounts!
            </p>
            <div className="mt-4">
              <div className="flex items-center border rounded px-3 py-2">
                <input
                  className="flex-grow outline-none"
                  value={`${window.location.origin}/vendor/group-orders/${groupOrderId}`}
                  readOnly
                />
                <button onClick={handleCopyShareLink} className="ml-2 focus:outline-none group">
                  <Copy className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-3">
              <button 
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Join my group order: ${groupOrder.title}\n${window.location.origin}/vendor/group-orders/${groupOrderId}`)}`);
                }}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  window.location.href = `mailto:?subject=${encodeURIComponent(`Join Group Order: ${groupOrder.title}`)}&body=${encodeURIComponent(`I'm organizing a group order for ${groupOrder.title}. Join us to get bulk discounts!\n\n${window.location.origin}/vendor/group-orders/${groupOrderId}`)}`;
                }}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                title="Share via Email"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  window.location.href = `sms:?body=${encodeURIComponent(`Join my group order: ${groupOrder.title}\n${window.location.origin}/vendor/group-orders/${groupOrderId}`)}`;
                }}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                title="Share via SMS"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShareDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >Close</button>
            </div>
          </div>
        </div>
      )}

      {isDisputeFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <DisputeForm orderId={groupOrderId} onSubmit={handleDisputeSubmit} />
            <button 
              onClick={() => setDisputeFormOpen(false)}
              className="w-full mt-2 text-center text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {snackbar.open && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center items-center z-50">
          <div className={`max-w-sm w-full mx-4 px-4 py-3 rounded shadow-md flex items-center justify-between ${
            snackbar.severity === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`} role="alert">
            <p>{snackbar.message}</p>
            <button 
              onClick={() => setSnackbar({ ...snackbar, open: false })} 
              className={`ml-4 font-bold text-sm ${
                snackbar.severity === 'success' ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOrderDetail;
