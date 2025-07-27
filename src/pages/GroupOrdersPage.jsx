import React, { useState } from 'react';
import GroupOrderManagementDashboard from '../components/vendor/GroupOrderManagementDashboard';
import GroupOrderList from '../components/vendor/GroupOrderList';

const GroupOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('manage');

    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'manage'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Manage My Group Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'join'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Join a Group Order
                    </button>
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'manage' && <GroupOrderManagementDashboard />}
                {activeTab === 'join' && <GroupOrderList filterType="open" />}
            </div>
        </div>
    );
}

export default GroupOrdersPage;

