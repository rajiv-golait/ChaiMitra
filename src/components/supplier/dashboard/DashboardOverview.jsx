import React from 'react';
import { CheckCircle, LayoutGrid, History, Truck } from 'lucide-react';
import InfoCard from './InfoCard';
import { useTranslation } from '../../../hooks/useTranslation';

const DashboardOverview = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h3 className="font-poppins font-bold text-2xl text-gray-800 mb-2">
          {t('supplier.dashboardReadyTitle')}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('supplier.dashboardReadyDesc')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <InfoCard 
          icon={<LayoutGrid className="text-green-500" size={24} />}
          title={t('supplier.productManagement')}
        >
          {t('supplier.productManagementDesc')}
        </InfoCard>
        
        <InfoCard 
          icon={<History className="text-green-500" size={24} />}
          title={t('supplier.orderFulfillmentTitle')}
        >
          {t('supplier.orderFulfillmentDesc')}
        </InfoCard>
        
        <InfoCard 
          icon={<Truck className="text-green-500" size={24} />}
          title={t('supplier.supplyChainTitle')}
        >
          {t('supplier.supplyChainDesc')}
        </InfoCard>
      </div>
    </div>
  );
};

export default DashboardOverview;

