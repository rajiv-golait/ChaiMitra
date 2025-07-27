import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WalletIcon, 
  BanknotesIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../../contexts/WalletContext';

import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Toast from '../common/Toast';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../../utils/constants';

const WalletDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [toast, setToast] = useState(null);

const { 
    transactions, 
    loading, 
    error, 
    operationLoading,
    getWalletStats,
    topUpWallet,
    withdrawFromWallet,
    refreshWalletData,
    clearError
  } = useWallet();


  const walletStats = getWalletStats();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage 
          message={error} 
          onRetry={refreshWalletData}
          onDismiss={clearError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WalletIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Digital Wallet</h1>
              <p className="text-sm text-gray-600">Manage your funds and transactions</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTopUpModal(true)}
              disabled={operationLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Top Up
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={operationLoading || !walletStats?.availableBalance}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusIcon className="h-4 w-4 mr-2" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        {walletStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Balance */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Available Balance</p>
                  <p className="text-3xl font-bold">{walletStats.formattedAvailableBalance}</p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            {/* Escrow Balance */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Escrow</p>
                  <p className="text-3xl font-bold">{walletStats.formattedEscrowBalance}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-200" />
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold">{walletStats.formattedTotalEarnings}</p>
                </div>
                <ArrowUpIcon className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'escrow', label: 'Escrow' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab key="overview" walletStats={walletStats} />
            )}
            {activeTab === 'transactions' && (
              <TransactionsTab key="transactions" transactions={transactions} />
            )}
            {activeTab === 'escrow' && (
              <EscrowTab key="escrow" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onTopUp={async (amount, method) => {
          try {
            await topUpWallet(amount, method);
            setShowTopUpModal(false);
            showToast(`Successfully added ${walletStats?.getFormattedBalance?.(amount) || `₹${amount}`} to your wallet!`);
          } catch (error) {
            showToast(error.message || 'Failed to top up wallet', 'error');
          }
        }}
        loading={operationLoading}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={async (amount, method) => {
          try {
            await withdrawFromWallet(amount, method);
            setShowWithdrawModal(false);
            showToast(`Successfully withdrew ${walletStats?.getFormattedBalance?.(amount) || `₹${amount}`} from your wallet!`);
          } catch (error) {
            showToast(error.message || 'Failed to withdraw from wallet', 'error');
          }
        }}
        loading={operationLoading}
        maxAmount={walletStats?.availableBalance || 0}
      />
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ walletStats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Quick Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Balance</span>
            <span className="font-semibold">{walletStats?.formattedTotalBalance}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Spent</span>
            <span className="font-semibold text-red-600">{walletStats?.formattedTotalSpent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transactions</span>
            <span className="font-semibold">{walletStats?.transactionCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Status</h3>
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="text-green-600 font-medium">Active</span>
        </div>
        <p className="text-sm text-gray-600">
          Your wallet is active and ready for transactions. You can top up, withdraw, and make payments seamlessly.
        </p>
      </div>
    </div>
  </motion.div>
);

// Transactions Tab Component
const TransactionsTab = ({ transactions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
    
    {transactions.length === 0 ? (
      <div className="text-center py-8">
        <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400">Your transaction history will appear here</p>
      </div>
    ) : (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    )}
  </motion.div>
);

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case TRANSACTION_TYPES.DEPOSIT:
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case TRANSACTION_TYPES.WITHDRAWAL:
        return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
      case TRANSACTION_TYPES.ESCROW_HOLD:
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case TRANSACTION_TYPES.ESCROW_RELEASE:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case TRANSACTION_TYPES.REFUND:
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      default:
        return <WalletIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg">
          {getTransactionIcon(transaction.type)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">
            {transaction.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.amount >= 0 ? '+' : ''}{formatAmount(transaction.amount)}
        </p>
        <p className="text-sm text-gray-500">{transaction.status}</p>
      </div>
    </div>
  );
};

// Escrow Tab Component
const EscrowTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-gray-900">Escrow Transactions</h3>
    <div className="text-center py-8">
      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">No escrow transactions</p>
      <p className="text-sm text-gray-400">Funds held in escrow for orders will appear here</p>
    </div>
  </motion.div>
);

// Top Up Modal Component
const TopUpModal = ({ isOpen, onClose, onTopUp, loading }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.SIMULATED_UPI);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onTopUp(numAmount, paymentMethod);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Up Wallet</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={PAYMENT_METHODS.SIMULATED_UPI}>UPI (Simulated)</option>
              <option value={PAYMENT_METHODS.SIMULATED_BANK}>Bank Transfer (Simulated)</option>
              <option value={PAYMENT_METHODS.SIMULATED_CARD}>Card (Simulated)</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Top Up'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Withdraw Modal Component
const WithdrawModal = ({ isOpen, onClose, onWithdraw, loading, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.SIMULATED_BANK);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && numAmount <= maxAmount) {
      onWithdraw(numAmount, paymentMethod);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={maxAmount}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
            <p className="text-sm text-gray-500 mt-1">
              Available: ₹{maxAmount?.toFixed(2) || 0}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={PAYMENT_METHODS.SIMULATED_BANK}>Bank Transfer (Simulated)</option>
              <option value={PAYMENT_METHODS.SIMULATED_UPI}>UPI (Simulated)</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) > maxAmount}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default WalletDashboard;
