import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn()
}));

// Test component to use the context
const TestComponent = () => {
  const { currentUser, userProfile, loading, hasRole } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{currentUser ? currentUser.uid : 'no-user'}</div>
      <div data-testid="profile">{userProfile ? userProfile.name : 'no-profile'}</div>
      <div data-testid="role">{hasRole(['vendor']) ? 'vendor' : 'no-role'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider', () => {
    it('should provide initial loading state', () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        // Don't call callback immediately to test loading state
        return jest.fn(); // unsubscribe function
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('should handle user login and profile loading', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { name: 'Test User', role: 'vendor' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test-user-id');
      expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      expect(screen.getByTestId('role')).toHaveTextContent('vendor');
    });

    it('should handle user logout', async () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(null), 0);
        return jest.fn();
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    });

    it('should handle profile loading errors gracefully', async () => {
      const mockUser = { uid: 'test-user-id' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockRejectedValue(new Error('Profile fetch failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test-user-id');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    });
  });

  describe('hasRole utility', () => {
    const TestRoleComponent = ({ allowedRoles }) => {
      const { hasRole } = useAuth();
      return <div data-testid="has-role">{hasRole(allowedRoles) ? 'true' : 'false'}</div>;
    };

    it('should return true for matching role', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { name: 'Test User', role: 'vendor' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestRoleComponent allowedRoles={['vendor']} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-role')).toHaveTextContent('true');
      });
    });

    it('should return false for non-matching role', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { name: 'Test User', role: 'vendor' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestRoleComponent allowedRoles={['supplier']} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-role')).toHaveTextContent('false');
      });
    });

    it('should return true for multiple allowed roles', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { name: 'Test User', role: 'supplier' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestRoleComponent allowedRoles={['vendor', 'supplier']} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-role')).toHaveTextContent('true');
      });
    });
  });

  describe('Profile completeness', () => {
    const TestProfileComponent = () => {
      const { isProfileComplete } = useAuth();
      return <div data-testid="profile-complete">{isProfileComplete() ? 'true' : 'false'}</div>;
    };

    it('should return true for complete profile', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { 
        name: 'Test User', 
        role: 'vendor', 
        phoneNumber: '+911234567890',
        language: 'en'
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestProfileComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-complete')).toHaveTextContent('true');
      });
    });

    it('should return false for incomplete profile', async () => {
      const mockUser = { uid: 'test-user-id' };
      const mockProfile = { 
        name: 'Test User'
        // Missing required fields
      };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return jest.fn();
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      });

      render(
        <AuthProvider>
          <TestProfileComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-complete')).toHaveTextContent('false');
      });
    });
  });
});
