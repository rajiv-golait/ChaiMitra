import React, { useState } from 'react';
import useOrders from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * OrderHistory component displays all orders received by the supplier
 * Allows updating order status through dropdowns
 */
const OrderHistory = () => {
  const { t } = useTranslation();
  const { orders, loading, error, updateOrderStatus } = useOrders();
  const [updatingOrders, setUpdatingOrders] = useState(new Set());

  const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrders(prev => new Set([...prev, orderId]));
    
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrders(prev => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {t('orders.noOrders')}
        </div>
        <p className="text-gray-400">
          {t('orders.noOrdersDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {t('orders.history')} ({orders.length})
      </h2>
      
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border shadow-sm p-6">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {t('orders.orderNumber')}: #{order.id.slice(-8)}
              </h3>
              <p className="text-sm text-gray-600">
                {t('orders.from')}: <span className="font-medium">{order.vendorName || 'Unknown Vendor'}</span>
              </p>
              {order.vendorPhone && (
                <p className="text-sm text-gray-600">
                  {t('orders.phone')}: {order.vendorPhone}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {t(`orders.status.${order.status}`)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t('orders.items')}:
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-gray-500 ml-2">
                      ({item.quantity} {item.unit})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-500">
                      ₹{item.price}/{item.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total and Status Update */}
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <div className="text-lg font-semibold">
              {t('orders.total')}: ₹{order.totalAmount?.toFixed(2) || '0.00'}
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">
                {t('orders.updateStatus')}:
              </label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                disabled={updatingOrders.has(order.id)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {t(`orders.status.${status.value}`)}
                  </option>
                ))}
              </select>
              
              {updatingOrders.has(order.id) && (
                <LoadingSpinner size="small" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
