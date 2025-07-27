import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import NetworkStatus from './components/common/NetworkStatus';
import ProtectedRoute from './components/layout/ProtectedRoute';
import NotificationPermission from './components/NotificationPermission';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import VendorDashboard from './pages/VendorDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DealsPage from './pages/DealsPage';
import GroupOrderDetail from './pages/GroupOrderDetail';
import ProfileSetup from './pages/ProfileSetup';
// Trigger build
// Keep TestPage for debugging if needed
function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>App with Router - Testing</h1>
      <p>If this doesn't reload, the issue is in one of the contexts or pages.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavFooter = ['/', '/supplier/dashboard', '/vendor/dashboard', '/login'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route 
          path="/vendor/dashboard"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/supplier/dashboard"
          element={
            <ProtectedRoute requiredRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/deals" 
          element={
            <ProtectedRoute requiredRole="vendor">
              <DealsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group-orders/:id" 
          element={
            <ProtectedRoute requiredRole="vendor">
              <GroupOrderDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!hideNavFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WalletProvider>
          <CartProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <NetworkStatus />
                <NotificationPermission />
                <Router>
                  <AppContent />
                </Router>
              </ErrorBoundary>
            </NotificationProvider>
          </CartProvider>
        </WalletProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;