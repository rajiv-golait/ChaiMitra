// components/common/VerifiedBadge.jsx
import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const VerifiedBadge = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="inline-flex items-center" title="Verified Seller">
      <CheckBadgeIcon className={`${sizeClasses[size]} text-blue-500`} />
    </div>
  );
};

export default VerifiedBadge;