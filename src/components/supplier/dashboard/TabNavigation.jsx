import React from 'react';

const TabNavigation = ({ tabs, activeTab, setActiveTab }) => (
<div className="flex items-center gap-1 p-1 bg-white rounded-xl shadow-md overflow-x-auto" role="tablist">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm sm:text-base font-semibold transition-colors duration-200 rounded-lg ${
                    activeTab === tab.id 
                        ? 'bg-green-500 text-white' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
            >
                {tab.icon} {tab.label}
            </button>
        ))}
    </div>
);

export default TabNavigation;

