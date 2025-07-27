import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * RoleBasedRouter - Centralized component for handling role-based navigation
 * Automatically redirects users to their appropriate dashboard based on their role
 */
const RoleBasedRouter = () => {
  const { currentUser, userProfile, loading, isAuthReady } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center">
        <div className="text-center">
          <img 
            src={process.env.PUBLIC_URL + '/logo192.png'} 
            alt="HawkerHub Logo" 
            className="w-16 h-16 mx-auto mb-4" 
          />
          <LoadingSpinner size="large" />
          <p className="mt-4 text-[#6B7280] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but no profile (shouldn't happen with current flow, but safety check)
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on user role
  const dashboardPath = `/${userProfile.role}/dashboard`;
  
  return <Navigate to={dashboardPath} replace />;
};

export default RoleBasedRouter;
