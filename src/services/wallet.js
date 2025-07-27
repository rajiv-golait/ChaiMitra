import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  WALLET_STATUS, 
  TRANSACTION_TYPES, 
  TRANSACTION_STATUS, 
  ESCROW_STATUS,
  PAYMENT_METHODS 
} from '../utils/constants';

/**
 * Wallet Service
 * Handles all wallet-related operations including balance management,
 * transactions, escrow operations, and payment simulations
 */

// Initialize wallet for a user
export const initializeWallet = async (userId, userType = 'vendor') => {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      const initialWalletData = {
        userId,
        userType,
        balance: 0,
        escrowBalance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        status: WALLET_STATUS.ACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Metadata
        currency: 'INR',
        lastTransactionAt: null,
        transactionCount: 0
      };
      
      await setDoc(walletRef, initialWalletData);
      console.log('Wallet initialized for user:', userId);
      return initialWalletData;
    }
    
    return walletDoc.data();
  } catch (error) {
    console.error('Error initializing wallet:', error);
    throw error;
  }
};

// Get wallet details
export const getWallet = async (userId) => {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      // Initialize wallet if it doesn't exist
      return await initializeWallet(userId);
    }
    
    return walletDoc.data();
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
};

// Simulate wallet top-up (deposit)
export const simulateTopUp = async (userId, amount, paymentMethod = PAYMENT_METHODS.SIMULATED_UPI) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }
      
      const walletData = walletDoc.data();
      const newBalance = walletData.balance + amount;
      
      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        totalEarnings: walletData.totalEarnings + amount,
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: walletData.transactionCount + 1
      });
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
        id: transactionRef.id,
        userId,
        type: TRANSACTION_TYPES.DEPOSIT,
        amount,
        balanceBefore: walletData.balance,
        balanceAfter: newBalance,
        status: TRANSACTION_STATUS.COMPLETED,
        paymentMethod,
        description: `Wallet top-up via ${paymentMethod}`,
        metadata: {
          simulatedPayment: true,
          paymentReference: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(transactionRef, transactionData);
      
      return {
        transaction: transactionData,
        newBalance,
        success: true
      };
    });
  } catch (error) {
    console.error('Error simulating top-up:', error);
    throw error;
  }
};

// Hold funds in escrow for an order
export const holdFundsInEscrow = async (userId, orderId, amount, description = 'Order payment') => {
  try {
    return await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }
      
      const walletData = walletDoc.data();
      
      if (walletData.balance < amount) {
        throw new Error('Insufficient funds');
      }
      
      const newBalance = walletData.balance - amount;
      const newEscrowBalance = walletData.escrowBalance + amount;
      
      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        escrowBalance: newEscrowBalance,
        totalSpent: walletData.totalSpent + amount,
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: walletData.transactionCount + 1
      });
      
      // Create escrow record
      const escrowRef = doc(collection(db, 'escrow'));
      const escrowData = {
        id: escrowRef.id,
        userId,
        orderId,
        amount,
        status: ESCROW_STATUS.HELD,
        description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        releaseConditions: {
          requiresDeliveryConfirmation: true,
          autoReleaseAfterDays: 7
        }
      };
      
      transaction.set(escrowRef, escrowData);
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
        id: transactionRef.id,
        userId,
        type: TRANSACTION_TYPES.ESCROW_HOLD,
        amount,
        balanceBefore: walletData.balance,
        balanceAfter: newBalance,
        status: TRANSACTION_STATUS.COMPLETED,
        description,
        relatedEntityId: orderId,
        relatedEntityType: 'order',
        escrowId: escrowRef.id,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(transactionRef, transactionData);
      
      return {
        escrow: escrowData,
        transaction: transactionData,
        newBalance,
        newEscrowBalance,
        success: true
      };
    });
  } catch (error) {
    console.error('Error holding funds in escrow:', error);
    throw error;
  }
};

// Release funds from escrow
export const releaseFundsFromEscrow = async (escrowId, recipientUserId) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const escrowRef = doc(db, 'escrow', escrowId);
      const escrowDoc = await transaction.get(escrowRef);
      
      if (!escrowDoc.exists()) {
        throw new Error('Escrow record not found');
      }
      
      const escrowData = escrowDoc.data();
      
      if (escrowData.status !== ESCROW_STATUS.HELD) {
        throw new Error('Escrow funds are not available for release');
      }
      
      // Update escrow status
      transaction.update(escrowRef, {
        status: ESCROW_STATUS.RELEASED,
        releasedAt: serverTimestamp(),
        releasedToUserId: recipientUserId,
        updatedAt: serverTimestamp()
      });
      
      // Update buyer's wallet (reduce escrow balance)
      const buyerWalletRef = doc(db, 'wallets', escrowData.userId);
      const buyerWalletDoc = await transaction.get(buyerWalletRef);
      const buyerWalletData = buyerWalletDoc.data();
      
      transaction.update(buyerWalletRef, {
        escrowBalance: buyerWalletData.escrowBalance - escrowData.amount,
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: buyerWalletData.transactionCount + 1
      });
      
      // Update recipient's wallet (increase balance)
      const recipientWalletRef = doc(db, 'wallets', recipientUserId);
      const recipientWalletDoc = await transaction.get(recipientWalletRef);
      
      let recipientWalletData;
      if (!recipientWalletDoc.exists()) {
        // Initialize recipient wallet if it doesn't exist
        recipientWalletData = {
          userId: recipientUserId,
          userType: 'supplier',
          balance: 0,
          escrowBalance: 0,
          totalEarnings: 0,
          totalSpent: 0,
          status: WALLET_STATUS.ACTIVE,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          currency: 'INR',
          lastTransactionAt: null,
          transactionCount: 0
        };
        transaction.set(recipientWalletRef, recipientWalletData);
      } else {
        recipientWalletData = recipientWalletDoc.data();
      }
      
      const newRecipientBalance = recipientWalletData.balance + escrowData.amount;
      
      transaction.update(recipientWalletRef, {
        balance: newRecipientBalance,
        totalEarnings: recipientWalletData.totalEarnings + escrowData.amount,
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: recipientWalletData.transactionCount + 1
      });
      
      // Create transaction records
      const buyerTransactionRef = doc(collection(db, 'transactions'));
      const buyerTransactionData = {
        id: buyerTransactionRef.id,
        userId: escrowData.userId,
        type: TRANSACTION_TYPES.ESCROW_RELEASE,
        amount: -escrowData.amount, // Negative because it's leaving escrow
        balanceBefore: buyerWalletData.balance,
        balanceAfter: buyerWalletData.balance, // Balance doesn't change, only escrow
        status: TRANSACTION_STATUS.COMPLETED,
        description: `Escrow funds released for order`,
        relatedEntityId: escrowData.orderId,
        relatedEntityType: 'order',
        escrowId: escrowId,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(buyerTransactionRef, buyerTransactionData);
      
      const recipientTransactionRef = doc(collection(db, 'transactions'));
      const recipientTransactionData = {
        id: recipientTransactionRef.id,
        userId: recipientUserId,
        type: TRANSACTION_TYPES.ESCROW_RELEASE,
        amount: escrowData.amount,
        balanceBefore: recipientWalletData.balance,
        balanceAfter: newRecipientBalance,
        status: TRANSACTION_STATUS.COMPLETED,
        description: `Payment received from escrow`,
        relatedEntityId: escrowData.orderId,
        relatedEntityType: 'order',
        escrowId: escrowId,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(recipientTransactionRef, recipientTransactionData);
      
      return {
        escrow: { ...escrowData, status: ESCROW_STATUS.RELEASED },
        buyerTransaction: buyerTransactionData,
        recipientTransaction: recipientTransactionData,
        success: true
      };
    });
  } catch (error) {
    console.error('Error releasing funds from escrow:', error);
    throw error;
  }
};

// Refund escrow funds
export const refundEscrowFunds = async (escrowId, reason = 'Order cancelled') => {
  try {
    return await runTransaction(db, async (transaction) => {
      const escrowRef = doc(db, 'escrow', escrowId);
      const escrowDoc = await transaction.get(escrowRef);
      
      if (!escrowDoc.exists()) {
        throw new Error('Escrow record not found');
      }
      
      const escrowData = escrowDoc.data();
      
      if (escrowData.status !== ESCROW_STATUS.HELD) {
        throw new Error('Escrow funds are not available for refund');
      }
      
      // Update escrow status
      transaction.update(escrowRef, {
        status: ESCROW_STATUS.REFUNDED,
        refundedAt: serverTimestamp(),
        refundReason: reason,
        updatedAt: serverTimestamp()
      });
      
      // Update user's wallet (move from escrow back to balance)
      const walletRef = doc(db, 'wallets', escrowData.userId);
      const walletDoc = await transaction.get(walletRef);
      const walletData = walletDoc.data();
      
      const newBalance = walletData.balance + escrowData.amount;
      const newEscrowBalance = walletData.escrowBalance - escrowData.amount;
      
      transaction.update(walletRef, {
        balance: newBalance,
        escrowBalance: newEscrowBalance,
        totalSpent: walletData.totalSpent - escrowData.amount, // Reverse the spent amount
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: walletData.transactionCount + 1
      });
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
        id: transactionRef.id,
        userId: escrowData.userId,
        type: TRANSACTION_TYPES.REFUND,
        amount: escrowData.amount,
        balanceBefore: walletData.balance,
        balanceAfter: newBalance,
        status: TRANSACTION_STATUS.COMPLETED,
        description: `Refund: ${reason}`,
        relatedEntityId: escrowData.orderId,
        relatedEntityType: 'order',
        escrowId: escrowId,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(transactionRef, transactionData);
      
      return {
        escrow: { ...escrowData, status: ESCROW_STATUS.REFUNDED },
        transaction: transactionData,
        newBalance,
        newEscrowBalance,
        success: true
      };
    });
  } catch (error) {
    console.error('Error refunding escrow funds:', error);
    throw error;
  }
};

// Get user's transaction history
export const getTransactionHistory = async (userId, limitCount = 50) => {
  try {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(transactionsQuery);
    let transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort manually by creation date, descending
    transactions.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });

    // Manually limit the results
    if (limitCount) {
      transactions = transactions.slice(0, limitCount);
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

// Get user's escrow records
export const getEscrowRecords = async (userId) => {
  try {
    const escrowQuery = query(
      collection(db, 'escrow'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(escrowQuery);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort manually by creation date, descending
    records.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching escrow records:', error);
    throw error;
  }
};

// Simulate withdrawal (for testing purposes)
export const simulateWithdrawal = async (userId, amount, paymentMethod = PAYMENT_METHODS.SIMULATED_BANK) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }
      
      const walletData = walletDoc.data();
      
      if (walletData.balance < amount) {
        throw new Error('Insufficient funds');
      }
      
      const newBalance = walletData.balance - amount;
      
      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
        lastTransactionAt: serverTimestamp(),
        transactionCount: walletData.transactionCount + 1
      });
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
        id: transactionRef.id,
        userId,
        type: TRANSACTION_TYPES.WITHDRAWAL,
        amount: -amount, // Negative for withdrawal
        balanceBefore: walletData.balance,
        balanceAfter: newBalance,
        status: TRANSACTION_STATUS.COMPLETED,
        paymentMethod,
        description: `Wallet withdrawal via ${paymentMethod}`,
        metadata: {
          simulatedPayment: true,
          withdrawalReference: `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp()
      };
      
      transaction.set(transactionRef, transactionData);
      
      return {
        transaction: transactionData,
        newBalance,
        success: true
      };
    });
  } catch (error) {
    console.error('Error simulating withdrawal:', error);
    throw error;
  }
};
