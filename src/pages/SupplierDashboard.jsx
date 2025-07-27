import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, History, Wallet, Bell, Star, Settings as SettingsIcon, Truck, Tag, Users } from 'lucide-react';

import Header from '../components/supplier/dashboard/Header';
import WelcomeBanner from '../components/supplier/dashboard/WelcomeBanner';
import OnboardingChecklist from '../components/common/OnboardingChecklist';
import TabNavigation from '../components/supplier/dashboard/TabNavigation';
import DashboardOverview from '../components/supplier/dashboard/DashboardOverview';

import ProductList from '../components/supplier/ProductList';
import Settings from '../components/supplier/Settings';
import SupplierReviews from '../components/supplier/SupplierReviews';
import OrderManagement from '../components/supplier/OrderManagement';
import WalletManagement from '../components/supplier/WalletManagement';
import NotificationCenter from '../components/supplier/NotificationCenter';
import SupplierDeals from '../components/supplier/SupplierDeals';
import SupplierGroupOrders from '../components/supplier/SupplierGroupOrders';

import { useTranslation } from '../hooks/useTranslation';

const SupplierDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const TABS = [
    { id: 'overview', label: t('supplier.overview'), icon: <Truck size={18} /> },
    { id: 'products', label: t('supplier.myProducts'), icon: <LayoutGrid size={18} /> },
    { id: 'orders', label: t('supplier.orderManagement'), icon: <History size={18} /> },
    { id: 'wallet', label: t('supplier.wallet'), icon: <Wallet size={18} /> },
    { id: 'notifications', label: t('supplier.notifications'), icon: <Bell size={18} /> },
    { id: 'reviews', label: t('supplier.reviews'), icon: <Star size={18} /> },
    { id: 'deals', label: 'Deals', icon: <Tag size={18} /> },
    { id: 'group-orders', label: 'Group Orders', icon: <Users size={18} /> },
    { id: 'settings', label: t('supplier.settings'), icon: <SettingsIcon size={18} /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <div className="p-8"><DashboardOverview /></div>;
      case 'products': return <ProductList />;
      case 'orders': return <OrderManagement />;
      case 'wallet': return <WalletManagement />;
      case 'notifications': return <NotificationCenter />;
      case 'reviews': return <SupplierReviews />;
      case 'deals': return <SupplierDeals />;
      case 'group-orders': return <SupplierGroupOrders />;
      case 'settings': return <Settings />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<WelcomeBanner />
        <OnboardingChecklist />
        
        <div className="mt-8">
          <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;
