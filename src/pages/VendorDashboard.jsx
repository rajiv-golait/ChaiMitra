import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, Package, Users, Wallet, Zap, LogOut } from 'lucide-react';
import UserCard from '../components/common/UserCard';
import FlashSale from '../components/vendor/FlashSale';

// Import components
import WalletDashboard from '../components/vendor/WalletDashboard';
import DashboardOverview from '../components/vendor/dashboard/DashboardOverview';
import ProductCatalog from '../components/vendor/ProductCatalog';
import OrderHistory from '../components/vendor/OrderHistory';
import GroupOrderManagementDashboard from '../components/vendor/GroupOrderManagementDashboard';
import OnboardingChecklist from '../components/common/OnboardingChecklist';
import NotificationCenter from '../components/NotificationCenter';

// --- Main Dashboard Component ---
const VendorDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
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
    { id: 'overview', label: 'Dashboard Overview', icon: <Store size={18} /> },
    { id: 'catalog', label: 'Browse Products', icon: <Search size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'group-orders', label: 'Group Orders', icon: <Users size={18} /> },
    { id: 'wallet', label: 'Digital Wallet', icon: <Wallet size={18} /> },
    { id: 'deals', label: 'Deals', icon: <Zap size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8E7] font-sans">
      <Header onLogout={handleLogout} userProfile={userProfile} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBanner name={userProfile?.name} role={userProfile?.role} />
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
              >
                {activeTab === 'overview' && <div className="p-8"><DashboardOverview /></div>}
                {activeTab === 'catalog' && <div className="p-8"><ProductCatalog /></div>}
                {activeTab === 'orders' && <div className="p-8"><OrderHistory /></div>}
                {activeTab === 'wallet' && <WalletDashboard />}
                {activeTab === 'group-orders' && <div className="p-8"><GroupOrderManagementDashboard /></div>}
                {activeTab === 'deals' && <div className="p-8"><FlashSale /></div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components for a Cleaner Structure ---

const Header = ({ onLogout, userProfile }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="ChaiMitra Logo" className="h-8 w-8"/>
            <div className="flex justify-between items-center">
              <h1 className="font-poppins font-bold text-xl text-[#1A1A1A]">ChaiMitra</h1>
              <LanguageSwitcher />
            </div>
            <span className="ml-2 px-2 py-1 bg-[#FFA500] text-[#1A1A1A] text-xs font-bold rounded-full uppercase">
              Vendor
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <UserCard user={userProfile} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#D72638] font-semibold transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const WelcomeBanner = ({ name, role }) => (
  <div className="bg-gradient-to-r from-[#FFA500] via-[#FF8C00] to-[#FF5722] text-white rounded-2xl shadow-lg p-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-poppins font-bold text-3xl">
          Welcome, {name || 'Vendor'}! 👋
        </h2>
        <p className="mt-2 opacity-90 text-lg">
          You're logged in as a <span className="font-semibold uppercase">{role}</span>
        </p>
        <p className="mt-1 opacity-80">
          Ready to browse products and manage your orders!
        </p>
      </div>
      <div className="hidden md:block">
        <div className="bg-white/20 rounded-full p-4">
          <Store size={48} className="text-white" />
        </div>
      </div>
    </div>
  </div>
);


const TabNavigation = ({ tabs, activeTab, setActiveTab }) => (
  <div className="flex items-center gap-2 sm:gap-4 p-1 bg-white rounded-xl shadow-md overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm sm:text-base font-semibold transition-colors duration-200 rounded-lg ${
          activeTab === tab.id 
            ? 'bg-[#1A1A1A] text-white' 
            : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50'
        }`}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);
export default VendorDashboard;
