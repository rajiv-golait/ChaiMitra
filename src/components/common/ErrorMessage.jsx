import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const ErrorMessage = ({ 
  message, 
  title,
  onRetry, 
  retryText,
  variant = 'error',
  showIcon = true,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const { t } = useTranslation();
  
  const variants = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-700',
      icon: '❌',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      icon: '⚠️',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: 'ℹ️',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };
  
  const config = variants[variant] || variants.error;
  
  return (
    <div className={`border px-4 py-3 rounded-lg ${config.container} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {showIcon && (
            <span className="text-lg flex-shrink-0 mt-0.5">{config.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-medium text-sm mb-1">{title}</h3>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  config.button
                }`}
              >
                {retryText || t('common.retry')}
              </button>
            )}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-lg hover:opacity-70 transition-opacity"
            aria-label={t('common.dismiss')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
