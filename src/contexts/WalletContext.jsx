import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWallet, 
  initializeWallet, 
  simulateTopUp, 
  simulateWithdrawal,
  getTransactionHistory,
  getEscrowRecords 
} from '../services/wallet';

// Create the WalletContext
const WalletContext = createContext({});

// Custom hook to use the WalletContext
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

/**
 * WalletProvider component that manages wallet state and operations
 * Provides wallet context to the entire app
 */
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [escrowRecords, setEscrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const { currentUser, userProfile } = useAuth();

  /**
   * Initialize or fetch wallet data
   */
  const fetchWalletData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Get wallet details
      const walletData = await getWallet(userId);
      setWallet(walletData);

      // Get transaction history
      const transactionHistory = await getTransactionHistory(userId);
      setTransactions(transactionHistory);

      // Get escrow records
      const escrowData = await getEscrowRecords(userId);
      setEscrowRecords(escrowData);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize wallet for new user
   */
  const initializeUserWallet = async (userId, userType) => {
    try {
      setOperationLoading(true);
      const newWallet = await initializeWallet(userId, userType);
      setWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('Error initializing wallet:', error);
      setError('Failed to initialize wallet');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Top up wallet
   */
  const topUpWallet = async (amount, paymentMethod) => {
    try {
      setOperationLoading(true);
      setError(null);

      const result = await simulateTopUp(currentUser.uid, amount, paymentMethod);
      
      if (result.success) {
        // Update local wallet state
        setWallet(prev => ({
          ...prev,
          balance: result.newBalance,
          totalEarnings: prev.totalEarnings + amount,
          transactionCount: prev.transactionCount + 1,
          updatedAt: new Date()
        }));

        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);

        return result;
      }
    } catch (error) {
      console.error('Error topping up wallet:', error);
      setError(error.message || 'Failed to top up wallet');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Withdraw from wallet
   */
  const withdrawFromWallet = async (amount, paymentMethod) => {
    try {
      setOperationLoading(true);
      setError(null);

      const result = await simulateWithdrawal(currentUser.uid, amount, paymentMethod);
      
      if (result.success) {
        // Update local wallet state
        setWallet(prev => ({
          ...prev,
          balance: result.newBalance,
          transactionCount: prev.transactionCount + 1,
          updatedAt: new Date()
        }));

        // Add transaction to local state
        setTransactions(prev => [result.transaction, ...prev]);

        return result;
      }
    } catch (error) {
      console.error('Error withdrawing from wallet:', error);
      setError(error.message || 'Failed to withdraw from wallet');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Refresh wallet data
   */
  const refreshWalletData = async () => {
    if (currentUser) {
      await fetchWalletData(currentUser.uid);
    }
  };

  /**
   * Get formatted balance
   */
  const getFormattedBalance = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  /**
   * Get wallet stats
   */
  const getWalletStats = () => {
    if (!wallet) return null;

    return {
      availableBalance: wallet.balance || 0,
      escrowBalance: wallet.escrowBalance || 0,
      totalBalance: (wallet.balance || 0) + (wallet.escrowBalance || 0),
      totalEarnings: wallet.totalEarnings || 0,
      totalSpent: wallet.totalSpent || 0,
      transactionCount: wallet.transactionCount || 0,
      formattedAvailableBalance: getFormattedBalance(wallet.balance),
      formattedEscrowBalance: getFormattedBalance(wallet.escrowBalance),
      formattedTotalBalance: getFormattedBalance((wallet.balance || 0) + (wallet.escrowBalance || 0)),
      formattedTotalEarnings: getFormattedBalance(wallet.totalEarnings),
      formattedTotalSpent: getFormattedBalance(wallet.totalSpent)
    };
  };

  /**
   * Check if user can make a payment
   */
  const canMakePayment = (amount) => {
    if (!wallet) return false;
    return wallet.balance >= amount;
  };

  // Initialize wallet when user is authenticated
  useEffect(() => {
    if (currentUser && userProfile) {
      fetchWalletData(currentUser.uid);
    } else {
      // Reset wallet state when user logs out
      setWallet(null);
      setTransactions([]);
      setEscrowRecords([]);
      setLoading(false);
      setError(null);
    }
  }, [currentUser, userProfile]);

  // Context value object
  const value = {
    // Wallet state
    wallet,
    transactions,
    escrowRecords,
    loading,
    error,
    operationLoading,

    // Wallet operations
    initializeUserWallet,
    topUpWallet,
    withdrawFromWallet,
    refreshWalletData,

    // Helper functions
    getFormattedBalance,
    getWalletStats,
    canMakePayment,

    // Clear error
    clearError: () => setError(null)
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
