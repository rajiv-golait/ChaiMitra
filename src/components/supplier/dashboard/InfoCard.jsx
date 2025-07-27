import React from 'react';

const InfoCard = ({ icon, title, children }) => (
  <div className="bg-gray-50 rounded-xl p-6 border border-green-200">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-sm text-gray-600">{children}</p>
  </div>
);

export default InfoCard;

