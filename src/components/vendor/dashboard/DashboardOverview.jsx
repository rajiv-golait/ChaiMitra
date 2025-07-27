import React from 'react';
import { CheckCircle, Search, Package, Users } from 'lucide-react';

const InfoCard = ({ icon, title, children }) => (
  <div className="bg-[#FFF8E7] rounded-xl p-6 border border-[#FFA500]/20">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h4 className="font-semibold text-[#1A1A1A]">{title}</h4>
    </div>
    <p className="text-sm text-[#6B7280]">{children}</p>
  </div>
);

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle size={64} className="mx-auto text-[#28A745] mb-4" />
        <h3 className="font-poppins font-bold text-2xl text-[#1A1A1A] mb-2">
          Ready to Get Started!
        </h3>
        <p className="text-[#6B7280] max-w-2xl mx-auto">
          Your vendor dashboard is set up and ready to go. You can now browse products, manage your orders, and join group buys.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <InfoCard 
          icon={<Search className="text-[#FFA500]" size={24} />}
          title="Browse Products"
        >
          Explore a wide catalog of products from various suppliers.
        </InfoCard>
        
        <InfoCard 
          icon={<Package className="text-[#FF5722]" size={24} />}
          title="Manage Your Orders"
        >
          Keep track of all your individual and group orders in one place.
        </InfoCard>
        
        <InfoCard 
          icon={<Users className="text-[#28A745]" size={24} />}
          title="Join Group Buys"
        >
          Join forces with other vendors to get better prices on bulk purchases.
        </InfoCard>
      </div>
    </div>
  );
};

export default DashboardOverview;

