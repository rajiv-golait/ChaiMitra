import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { ROLES } from '../utils/constants';

// Create the AuthContext
const AuthContext = createContext({});

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that manages authentication state and user profile
 * Provides authentication context to the entire app
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // This now tracks profile loading
  const [isAuthReady, setIsAuthReady] = useState(false); // New state to track auth readiness
  const [error, setError] = useState(null);

  /**
   * Fetch user profile from Firestore
   * @param {string} userId - The user's UID
   */
  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        return profileData;
      } else {
        // This is normal for new users - they haven't created their profile yet
        console.log('User profile not found - new user needs to complete profile setup');
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      // Permission errors are expected for new users who haven't created their profile yet
      if (error.code === 'permission-denied') {
        console.log('User profile does not exist yet - awaiting profile creation');
        setUserProfile(null);
        return null;
      }
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      return null;
    }
  };

  /**
   * Update user profile in state and database
   * @param {Object} updatedProfile - Updated profile data
   */
  const updateUserProfile = async (updatedProfile) => {
    try {
      if (currentUser && updatedProfile) {
        // Add updatedAt timestamp to the profile update
        const profileWithTimestamp = {
          ...updatedProfile,
          updatedAt: serverTimestamp()
        };
        
        // Update in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, profileWithTimestamp);
        
        // Update local state - merge with existing profile to preserve all fields
        setUserProfile(prevProfile => ({
          ...prevProfile,
          ...updatedProfile
        }));
        
        console.log('User profile updated successfully:', updatedProfile);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
      throw error;
    }
  };

  /**
   * Check if user has required role
   * @param {string|string[]} allowedRoles - Single role or array of allowed roles
   */
  const hasRole = (allowedRoles) => {
    if (!userProfile?.role) return false;
    
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(userProfile.role);
    }
    
    return userProfile.role === allowedRoles;
  };

  /**
   * Get user's preferred language
   */
  const getUserLanguage = () => {
    return userProfile?.language || 'en';
  };

  /**
   * Check if user profile is complete
   */
  const isProfileComplete = () => {
    if (!userProfile) return false;
    
    const requiredFields = ['name', 'role', 'phoneNumber'];
    return requiredFields.every(field => userProfile[field]);
  };

  // Set up Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError(null);
        
        if (user) {
          // User is signed in
          setCurrentUser(user);
          
          // Fetch user profile from Firestore
          await fetchUserProfile(user.uid);
        } else {
          // User is signed out
          setCurrentUser(null);
          setUserProfile(null);
        }

        setIsAuthReady(true); // Signal that auth check is complete
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Context value object
  const value = {
    // User state
    currentUser,
    userProfile,
    loading,
    isAuthReady, // Expose new state
    error,
    
    // User actions
    logout,
    updateUserProfile,
    fetchUserProfile,
    
    // Helper functions
    hasRole,
    getUserLanguage,
    isProfileComplete,
    
    // Role constants for convenience
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
