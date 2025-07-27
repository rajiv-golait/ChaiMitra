import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';
import LanguageSwitcher from '../../common/LanguageSwitcher';

const Header = ({ onLogout }) => {
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="ChaiMitra Logo" className="h-8 w-8"/>
            <h1 className="font-poppins font-bold text-xl text-gray-800">ChaiMitra</h1>
            <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase">
              Supplier
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span className="font-medium">{userProfile?.name || 'User'}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
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

export default Header;

