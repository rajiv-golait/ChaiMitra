import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom Hooks & Components
import { useGroupOrders } from '../../hooks/useGroupOrders';

// You will need to create these components based on your UI library (e.g., Shadcn, Headless UI)
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
// import { GroupOrderCreationForm } from './GroupOrderCreationForm'; 
// import { InviteDialog } from './InviteDialog';

// Icons
import {
  ShareIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyRupeeIcon, // Using Rupee icon for India focus
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * @description The main dashboard for vendors to view and manage all their group orders.
 * Features include tabbed views, summary stats, and actions like creating and viewing orders.
 */
const GroupOrderManagementDashboard = () => {
  const navigate = useNavigate();
const { loading, error, listenToGroupOrders } = useGroupOrders();
  
  // State for the component
  const [allOrders, setAllOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // Use descriptive strings
  // const [isCreateOpen, setCreateOpen] = useState(false);
  // Remove invite dialog state, as it would be in its own component

  // Effect to subscribe to all relevant orders for the dashboard
  useEffect(() => {
    // This listener will fetch all orders and update in real-time.
    // We pass our local state setter `setAllOrders` to the hook.
    const unsubscribe = listenToGroupOrders(setAllOrders, 'all'); 
    
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [listenToGroupOrders]); // Dependency array is correct

  // Memoize filtered orders to prevent recalculation on every render
  const { activeOrders, closedOrders, cancelledOrders } = useMemo(() => {
    return {
      activeOrders: allOrders.filter(order => order.status === 'open'),
      closedOrders: allOrders.filter(order => order.status === 'closed'),
      cancelledOrders: allOrders.filter(order => order.status === 'cancelled')
    };
  }, [allOrders]);
  
  // --- Event Handlers ---
  // const handleCreateSuccess = (newOrderId) => {
  //   setCreateOpen(false);
  //   navigate(`/vendor/group-orders/${newOrderId}`);
  // };

  const handleViewDetails = (orderId) => {
    navigate(`/vendor/group-orders/${orderId}`);
  };

  // --- Render Logic ---

  // A simple loading spinner placeholder
  if (loading && allOrders.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  const renderOrderList = (orders, emptyMessage) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-base font-medium text-gray-900">{emptyMessage}</p>
        </div>
      );
    }
    return <div className="space-y-6">{orders.map(order => <OrderCard key={order.id} order={order} onViewDetails={handleViewDetails} />)}</div>;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ChaiMitra Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Your central hub for managing group raw material orders.</p>
        </div>
        {/* <button
          onClick={() => setCreateOpen(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create New Order
        </button> */}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md">{error}</div>}

      <DashboardStats orders={allOrders} activeCount={activeOrders.length} closedCount={closedOrders.length} />

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton name="Active" count={activeOrders.length} isActive={activeTab === 'active'} onClick={() => setActiveTab('active')} />
          <TabButton name="Closed" count={closedOrders.length} isActive={activeTab === 'closed'} onClick={() => setActiveTab('closed')} />
          <TabButton name="Cancelled" count={cancelledOrders.length} isActive={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} />
        </nav>
      </div>
      
      {/* Content */}
      <div>
        {activeTab === 'active' && renderOrderList(activeOrders, 'No active group orders found.')}
        {activeTab === 'closed' && renderOrderList(closedOrders, 'You have no closed orders.')}
        {activeTab === 'cancelled' && renderOrderList(cancelledOrders, 'You have no cancelled orders.')}
      </div>

      {/* Dialogs would be rendered here, e.g.,
      <GroupOrderCreationForm open={isCreateOpen} onClose={() => setCreateOpen(false)} onSuccess={handleCreateSuccess} /> 
      */}
    </div>
  );
};

// --- Sub-components for better organization ---

const OrderCard = ({ order, onViewDetails }) => {
  // Calculate stats based on the robust data model
const totalValue = order.products.reduce((sum, p) => sum + p.currentQuantity * p.basePrice, 0);
  const daysRemaining = order.deadline?.seconds ? Math.ceil((order.deadline.toDate() - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="md:flex md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
              <span className="flex items-center"><UserGroupIcon className="h-4 w-4 mr-1.5"/>{order.memberIDs.length} members</span>
              <span className={`flex items-center ${daysRemaining <= 2 ? 'text-red-600' : ''}`}><ClockIcon className="h-4 w-4 mr-1.5"/>{daysRemaining} days left</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex-shrink-0 flex space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"><ShareIcon className="h-5 w-5"/></button>
            <button onClick={() => onViewDetails(order.id)} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Manage</button>
          </div>
        </div>
        
        <details className="group mt-4 border-t border-gray-200">
          <summary className="flex justify-between items-center py-3 cursor-pointer list-none">
            <span className="text-sm font-medium text-gray-700">{order.products.length} products • ₹{totalValue.toFixed(2)} total value</span>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform"/>
          </summary>
          <ul className="pt-2 pb-4 space-y-3">
            {order.products.map(p => <ProductProgress key={p.productId} product={p} />)}
          </ul>
        </details>
      </div>
    </div>
  );
};

const ProductProgress = ({ product }) => (
  <li className="flex items-center justify-between text-sm">
    <div>
      <p className="font-medium text-gray-800">{product.productName}</p>
      <p className="text-gray-500">{product.currentQuantity}/{product.targetQuantity} {product.unit || 'units'}</p>
    </div>
    <div className="w-24">
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${Math.min(100, (product.currentQuantity / product.targetQuantity) * 100)}%`}}></div>
      </div>
    </div>
  </li>
);

const DashboardStats = ({ orders, activeCount, closedCount }) => {
  const totalValue = useMemo(() => orders.reduce((sum, order) => sum + order.products.reduce((pSum, p) => pSum + p.currentQuantity * p.basePrice, 0), 0), [orders]);
  const totalMembers = useMemo(() => {
    const memberSet = new Set();
    orders.forEach(o => o.memberIDs.forEach(id => memberSet.add(id)));
    return memberSet.size;
  }, [orders]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={<ShoppingCartIcon />} title="Active Orders" value={activeCount} color="blue" />
      <StatCard icon={<UserGroupIcon />} title="Total Members" value={totalMembers} color="green" />
      <StatCard icon={<CurrencyRupeeIcon />} title="Total Value Pooled" value={`₹${totalValue.toFixed(0)}`} color="yellow" />
      <StatCard icon={<CheckCircleIcon />} title="Completed Orders" value={closedCount} color="purple" />
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colors[color]}`}>{React.cloneElement(icon, { className: 'h-6 w-6' })}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const TabButton = ({ name, count, isActive, onClick }) => (
  <button onClick={onClick} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
    {name}
    <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}`}>{count}</span>
  </button>
);

export default GroupOrderManagementDashboard;