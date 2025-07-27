import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Package, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Toast from '../common/Toast';

const SupplierGroupOrders = () => {
  const { user } = useAuth();
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchGroupOrders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const ordersRef = collection(db, 'groupOrders');
      const ordersSnapshot = await getDocs(ordersRef);

      const supplierOrders = [];

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        const supplierProducts = orderData.products?.filter(product =>
          product.supplierId === user.uid
        ) || [];

        if (supplierProducts.length > 0) {
          supplierOrders.push({
            id: orderDoc.id,
            ...orderData,
            supplierProducts,
            totalSupplierValue: supplierProducts.reduce((sum, product) =>
              sum + (product.currentQuantity * product.price), 0
            )
          });
        }
      }

      setGroupOrders(supplierOrders);
    } catch (err) {
      console.error('Error fetching group orders:', err);
      setError('Failed to fetch group orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroupOrders();
  }, [fetchGroupOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'groupOrders', orderId);
      await updateDoc(orderRef, {
        'supplierStatus': newStatus,
        'lastUpdated': new Date()
      });
      
      setToast({ show: true, message: `Order ${newStatus} successfully!`, type: 'success' });
      fetchGroupOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setToast({ show: true, message: 'Failed to update order status', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'fulfilled': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredOrders = groupOrders.filter(order => {
    const status = order.supplierStatus || 'pending';
    if (activeTab === 'all') return true;
    return status === activeTab;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Group Orders</h2>
        <p className="text-gray-600 mt-1">View and manage group orders containing your products</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-semibold">{groupOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-semibold">
                {groupOrders.filter(o => !o.supplierStatus || o.supplierStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-xl font-semibold">
                {groupOrders.filter(o => o.supplierStatus === 'accepted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold">
                ₹{groupOrders.reduce((sum, o) => sum + o.totalSupplierValue, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'accepted', 'rejected', 'fulfilled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No {activeTab !== 'all' ? activeTab : ''} group orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const status = order.supplierStatus || 'pending';
            const statusClass = getStatusColor(status);
            
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{order.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Organized by: {order.organizerName || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.memberIDs?.length || 0} participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.supplierProducts.length} of your products
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Deadline: {order.deadline ? new Date(order.deadline.toDate()).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Your Products in this Order:</h4>
                  <div className="space-y-2">
                    {order.supplierProducts.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{product.name}</span>
                        <div>
                          <span className="text-gray-500">{product.currentQuantity} units × </span>
                          <span className="font-medium">₹{product.price}</span>
                          <span className="ml-2 font-semibold">= ₹{(product.currentQuantity * product.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Value:</span>
                    <span className="text-lg font-semibold text-green-600">₹{order.totalSupplierValue.toFixed(2)}</span>
                  </div>
                </div>

                {status === 'pending' && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject Order
                    </button>
                  </div>
                )}

                {status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'fulfilled')}
                    className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Mark as Fulfilled
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierGroupOrders;
