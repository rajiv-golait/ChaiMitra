import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [], requiredRole = null }) => {
  const { currentUser, userProfile, loading, isAuthReady } = useAuth();

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Handle both legacy allowedRoles array and new requiredRole string
  const rolesAllowed = requiredRole ? [requiredRole] : allowedRoles;
  
  if (rolesAllowed.length > 0 && !rolesAllowed.includes(userProfile.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    return <Navigate to={`/${userProfile.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;