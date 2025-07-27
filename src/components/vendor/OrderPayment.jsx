import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  WalletIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../../contexts/WalletContext';
import { orderService } from '../../services/orders';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

const OrderPayment = ({ order, onPaymentSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { wallet, getWalletStats, canMakePayment } = useWallet();

  const walletStats = getWalletStats();
  const canPay = canMakePayment(order.totalAmount);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePayment = async () => {
    if (!canPay) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await orderService.processOrderPayment(order.id, order.vendorId);
      
      if (result.success) {
        showToast('Payment processed successfully!', 'success');
        onPaymentSuccess(result);
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast(error.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Process Payment</h3>
              <p className="text-sm text-gray-600">Order #{order.id?.slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                ₹{order.totalAmount?.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <div className="flex items-center space-x-2">
                <WalletIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Digital Wallet</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Balance:</span>
                <span className={`text-sm font-medium ${canPay ? 'text-green-600' : 'text-red-600'}`}>
                  {walletStats?.formattedAvailableBalance || '₹0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-6">
          {canPay ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Sufficient balance available</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Insufficient wallet balance</span>
            </div>
          )}
        </div>

        {/* Escrow Information */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Secure Escrow Payment</p>
              <p className="text-xs text-blue-700 mt-1">
                Your payment will be held securely in escrow until the supplier confirms delivery. 
                This protects both you and the supplier.
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items:</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {item.productName} x {item.quantity}
                </span>
                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePayment}
            disabled={loading || !canPay}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${order.totalAmount?.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Insufficient Balance Help */}
        {!canPay && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Need more funds?</strong> Top up your wallet to complete this payment.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderPayment;
