import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const bgColors = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
};

const Notification = ({ type = 'info', message, onDismiss }) => {
  return (
    <div 
      className={`p-4 rounded-md flex items-start gap-3 w-full my-2 shadow-sm ${bgColors[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        {message}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:opacity-75">
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Notification;
