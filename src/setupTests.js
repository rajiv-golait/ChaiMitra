// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./services/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithPhoneNumber: jest.fn(),
    signOut: jest.fn()
  },
  db: {},
  RecaptchaVerifier: jest.fn()
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn()
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithPhoneNumber: jest.fn(),
  signOut: jest.fn(),
  RecaptchaVerifier: jest.fn()
}));

// Global test utilities
global.mockFirestoreDoc = (data = {}) => ({
  id: 'mock-id',
  data: () => data,
  exists: () => true
});

global.mockFirestoreQuery = (docs = []) => ({
  empty: docs.length === 0,
  docs,
  forEach: (callback) => docs.forEach(callback)
});
