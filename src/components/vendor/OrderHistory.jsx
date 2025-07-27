import React, { useState } from 'react';
import useOrders from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import Toast from '../common/Toast';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency } from '../../utils/helpers';

const OrderHistory = () => {
  const { t } = useTranslation();
  const { orders, loading, error, cancelOrder, clearError } = useOrders();
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [toast, setToast] = useState(null);

  // Check if order can be cancelled
  const canCancelOrder = (order) => {
    return order.status === 'pending';
  };

  // Handle cancel order click
  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  // Confirm cancellation
  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrder(orderToCancel.id);
      await cancelOrder(orderToCancel.id);
      
      setToast({
        type: 'success',
        message: t('orders.cancelledSuccessfully')
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      setToast({
        type: 'error',
        message: error.message || t('errors.cancelOrderFailed')
      });
    } finally {
      setCancellingOrder(null);
      setShowCancelDialog(false);
      setOrderToCancel(null);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('vendor.orderHistory')}</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ErrorMessage message={error} />
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium
                      hover:bg-red-700 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('vendor.noOrdersYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {t(`orderStatus.${order.status}`)}
                </span>
              </div>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">{t('cart.total')}:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelClick(order)}
                      disabled={cancellingOrder === order.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium
                                hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                                transition-colors flex items-center gap-2"
                    >
                      {cancellingOrder === order.id ? (
                        <>
                          <LoadingSpinner size="small" />
                          {t('orders.cancelling')}
                        </>
                      ) : (
                        <>
                          <span>❌</span>
                          {t('orders.cancelOrder')}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showCancelDialog && (
        <ConfirmDialog
          isOpen={showCancelDialog}
          title={t('orders.cancelOrderTitle')}
          message={t('orders.cancelOrderMessage', { orderId: orderToCancel?.id.slice(-6) })}
          confirmText={t('orders.cancelOrder')}
          cancelText={t('common.cancel')}
          onConfirm={handleCancelConfirm}
          onCancel={() => {
            setShowCancelDialog(false);
            setOrderToCancel(null);
          }}
          isDangerous={true}
        />
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OrderHistory;
