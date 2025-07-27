import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/orders';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

const OrderActions = ({ order, onOrderUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmDelivery = async () => {
    if (window.confirm('Are you sure you want to confirm delivery? This will release the payment to your account.')) {
      try {
        setLoading(true);
        const result = await orderService.confirmDelivery(order.id, order.supplierId);
        
        if (result.success) {
          showToast('Delivery confirmed! Payment released to your account.', 'success');
          onOrderUpdate();
        }
      } catch (error) {
        console.error('Delivery confirmation error:', error);
        showToast(error.message || 'Failed to confirm delivery', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefund = async (reason) => {
    try {
      setLoading(true);
      const result = await orderService.refundOrder(order.id, reason);
      
      if (result.success) {
        showToast('Order refunded successfully!', 'success');
        onOrderUpdate();
        setShowRefundModal(false);
      }
    } catch (error) {
      console.error('Refund error:', error);
      showToast(error.message || 'Failed to process refund', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Payment Pending' },
      paid: { color: 'bg-blue-100 text-blue-800', text: 'Paid (In Escrow)' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Payment Completed' },
      refunded: { color: 'bg-orange-100 text-orange-800', text: 'Refunded' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Order Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.id?.slice(-8)}
          </h3>
          <p className="text-sm text-gray-600">
            From: {order.vendorName} • {order.vendorPhone}
          </p>
        </div>
        <div className="flex space-x-2">
          {getOrderStatusBadge(order.status)}
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items:</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} × ₹{item.price}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-lg font-bold text-blue-600">
              ₹{order.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {order.paymentStatus === 'paid' && (
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Payment Secured in Escrow</p>
              <p className="text-xs text-blue-700 mt-1">
                The customer has paid ₹{order.totalAmount?.toFixed(2)}. Funds are held securely 
                and will be released to your account once you confirm delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {/* Confirm Delivery Button */}
        {order.status === 'processing' && order.paymentStatus === 'paid' && (
          <button
            onClick={handleConfirmDelivery}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              <>
                <TruckIcon className="h-4 w-4 mr-2" />
                Confirm Delivery
              </>
            )}
          </button>
        )}

        {/* Refund Button */}
        {(order.status === 'processing' || order.status === 'pending') && 
         order.paymentStatus === 'paid' && (
          <button
            onClick={() => setShowRefundModal(true)}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Issue Refund
          </button>
        )}

        {/* Status Messages */}
        {order.status === 'delivered' && (
          <div className="flex-1 flex items-center justify-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Order Delivered</span>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="flex-1 flex items-center justify-center text-red-600">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Order Cancelled</span>
          </div>
        )}

        {order.status === 'pending' && order.paymentStatus === 'pending' && (
          <div className="flex-1 flex items-center justify-center text-yellow-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Awaiting Payment</span>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundModal
          order={order}
          onRefund={handleRefund}
          onClose={() => setShowRefundModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

// Refund Modal Component
const RefundModal = ({ order, onRefund, onClose, loading }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const commonReasons = [
    'Product unavailable',
    'Quality issues',
    'Delivery delay',
    'Customer request',
    'Supplier error',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const refundReason = selectedReason === 'Other' ? reason : selectedReason;
    if (refundReason.trim()) {
      onRefund(refundReason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Issue Refund</h3>
          <div className="flex items-center text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
            <span className="text-sm">₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for refund:
            </label>
            <div className="space-y-2">
              {commonReasons.map((commonReason) => (
                <label key={commonReason} className="flex items-center">
                  <input
                    type="radio"
                    name="refundReason"
                    value={commonReason}
                    checked={selectedReason === commonReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{commonReason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter reason for refund..."
                required
              />
            </div>
          )}

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Refund Process</p>
                <p className="text-xs text-yellow-700 mt-1">
                  The customer will receive ₹{order.totalAmount?.toFixed(2)} back to their wallet. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!selectedReason || (selectedReason === 'Other' && !reason.trim()))}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Issue Refund'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OrderActions;
