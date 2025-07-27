export const ROLES = {
  VENDOR: 'vendor',
  SUPPLIER: 'supplier'
};

export const LANGUAGES = {
  en: { code: 'en', name: 'English', dir: 'ltr' },
  hi: { code: 'hi', name: 'हिंदी', dir: 'ltr' },
  mr: { code: 'mr', name: 'मराठी', dir: 'ltr' }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_OTP: 'Invalid OTP. Please try again.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  AUTH_FAILED: 'Authentication failed. Please try again.'
};

export const WALLET_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification'
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  ESCROW_HOLD: 'escrow_hold',
  ESCROW_RELEASE: 'escrow_release',
  REFUND: 'refund',
  FEE: 'fee'
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export const ESCROW_STATUS = {
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed'
};

export const PAYMENT_METHODS = {
  SIMULATED_BANK: 'simulated_bank',
  SIMULATED_UPI: 'simulated_upi',
  SIMULATED_CARD: 'simulated_card'
};
