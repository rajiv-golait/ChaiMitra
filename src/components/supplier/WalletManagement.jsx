import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const WalletManagement = () => {
const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingPayments: 0,
    totalEarnings: 0,
    transactions: []
  });

  useEffect(() => {
    // Simulate loading wallet data
    const loadWalletData = async () => {
      setLoading(true);
      setError(null);
      // This would normally fetch from Firebase/API
      try {
        setTimeout(() => {
          setWalletData({
            balance: 12500.75,
            pendingPayments: 2300.50,
            totalEarnings: 45000.25,
            transactions: [
              {
                id: '1',
                type: 'credit',
                amount: 1500.00,
                description: 'Order payment from Rajesh Store',
                date: new Date('2025-01-25'),
                status: 'completed'
              },
              {
                id: '2',
                type: 'debit',
                amount: 200.00,
                description: 'Platform fee',
                date: new Date('2025-01-24'),
                status: 'completed'
              },
              {
                id: '3',
                type: 'credit',
                amount: 2300.50,
                description: 'Order payment from Kumar Vegetables',
                date: new Date('2025-01-23'),
                status: 'pending'
              }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load wallet data. Please try again.');
        setLoading(false);
      }
    };

    if (currentUser) {
      loadWalletData();
    }
  }, [currentUser]);

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('supplier.wallet')}</h2>
      </div>

      {/* Wallet Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(walletData.balance)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(walletData.pendingPayments)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(walletData.totalEarnings)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {walletData.transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'credit' ? (
                    <ArrowUpRight size={16} className="text-green-600" />
                  ) : (
                    <ArrowDownLeft size={16} className="text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {walletData.transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No transactions yet.</p>
            <p className="text-sm">When you receive payments or make transactions, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletManagement;

