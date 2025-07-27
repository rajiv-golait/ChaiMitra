import React from 'react';
import { Truck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const WelcomeBanner = () => {
  const { userProfile } = useAuth();

  return (
    <div className="bg-green-600 text-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-poppins font-bold text-3xl flex items-center">
            Welcome, {userProfile?.name || 'Supplier'}! 🚛
            {userProfile?.isVerified && (
              <span className="ml-4 bg-white text-green-600 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </h2>
          <p className="mt-2 opacity-90 text-lg">
            You're logged in as a <span className="font-semibold uppercase">{userProfile?.role}</span>
          </p>
          <p className="mt-1 opacity-80">
            Ready to manage your products and fulfill orders!
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white/20 rounded-full p-4">
            <Truck size={48} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;

