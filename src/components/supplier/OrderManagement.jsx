import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orders';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

const OrderManagement = () => {
const { currentUser, isAuthReady } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!isAuthReady) return; // Wait for auth to be ready

    const fetchOrders = async () => {
      if (!currentUser) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await orderService.getSupplierOrders(currentUser.uid);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(t('errors.fetchOrdersFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
}, [currentUser, isAuthReady, t]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(t('errors.updateStatusFailed'));
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('supplier.orders')}</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">{t('orders.allOrders')}</option>
          {ORDER_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {t(`orders.status.${status.value}`)}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {filter === 'all' 
              ? t('supplier.noOrders') 
              : t('supplier.noOrdersFiltered')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {t('orders.orderId')}: #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${getStatusColor(order.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${getStatusColor(order.status) === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                    ${getStatusColor(order.status) === 'green' ? 'bg-green-100 text-green-800' : ''}
                    ${getStatusColor(order.status) === 'red' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {t(`orders.status.${order.status}`)}
                  </span>
                  
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updating[order.id]}
                    className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {t(`orders.status.${status.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{t('orders.vendor')}:</span>
                  <span className="font-medium text-gray-800">{order.vendorName}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">{t('orders.contact')}:</span>
                  <span className="font-medium text-gray-800">{order.vendorPhone}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">{t('orders.items')}:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-800">
                        {item.productName} ({item.quantity} {item.unit})
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{t('orders.total')}:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
